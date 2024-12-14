"use client";

import React, { useContext, useEffect, useState } from "react";
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
import { v4 as uuidv4 } from "uuid";
import AddMedia from "./_components/AddMedia";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
} from "firebase/storage";
import { storage } from "../../../configs/FirebaseConfig.js";

function CreateNew() {
  // storing form data:
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // storing images from user:
  const [imageList, setImageList] = useState([]);

  const [loadingState, setLoadingState] = useState(false);

  const [videoScript, setVideoScript] = useState();

  const [audioFileUrl, setAudioFileUrl] = useState();

  const [captions, setCaptions] = useState();

  const { videoData, setVideoData } = useContext(VideoDataContext);

  const [playVideo, setPlayVideo] = useState(false);

  const [videoId, setVideoId] = useState();

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
  const onCreateClickHandler = () => {
    getVideoScript();
    generateAudioFile(videoScript);
    uploadToFirebase(imageList);
  };

  // Get the video script based on the form data:
  const getVideoScript = async () => {
    setLoadingState(true);

    const prompt = `
  Write a script for a video with a duration of "${formData.duration}" on the topic "${formData.topic}". 
  The script should include a breakdown of "${imageList.length}" scenes, based on the title "${formData.title}" and description "${formData.description}". 
  For each scene, generate the following:

  **Content Text**: A concise, engaging narrative that:
    - Aligns with the topic, title, and description.
    - Highlights key points and maintains thematic consistency.
    - Is informative, clear, and appropriate for the video's duration.

  The output should follow this JSON format:
  [
    {  
      "contentText": "Description for the scene" 
    },
    ...
  ]
`;

    try {
      const response = await axios.post("/api/get-video-script", {
        prompt: prompt.trim(),
      });

      setVideoData((prev) => ({
        ...prev,
        videoScript: response.data.result,
      }));
      setVideoScript(response.data.result);
    } catch (error) {
      console.error("Error fetching video script:", error);
    } finally {
      setLoadingState(false);
    }
  };

  /**
   * Generates speech from the provided video script.
   *
   * This function takes in a `videoScript` (a string containing the text) and uses a text-to-speech API or a custom function to generate speech audio.
   *
   * @param {string} videoScript - The script of the video, containing the text to be converted into speech.
   *
   * @returns {Promise} - A promise that resolves when the speech is successfully generated. The promise can contain a URL or data representing the audio file.
   */

  const generateAudioFile = async (videoScript) => {
    setLoadingState(true);

    // Validate videoScript
    if (!Array.isArray(videoScript) || videoScript.length === 0) {
      console.error("Invalid videoScript:", videoScript);
      setLoadingState(false);
      return;
    }

    let script = "";
    const id = uuidv4();

    // Concatenate contentText for all items
    videoScript.forEach((item, index) => {
      if (item.contentText) {
        script += item.contentText + " ";
      } else {
        console.warn(`Missing contentText in item at index ${index}:`, item);
      }
    });

    try {
      console.log("Generated script for audio:", script); // Debugging step

      const resp = await axios.post("/api/generate-audio", {
        text: script.trim(),
        id: id,
      });

      if (resp?.data?.result) {
        const audioUrl = resp.data.result;

        // Update video data
        setVideoData((prev) => ({
          ...prev,
          audioFileUrl: audioUrl,
        }));
        setAudioFileUrl(audioUrl);

        // Generate captions if audio URL is present
        await generateAudioCaptions(audioUrl, videoScript);
      } else {
        console.error("No audio URL returned:", resp?.data);
      }
    } catch (error) {
      console.error("Error generating audio file:", error);
    } finally {
      setLoadingState(false);
    }
  };

  /**
   * Generating audio captions for the video:
   * @param {*} fileUrl
   */
  const generateAudioCaptions = async (fileUrl, videoScript) => {
    try {
      setLoadingState(true);
      const response = await axios.post("/api/generate-caption", {
        audioFileUrl: fileUrl,
      });
      setVideoData((prev) => ({
        ...prev,
        captions: response.data.result,
      }));
      setCaptions(response?.data?.result);
    } catch (error) {
      console.error("Error generating captions:", error);
      alert("Failed to generate captions. Please try again later.");
    } finally {
      setLoadingState(false);
    }
  };

  // Uploading images to firebase:
  const uploadToFirebase = async (imageList) => {
    setLoadingState(true);
    try {
      const uploadPromises = imageList.map(async (image) => {
        const base64Image =
          "data:image/png;base64," + (await convertImage(image));
        const fileName = "ai-video-file/" + Date.now() + ".png";
        const storageRef = ref(storage, fileName);

        await uploadString(storageRef, base64Image, "data_url");

        const downloadURL = await getDownloadURL(storageRef);
        console.log(`Download URL for ${image}: ${downloadURL}`);
      });

      await Promise.all(uploadPromises);
      console.log("All images uploaded successfully");

      setVideoData((prev) => ({
        ...prev,
        imageList: imageList,
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
    }

    setLoadingState(false);
  };

  const convertImage = async (image) => {
    try {
      const resp = await axios.get(image, { responseType: "arraybuffer" });
      const base64Image = Buffer.from(resp.data).toString("base64");
      return base64Image;
    } catch (e) {
      console.log("error", e);
    }
  };

  useEffect(() => {
    console.log(videoData);
    if (Object.keys(videoData).length == 4) {
      saveVideoData(videoData);
    }
  }, [videoData]);

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
        <SelectTopic
          onUserSelect={(topic) => onHandleInputChange("topic", topic)}
        />

        {/* Select Style
        <SelectStyle
          onUserSelect={(style) => onHandleInputChange("imageStyle", style)}
        /> */}

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

      <PlayerDialog playVideo={playVideo} videoId={videoId} />
    </div>
  );
}

export default CreateNew;
