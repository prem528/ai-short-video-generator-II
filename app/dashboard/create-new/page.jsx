"use client";

import React, { useState } from "react";
import SelectTopic from "./_components/SelectTopic";
import SelectStyle from "./_components/SelectStyle";
import SelectDuration from "./_components/SelectDuration";
import { Button } from "@/components/ui/button";
import axios from "axios";
import CustomLoading from "./_components/CustomLoading";
import UrlBox from "./_components/UrlBox";
import ProductName from "./_components/ProductName";
import ProductDescription from "./_components/ProductDescription";
import MediaBox from "./_components/MediaBox";

function CreateNew() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [], // Hold images here
    topic: "",
    imageStyle: "",
    duration: "",
  });
  const [loadingState, setLoadingState] = useState(false);
  const [videoScript, setVideoScript] = useState();

  // Handle changes to form fields
  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
    console.log(fieldName, fieldValue);
  };

  const onCreateClickHandler = () => {
    getVideoScript();
  };

  // Get the video script based on the form data
  const getVideoScript = async () => {
    setLoadingState(true);

    const prompt = `
  Write a script to generate a ${formData.duration} video on the topic: "${
      formData.topic
    }". 
  The video should include a detailed description for each scene based on the title "${
    formData.title
  }" and the description "${formData.description}".
  For each scene, include the following:
  1. A detailed AI avatar that will narrate the topic "${
    formData.topic
  }". Provide its image prompt in the "${
      formData.imageStyle
    }" style, incorporating details from the provided images: ${formData.images.join(
      ", "
    )}.
  2. Contextual contentText that aligns with the scene description, highlighting key points from the topic, title, and description.
  Provide results in JSON format with the following structure:
  {
    "imagePrompt": "AI avatar image narrating the description for the scene",
    "contentText": "Contextual description for the scene"
  }
`;

    try {
      const response = await axios.post("/api/get-video-script", {
        prompt: prompt.trim(),
      });
      setVideoScript(response.data.result);
      console.log(response.data.result);
    } catch (error) {
      console.error("Error fetching video script:", error);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="mt-5 md:px-20">
      <h2 className="font-bold text-4xl text-primary text-center">
        Create New
      </h2>
      <div className="mt-10 shadow-md p-10">
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
        <MediaBox
          images={formData.images}
          setImages={(newImages) => onHandleInputChange("images", newImages)}
        />

        {/* Select Topic */}
        <SelectTopic
          onUserSelect={(topic) => onHandleInputChange("topic", topic)}
        />

        {/* Select Style */}
        <SelectStyle
          onUserSelect={(style) => onHandleInputChange("imageStyle", style)}
        />

        {/* Duration */}
        <SelectDuration
          onUserSelect={(duration) => onHandleInputChange("duration", duration)}
        />

        {/* Create Button */}
        <Button className="mt-5 w-full" onClick={onCreateClickHandler}>
          Create Video
        </Button>
      </div>

      {/* Loading Screen */}
      <CustomLoading loading={loadingState} />
    </div>
  );
}

export default CreateNew;
