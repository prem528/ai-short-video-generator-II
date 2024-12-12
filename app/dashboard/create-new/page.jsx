"use client";

import React, { useContext, useState } from "react";
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
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import PlayerDialog from "../_components/PlayerDialog";

function CreateNew() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [],
    topic: "",
    imageStyle: "",
    duration: "",
  });

  const [imageList, setImageList] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [videoScript, setVideoScript] = useState();
  const [audioFileUrl, setAudioFileUrl] = useState();
  const [captions, setCaptions] = useState();
  const { videoData, setVideoData } = useContext(VideoDataContext);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoId] = useState();

  const fileUrl = "https://assembly.ai/wildfires.mp3";

  // Handle changes to form fields
  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  // Handle the create create video button:
  const onCreateClickHandler = () => {
    getVideoScript();
    // generateAudioCaptions(FILE_URL); // For testing
  };

  // Handle image uploads
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setImageList((prev) => [...prev, ...files]);
  };

  // Handle deleting an image
  const handleImageDelete = (index) => {
    // Remove from imageList (File objects)
    setImageList((prev) => {
      return prev.filter((file, i) => i !== index);
    });
  };

  // Get the video script based on the form data:
  const getVideoScript = async () => {
    setLoadingState(true);

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
  const generateAudioFile = () => {};

  // Generating the captions for the video:
  const generateAudioCaptions = async (fileUrl) => {
    try {
      setLoadingState(true);
      const response = await axios.post("/api/generate-caption", {
        audioFileUrl: fileUrl,
      });
      console.log(response.data.result);
    } catch (error) {
      console.error("Error generating captions:", error);
      alert("Failed to generate captions. Please try again later.");
    } finally {
      setLoadingState(false);
    }
  };

  // Generating the images for the video:
  const generateImage = () => {};

  // Saving the video data into the database:
  const saveVideoData = async (videoData) => {
    setLoadingState(true);

    const result = await db
      .insert(videoData)
      .values({
        script: videoData?.videoScript,
        audioFileUrl: videoData?.audioFileUrl,
        captions: videoData?.captions,
        imageList: videoData?.imageList,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      })
      .returning({ id: videoData?.id });

    setVideoId(result[0].id);
    setPlayVideo(true);

    console.log(result);

    setLoadingState(false);
  };

  return (
    <div className="mt-10 md:px-20">
      <h2 className="font-bold text-4xl text-primary text-center">
        Create New
      </h2>
      <div className="mt-5 shadow-md p-10">
        {/* Enter URL */}
        <UrlBox
          onUser
          Select={(data) => setFormData((prev) => ({ ...prev, ...data }))}
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
          images={formData.images} // Pass image URLs for display
          setImages={(newImages) => onHandleInputChange("images", newImages)}
          imageList={imageList} // Pass file objects
          setImageList={setImageList} // Pass the setter function for imageList
          handleImageUpload={handleImageUpload} // Pass the image upload handler
          handleImageDelete={handleImageDelete} // Pass the delete handler
        />

        {/* Select Topic */}
        <SelectTopic
          onUser
          Select={(topic) => onHandleInputChange("topic", topic)}
        />

        {/* Select Style */}
        <SelectStyle
          onUser
          Select={(style) => onHandleInputChange("imageStyle", style)}
        />

        {/* Duration */}
        <SelectDuration
          onUser
          Select={(duration) => onHandleInputChange("duration", duration)}
        />

        {/* Create Button */}
        <Button className="mt-5 w-full" onClick={onCreateClickHandler}>
          Create Video
        </Button>
      </div>

      {/* Loading Screen */}
      <CustomLoading loading={loadingState} />

      <PlayerDialog playVideo={playVideo} videoId={videoId} />
    </div>
  );
}

export default CreateNew;
