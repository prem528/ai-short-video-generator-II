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
    images: [],
    topic: "",
    imageStyle: "",
    duration: "",
  });
  const [loadingState, setLoadingState] = useState(false);
  const [videoScript, setVideoScript] = useState();

  const FILE_URL = "https://assembly.ai/sports_injuries.mp3"; // For testing

  // Handle changes to form fields
  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
    console.log(fieldName, fieldValue);
  };

  // Handle the create create video button:
  const onCreateClickHandler = () => {
    // getVideoScript();
    generateAudioCaptions(FILE_URL); // TESTING
  };

  // Get the video script based on the form data:
  const getVideoScript = async () => {
    setLoadingState(true);

    // Prompt for video script:

    const prompt = `
  Write a script to generate a video with a duration of "${
    formData.duration
  }" on the topic: "${formData.topic}".
  The video should include a detailed breakdown of each scene, based on the title "${
    formData.title
  }" and the description "${formData.description}".
  For each scene, ensure the following:
  1. **AI-Generated Image**: Create a detailed image prompt for "${
    formData.title
  }" in the "${
      formData.imageStyle
    }" style. The image should visually highlight key features relevant to the scene and incorporate elements from the provided references: ${formData.images.join(
      ", "
    )}. Ensure the image aligns thematically with the video's topic and scene description.
  2. **Content Text**: Provide a clear and engaging narrative text that describes the scene. It should:
     - Align closely with the topic, title, and description.
     - Highlight key points and maintain thematic consistency.
     - Be concise, informative, and suitable for the intended video duration.

  Ensure the output adheres to the following JSON structure:
  [
    {
      "imagePrompt": "Detailed prompt for generating the image",
      "contentText": "Description text for the scene"
    },
    ...
  ]
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

  // Generating speech from the textData:

  // Generating the captions for the video:
  const generateAudioCaptions = async (fileUrl) => {
    try {
      // Set loading state to true
      setLoadingState(true);

      // Make API call
      const response = await axios.post("/api/generate-caption", {
        audioFileUrl: fileUrl,
      });

      // Log the result
      console.log(response.data.result);
    } catch (error) {
      // Handle error
      console.error("Error generating captions:", error);

      // Optionally, display an error message to the user
      alert("Failed to generate captions. Please try again later.");
    } finally {
      // Ensure loading state is reset
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
