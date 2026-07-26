import { NextResponse } from "next/server";
import fs from "fs";
import puppeteer from "puppeteer";

// Resolve a usable Chrome/Chromium binary. Puppeteer's bundled browser may not
// be downloaded (npx puppeteer browsers install chrome), so fall back to a
// system install. Override with PUPPETEER_EXECUTABLE_PATH in production.
const getExecutablePath = () => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates = [
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ];
  for (const path of candidates) {
    if (fs.existsSync(path)) return path;
  }
  // Fall back to puppeteer's own download (if present).
  try {
    return puppeteer.executablePath();
  } catch {
    return undefined;
  }
};

// Turn a long marketing title into a concise product name, e.g.
// "Apple iPhone Air 1 TB: Thinnest iPhone Ever, ... ; Sky Blue"
//   -> "Apple iPhone Air 1 TB"
const cleanTitle = (t) => {
  if (!t) return t;
  let s = t.replace(/\s+/g, " ").trim();
  // Cut at the first strong separator (colon, pipe, bullet, dash, semicolon).
  const head = s.split(/\s*[:|•·–—;]\s*/)[0];
  if (head && head.length >= 3) s = head;
  // Drop a trailing "(colour, specs…)" group.
  s = s.replace(/\s*\([^)]*\)\s*$/, "").trim();
  // Still a mouthful? Keep only the first clause.
  if (s.length > 60) s = s.split(",")[0].trim();
  // Avoid leaving a dangling, unclosed parenthesis.
  if (s.includes("(") && !s.includes(")")) s = s.split("(")[0].trim();
  // Hard cap as a last resort.
  if (s.length > 80) s = s.slice(0, 80).trim() + "…";
  return s;
};

