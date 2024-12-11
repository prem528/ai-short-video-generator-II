import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        error: "No URL provided",
        success: false,
        status: 400,
      });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the provided URL
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Scrape the data
    const data = await page.evaluate(() => {
      // Function to safely get inner text or null
      const getInnerText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : null;
      };

      // Function to get image sources
      const getImageSources = () => {
        return Array.from(document.querySelectorAll("img"))
          .map((img) => img.getAttribute("src"))
          .filter(
            (src) => !!src && (src.includes("product") || src.includes("image"))
          );
      };

      // Generalized selectors for title, description, and images
      const title =
        getInnerText("title") ||
        getInnerText("h1") ||
        getInnerText(".product-title") ||
        getInnerText(".product-name");

      const description =
        getInnerText("#productDescription") ||
        getInnerText("#feature-bullets") ||
        getInnerText("#productOverview_feature_div") ||
        getInnerText(".product-description") ||
        getInnerText(".description");

      const images = Array.from(document.querySelectorAll("img"))
        .filter((img) => {
          return (
            img.classList.contains("imageBlock") ||
            img.closest(".altImages") ||
            img.getAttribute("src")?.includes("product") ||
            img.id === "landingImage"
          );
        })
        .map((img) => img.getAttribute("src"))
        .filter((src) => !!src);

      console.log(images);

      return { title, description, images };
    });

    await browser.close();

    return NextResponse.json({
      ...data,
      success: true,
      status: 200,
    });
  } catch (error) {
    console.error("Error during scraping:", error);
    return NextResponse.json({
      error: "Failed to scrape the page.",
      success: false,
      status: 500,
    });
  }
}
