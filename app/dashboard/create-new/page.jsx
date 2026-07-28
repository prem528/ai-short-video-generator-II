"use client";

import React, { useContext, useState } from "react";
import SelectTopic from "./_components/SelectTopic";
import SelectDuration from "./_components/SelectDuration";
import { Button } from "@/components/ui/button";
import axios from "axios";
import CustomLoading from "../../../components/CustomLoading";
import UrlBox from "./_components/UrlBox";
import ProductName from "./_components/ProductName";
import ProductDescription from "./_components/ProductDescription";
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import AddMedia from "./_components/AddMedia";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../configs/FirebaseConfig.js";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import SelectGender from "./_components/SelectGender";
import SelectLanguage from "./_components/SelectLanguage";
import { UserDetailContext } from "@/app/_context/userDataContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Link2 as LinkIcon, Plus, Sparkles } from "lucide-react";
import { ArrowLeft, Check, Link2 as LinkIcon, Plus, Sparkles } from "lucide-react";

function CreateNew() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [imageList, setImageList] = useState([]);
  const [imageUrlList, setImageUrlList] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [videoScript, setVideoScript] = useState();

  // Product images scraped from the URL, and which of them the user picked.
  const [scrapedImages, setScrapedImages] = useState([]);
  const [selectedScrapedImages, setSelectedScrapedImages] = useState([]);

  const { videoData, setVideoData } = useContext(VideoDataContext);
  const { userData, setUserData } = useContext(UserDetailContext);

  const { user } = useUser();
  const { toast } = useToast();

  // Handle changes to form fields
  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  // Handle changes in media field
  const handleMediaChange = (newImageList) => {
    setImageList(newImageList);
  };

  // Handle a URL scrape result: fill text fields + collect product images.
  const handleScrape = (data) => {
    setFormData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      description: data.description || prev.description,
    }));

    const images = Array.isArray(data.images) ? data.images : [];
    setScrapedImages(images);
    setSelectedScrapedImages(images); // pre-select everything found

    if (images.length) {
      toast({
        title: `Found ${images.length} product image${
          images.length === 1 ? "" : "s"
        }`,
        description: "Pick which ones to use as scenes below.",
      });
    }
  };

  // Toggle a scraped image in/out of the selected set.
  const toggleScrapedImage = (url) => {
    setSelectedScrapedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  // Handle the create create video button:
  const onNextClickHandler = async () => {
    try {
      if (userData && userData.credits <= 0) {
        toast({
          title: "Error",
          description: "Insufficient credits. Please add more credits.",
        });
        return;
      }

      setVideoData((prev) => ({
        ...prev,
        title: formData.title,
        language: formData.language,
        gender: formData.gender,
      }));

      const success = await getVideoScript();
      if (success) {
        router.push("/dashboard/create-new/editor");
      }
    } catch (error) {
      console.error("Error in onNextClickHandler:", error);
    }
  };

  // Get the video script based on the form data:
  const getVideoScript = async () => {
    setLoadingState(true);

    // Uploaded files -> Firebase URLs, then append the picked scraped images.
    const uploadedUrls = await uploadImagesToFirebase(imageList);
    const finalImages = [...uploadedUrls, ...selectedScrapedImages];

    if (finalImages.length === 0) {
      toast({
        title: "Add at least one image",
        description: "Upload a photo or pick a product image from the URL.",
      });
      setLoadingState(false);
      return false;
    }

    // Persist the final scene images (uploads + scraped) for the render.
    setImageUrlList(finalImages);
    setVideoData((prev) => ({ ...prev, imageList: finalImages }));
    // Uploaded files -> Firebase URLs, then append the picked scraped images.
    const uploadedUrls = await uploadImagesToFirebase(imageList);
    const finalImages = [...uploadedUrls, ...selectedScrapedImages];

    if (finalImages.length === 0) {
      toast({
        title: "Add at least one image",
        description: "Upload a photo or pick a product image from the URL.",
      });
      setLoadingState(false);
      return false;
    }

    // Persist the final scene images (uploads + scraped) for the render.
    setImageUrlList(finalImages);
    setVideoData((prev) => ({ ...prev, imageList: finalImages }));

    const prompt = `
    Write a high-quality script for a video with a duration of "${formData.duration}" on the topic "${formData.topic}" in "${formData.language}" language.
    Write a high-quality script for a video with a duration of "${formData.duration}" on the topic "${formData.topic}" in "${formData.language}" language.

    ### **Structure & Requirements:**
    - The script should be divided into **"${finalImages.length}" scenes**, each containing engaging, well-structured, and concise narration.
    ### **Structure & Requirements:**
    - The script should be divided into **"${finalImages.length}" scenes**, each containing engaging, well-structured, and concise narration.
    - Use the following reference data:  
      - **Title:** "${formData.title}"  
      - **Description:** "${formData.description}"  

    ### **Key Writing Guidelines:**  
    - Ensure the script is **clear, engaging, and easy to understand**.
    - Ensure the script doesn't exceed over a 100 words at most.
    - Use **short, impactful sentences** that fit within the given video duration.  
    - The script should be **grammatically accurate** and naturally flow in **"${formData.language}"**.  
    - Maintain **thematic consistency** and **logical progression** across scenes.  
    - Each scene should be **self-contained yet contribute to the overall narrative**.  
    - Keep the tone **informative yet captivating**, making it engaging for viewers.

      The output should follow this JSON format:
      [
        {  
          "contentText": "Description for the scene" 
        },
        ...
      ]
    `;

    try {
      const resp = await axios.post("/api/get-video-script", {
        prompt: prompt,
      });

      setVideoData((prev) => ({
        ...prev,
        videoScript: resp.data.result,
      }));

      setVideoScript(resp.data.result);
      return true;
    } catch (error) {
      console.error("Error fetching video script:", error);
      toast({
        title: "Error",
        description: "Failed to generate video script. Please try again.",
      });
      return false;
    } finally {
      setLoadingState(false);
    }
  };

  // Upload user-selected files to Firebase and return their public URLs.
  const uploadImagesToFirebase = async (files) => {
    const images = [];
    if (!Array.isArray(files) || files.length === 0) return images;

    for (const image of files) {
      const imageRef = ref(storage, `ai-video-file/${Date.now()}_${image.name}`);
  // Upload user-selected files to Firebase and return their public URLs.
  const uploadImagesToFirebase = async (files) => {
    const images = [];
    if (!Array.isArray(files) || files.length === 0) return images;

    for (const image of files) {
      const imageRef = ref(storage, `ai-video-file/${Date.now()}_${image.name}`);
      try {
        const snapshot = await uploadBytes(imageRef, image);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        images.push(downloadUrl);
      } catch (error) {
        console.error(`Error uploading image ${image.name}:`, error);
      }
    }
    return images;
    return images;
  };

  const credits = userData?.credits ?? 0;

  const credits = userData?.credits ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      {/* Page header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className="h-9 w-[3px] rounded-full bg-gradient-to-b from-brand to-brand-2" />
          <div>
            <span className="timecode text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              New Project
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Create a new video
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Section 1 — Source */}
        <Section
          index="01"
          title="Source"
          description="Autofill from a product URL, or write the details yourself."
        >
          <UrlBox onUserSelect={handleScrape} />
          <ProductName
            value={formData.title}
            onValueChange={(newTitle) => onHandleInputChange("title", newTitle)}
          />
          <ProductDescription
            value={formData.description}
            onValueChange={(newDescription) =>
              onHandleInputChange("description", newDescription)
            }
          />
        </Section>

        {/* Section 2 — Media */}
        <Section
          index="02"
          title="Media"
          description="Each image becomes one scene in the final short."
        >
          <AddMedia onMediaChange={handleMediaChange} />

          {scrapedImages.length > 0 && (
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-brand" />
                  <span className="text-sm font-medium text-foreground">
                    Product images from the URL
                  </span>
                </div>
                <span className="timecode text-[11px] text-muted-foreground">
                  {selectedScrapedImages.length}/{scrapedImages.length} selected
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Tap to include or exclude. Selected images are added as scenes.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {scrapedImages.map((url, index) => {
                  const selected = selectedScrapedImages.includes(url);
                  return (
                    <button
                      type="button"
                      key={index}
                      onClick={() => toggleScrapedImage(url)}
                      aria-pressed={selected}
                      className={`group relative aspect-[9/16] overflow-hidden rounded-lg border-2 transition-all ${
                        selected
                          ? "border-brand ring-2 ring-brand/30"
                          : "border-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white transition-colors ${
                          selected ? "bg-brand" : "bg-black/50"
                        }`}
                      >
                        {selected ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Section>

        {/* Section 3 — Script & voice */}
        <Section
          index="03"
          title="Script & voice"
          description="Choose the style, voice, and length of your video."
        >
          <SelectTopic onUserSelect={onHandleInputChange} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectGender onUserSelect={onHandleInputChange} />
            <SelectLanguage onUserSelect={onHandleInputChange} />
          </div>
          <SelectDuration onUserSelect={onHandleInputChange} />
        </Section>

        {/* Action bar */}
        <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Generating uses{" "}
            <span className="font-medium text-foreground">1 credit</span> ·{" "}
            <span className="timecode text-foreground">{credits}</span> remaining
          </p>
          <Button
            className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={onNextClickHandler}
            disabled={loadingState}
          >
            <Sparkles className="h-4 w-4" />
            {loadingState ? "Generating…" : "Generate video"}
          </Button>
        </div>
      </div>

      {/* Loading Screen */}
      <CustomLoading loading={loadingState} />
    </div>
  );
}

/** Numbered form section — the steps are a real top-to-bottom sequence. */
function Section({ index, title, description, children }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="timecode mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand/10 text-[11px] font-semibold text-brand">
          {index}
        </span>
        <div>
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** Numbered form section — the steps are a real top-to-bottom sequence. */
function Section({ index, title, description, children }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="timecode mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand/10 text-[11px] font-semibold text-brand">
          {index}
        </span>
        <div>
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export default CreateNew;