export async function POST(request) {
  let browser;
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "No URL provided", success: false },
        { status: 400 }
      );
    }

    browser = await puppeteer.launch({
      headless: "new",
      executablePath: getExecutablePath(),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    // A real UA reduces bot-blocking on many product pages.
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );

    // Navigate to the provided URL
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Nudge lazy-loaded gallery images into the DOM before scraping.
    try {
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 600));
        window.scrollTo(0, 0);
      });
    } catch {}

    // Scrape the data
    const data = await page.evaluate(() => {
      const abs = (u) => {
        try {
          return new URL(u, location.href).href;
        } catch {
          return null;
        }
      };
      const getInnerText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : null;
      };

      // ---------- Title & description ----------
      const title =
        getInnerText("#productTitle") || // Amazon
        getInnerText("#title") ||
        getInnerText("h1") ||
        getInnerText(".product-title") ||
        getInnerText(".product-name") ||
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content") ||
        document.title ||
        null;

      const description =
        getInnerText("#productDescription") ||
        getInnerText("#feature-bullets") ||
        getInnerText("#productOverview_feature_div") ||
        getInnerText(".product-description") ||
        getInnerText(".description") ||
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") ||
        document
          .querySelector('meta[property="og:description"]')
          ?.getAttribute("content") ||
        null;

      // Obvious site-chrome that is never product photography. Applied even to
      // structured sources, since some pages set their logo as og:image.
      const CHROME =
        /(logo|sprite|favicon|placeholder|spinner|loading|default[-_.]|1x1|blank)/i;

      // ---------- Structured images (most reliable = actual product) ----------
      // 1) JSON-LD Product.image  2) og:image / twitter:image
      const structured = [];
      document
        .querySelectorAll('script[type="application/ld+json"]')
        .forEach((s) => {
          try {
            const json = JSON.parse(s.textContent);
            const nodes = Array.isArray(json)
              ? json
              : json["@graph"] || [json];
            nodes.forEach((node) => {
              if (!node || typeof node !== "object") return;
              const types = [].concat(node["@type"] || []);
              if (types.some((t) => /product/i.test(String(t))) && node.image) {
                const imgs = Array.isArray(node.image)
                  ? node.image
                  : [node.image];
                imgs.forEach((im) => {
                  const u = typeof im === "string" ? im : im?.url;
                  const a = u && abs(u);
                  if (a) structured.push(a);
                });
              }
            });
          } catch {}
        });
      document
        .querySelectorAll(
          'meta[property="og:image"], meta[property="og:image:url"], meta[property="og:image:secure_url"], meta[name="twitter:image"]'
        )
        .forEach((m) => {
          const a = abs(m.getAttribute("content"));
          if (a) structured.push(a);
        });

      // Amazon serves the size in the filename (e.g. ._AC_SX679_.jpg or
      // ._SX35_SY46.jpg). Strip that modifier to get the full-resolution
      // original, which also collapses same-image duplicates.
      const upscale = (u) =>
        u ? u.replace(/\._[A-Z][A-Za-z0-9,_-]*?\.(jpe?g|png|webp)/, ".$1") : u;

      // ---------- Amazon main gallery (the real product photos) ----------
      // #landingImage carries a data-a-dynamic-image JSON map of URL -> [w,h],
      // and #altImages holds the thumbnail strip. These are the product images,
      // NOT the review photos further down the page.
      document
        .querySelectorAll(
          "#landingImage, #imgBlkFront, #main-image, img[data-a-dynamic-image]"
        )
        .forEach((img) => {
          const dyn = img.getAttribute("data-a-dynamic-image");
          if (dyn) {
            try {
              Object.keys(JSON.parse(dyn)).forEach((u) => {
                const a = abs(u);
                if (a) structured.push(upscale(a));
              });
            } catch {}
          }
          const hires = img.getAttribute("data-old-hires");
          if (hires) structured.push(upscale(abs(hires)));
        });
      document
        .querySelectorAll(
          "#altImages img, li.imageThumbnail img, .a-button-thumbnail img"
        )
        .forEach((img) => {
          const u = img.getAttribute("src");
          if (u && !u.startsWith("data:")) structured.push(upscale(abs(u)));
        });

      // ---------- Heuristic gallery images (filtered fallback) ----------
      // Reject anything that reads like chrome, not product photography.
      const JUNK =
        /(logo|icon|sprite|avatar|banner|advert|\bads?\b|pixel|tracking|beacon|badge|payment|social|placeholder|spinner|loading|flag|rating|\bstar\b|thumb-|swatch|captcha)/i;

      // Page regions that are NOT the product: reviews, "customers also viewed",
      // recommendations, sponsored strips, and site chrome. Images inside these
      // are skipped so we don't pull review photos when a gallery exists.
      const EXCLUDE_SELECTOR =
        '[id*="review" i],[class*="review" i],[data-hook*="review"],#cm-cr-dp-review-list,#reviewsMedia,[id*="related" i],[class*="related" i],[id*="recommend" i],[class*="recommend" i],[id*="similar" i],[class*="similar" i],[class*="also-viewed" i],[class*="sponsored" i],[id*="sponsored" i],[class*="crosssell" i],[class*="upsell" i],[aria-label*="review" i],header,footer,nav';

      const bestUrl = (img) => {
        const srcset = img.getAttribute("srcset");
        if (srcset) {
          let best = null;
          let bestW = -1;
          srcset.split(",").forEach((part) => {
            const [u, d] = part.trim().split(/\s+/);
            const w = d && d.endsWith("w") ? parseInt(d, 10) : 0;
            if (u && w >= bestW) {
              bestW = w;
              best = u;
            }
          });
          if (best) return best;
        }
        return (
          img.getAttribute("src") ||
          img.getAttribute("data-src") ||
          img.getAttribute("data-lazy-src") ||
          img.getAttribute("data-original") ||
          img.getAttribute("data-zoom-image")
        );
      };

      const gallerySelector =
        '[id*="product" i],[class*="product" i],[id*="gallery" i],[class*="gallery" i],[id*="carousel" i],[class*="carousel" i],[id="landingImage"],[class*="main-image" i],[class*="media" i]';

      const heuristic = [];
      document.querySelectorAll("img").forEach((img) => {
        // Skip anything living in a reviews / recommendations / chrome region.
        if (img.closest(EXCLUDE_SELECTOR)) return;

        const raw = bestUrl(img);
        if (!raw || raw.startsWith("data:")) return;
        const a = upscale(abs(raw));
        if (!a || /\.svg(\?|$)/i.test(a)) return;
        const hay = `${a} ${img.className} ${img.id} ${img.alt || ""}`;
        if (JUNK.test(hay)) return;

        const w = img.naturalWidth || parseInt(img.getAttribute("width")) || 0;
        const h = img.naturalHeight || parseInt(img.getAttribute("height")) || 0;
        const inGallery = !!img.closest(gallerySelector);
        // Drop small images unless they live in a product/gallery container.
        if (((w && w < 200) || (h && h < 200)) && !inGallery) return;

        heuristic.push({ url: a, area: w * h, inGallery });
      });
      // Gallery matches first, then largest area.
      heuristic.sort(
        (x, y) => y.inGallery - x.inGallery || y.area - x.area
      );

      // ---------- Merge + dedupe (structured wins order) ----------
      const images = [];
      const seen = new Set();
      [...structured, ...heuristic.map((h) => h.url)].forEach((raw) => {
        if (!raw || CHROME.test(raw)) return; // drop logos/placeholders
        const u = upscale(raw); // normalise every source to full resolution
        // Dedupe by filename so the same image on different CDN hosts (common on
        // Amazon: m.media-amazon vs images-eu.ssl-images-amazon) collapses.
        const key = u.split("?")[0].split("/").pop() || u;
        if (!seen.has(key)) {
          seen.add(key);
          images.push(u);
        }
      });

      // ---------- Product video ----------
      let video = null;
      const ogv = document.querySelector(
        'meta[property="og:video:secure_url"], meta[property="og:video:url"], meta[property="og:video"]'
      );
      if (ogv) video = abs(ogv.getAttribute("content"));
      if (!video) {
        const v = document.querySelector("video source[src], video[src]");
        if (v) video = abs(v.getAttribute("src"));
      }

      return { title, description, images: images.slice(0, 12), video };
    });

    data.title = cleanTitle(data.title);

    return NextResponse.json({ ...data, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error during scraping:", error);
    return NextResponse.json(
      {
        error: "Failed to scrape the page.",
        details: error?.message,
        success: false,
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}
