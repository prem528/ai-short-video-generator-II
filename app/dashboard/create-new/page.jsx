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

function CreateNew() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [imageList, setImageList] = useState([]);
  const [imageUrlList, setImageUrlList] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [videoScript, setVideoScript] = useState();

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

  // Handle the create create video button:
  const onNextClickHandler = async () => {
    try {
      // Wait for getVideoScript to complete
      if (!userData?.credits > 0) {
        // Alert user if he dosen't have sufficient credits.
        toast({
          title: "Error",
          description: "Insufficient credits. Please add more credits.",
        });
      }

      setVideoData((prev) => ({
        ...prev,
        title: formData.title,
        language: formData.language,
        gender: formData.gender,
      }));

      await getVideoScript();
    } catch (error) {
      console.error("Error in onNextClickHandler:", error);
    }
  };

  // Get the video script based on the form data:
  const getVideoScript = async () => {
    setLoadingState(true);

    await uploadImagesToFirebase(imageList);

    const prompt = `
    Write a high-quality script for a video with a duration of "${formData.duration}" on the topic "${formData.topic}" in "${formData.language}" language.  

    ### **Structure & Requirements:**  
    - The script should be divided into **"${imageList.length}" scenes**, each containing engaging, well-structured, and concise narration.  
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
    } catch (error) {
      console.error("Error fetching video script:", error);
    } finally {
      setLoadingState(false);
    }
  };

  // Function to upload images to firebase:
  const uploadImagesToFirebase = async (imageList) => {
    let images = [];

    if (!Array.isArray(imageList) || imageList.length === 0) {
      alert(
        "The image list is empty or invalid. Please provide a valid list of images."
      );
      setLoadingState(false);
    }

    for (const image of imageList) {
      // Create a unique path for each image
      const imageRef = ref(
        storage,
        `ai-video-file/${Date.now()}_${image.name}`
      );

      try {
        // Upload the image to Firebase Storage
        const snapshot = await uploadBytes(imageRef, image);

        // Get the downloadable URL
        const downloadUrl = await getDownloadURL(snapshot.ref);

        images.push(downloadUrl);
      } catch (error) {
        console.error(`Error uploading image ${image.name}:`, error);
      } finally {
        setImageUrlList(images);
        setVideoData((prev) => ({
          ...prev,
          imageList: images,
        }));
      }
    }
  };

  return (
    <div className="md:px-20 py-10">
      <h2 className="font-bold text-4xl text-primary text-center">
        Create New
      </h2>
      <div className="mt-10 p-10 relative border animate-shadow-pulse rounded-xl ">
        {/* Enter URL */}
        <UrlBox
          onUserSelect={(data) => setFormData((prev) => ({ ...prev, ...data }))}
        />

        {/* Product Name */}
        <ProductName
          value={formData.title}
          onValueChange={(newTitle) => onHandleInputChange("title", newTitle)}
        />

        {/* Product Description */}
        <ProductDescription
          value={formData.description}
          onValueChange={(newDescription) =>
            onHandleInputChange("description", newDescription)
          }
        />

        {/* Upload Media */}
        <AddMedia onMediaChange={handleMediaChange} />

        {/* Select Topic */}
        <SelectTopic onUserSelect={onHandleInputChange} />

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Select Gender */}
          <div className="w-full">
            <SelectGender onUserSelect={onHandleInputChange} />
          </div>

          {/* Select Language */}
          <div className="w-full">
            <SelectLanguage onUserSelect={onHandleInputChange} />
          </div>
        </div>

        {/* Select Duration */}
        <SelectDuration onUserSelect={onHandleInputChange} />

        {/* Create Button */}
        <div className="flex justify-center mt-5">
          <Link href={"/dashboard/create-new/editor"}>
            <Button
              className="flex items-center rounded-full"
              onClick={onNextClickHandler}
            >
              Next
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading Screen */}
      <CustomLoading loading={loadingState} />
    </div>
  );
}

export default CreateNew;
