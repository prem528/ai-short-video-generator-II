"use client";

import React, { useContext, useEffect, useState } from "react";
import SelectTopic from "./_components/SelectTopic";
import SelectDuration from "./_components/SelectDuration";
import { Button } from "@/components/ui/button";
import axios from "axios";
import CustomLoading from "./_components/CustomLoading";
import UrlBox from "./_components/UrlBox";
import ProductName from "./_components/ProductName";
import ProductDescription from "./_components/ProductDescription";
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import PlayerDialog from "../_components/PlayerDialog";
import { v4 as uuidv4 } from "uuid";
import AddMedia from "./_components/AddMedia";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

  // testing sound data:
  const sound =
    "https://firebasestorage.googleapis.com/v0/b/ai-video-generator-d0362.firebasestorage.app/o/ai-video-file%2F3a339263-760a-4130-8538-8b808f4a25df.mp3?alt=media&token=b036015e-c4e0-4216-914b-ae43144e643e";

  // Handle the create create video button:
  const onCreateClickHandler = () => {
    console.log("This is the formData:", formData);
    console.log("This is the imageList:", imageList);

    // getVideoScript();
    uploadImagesToFirebase(imageList);
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
      const resp = await axios.post("/api/get-video-script", {
        prompt: prompt,
      });

      setVideoData((prev) => ({
        ...prev,
        videoScript: resp.data.result,
      }));

      setVideoScript(resp.data.result);

      console.log("This is the videoScript:", resp.data.result);

      await generateAudioFile(resp.data.result);
    } catch (error) {
      console.error("Error fetching video script:", error);
    } finally {
      setLoadingState(false);
    }
  };

  // Generating the audiofile:
  const generateAudioFile = async (videoScriptData) => {
    setLoadingState(true);
    let script = videoScriptData.map((item) => item.contentText).join(" ");
    const id = uuidv4();

    console.log(script);

    try {
      const resp = await axios.post("/api/generate-audio", {
        text: script,
        id: id,
      });
      console.log(resp.data.result);

      const audioUrl = resp.data.result;

      setVideoData((prev) => ({
        ...prev,
        audioFileUrl: audioUrl,
      }));

      setAudioFileUrl(audioUrl);

      console.log("This is the audioFileUrl:", audioUrl);

      await generateAudioCaptions(audioUrl);
    } catch (error) {
      console.error("Error generating audio file:", error);
    } finally {
      setLoadingState(false);
    }
  };

  //  Generating audio captions for the video:
  const generateAudioCaptions = async (fileUrl) => {
    setLoadingState(true);

    try {
      const resp = await axios.post("/api/generate-caption", {
        audioFileUrl: fileUrl,
      });

      const caption = resp.data.result;

      setVideoData((prev) => ({
        ...prev,
        captions: resp.data.result,
      }));

      setCaptions(caption);

      console.log("This is the captions:", caption);
    } catch (error) {
      console.error("Error generating captions:", error);
    } finally {
      setLoadingState(false);
    }
  };

  // Function to upload images to firebase:
  const uploadImagesToFirebase = async (imageList) => {
    setLoadingState(true);

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

        console.log(`Image uploaded successfully: ${downloadUrl}`);
      } catch (error) {
        console.error(`Error uploading image ${image.name}:`, error);
      } finally {
        setLoadingState(false);
      }
    }
  };

  useEffect(() => {
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
        <SelectTopic onUserSelect={onHandleInputChange} />

        {/* Select Style
        <SelectStyle
          onUserSelect={(style) => onHandleInputChange("imageStyle", style)}
        /> */}

        {/* Duration */}
        <SelectDuration onUserSelect={onHandleInputChange} />

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
