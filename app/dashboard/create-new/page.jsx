"use client";

import React, { useContext, useEffect, useState } from "react";
import SelectTopic from "./_components/SelectTopic";
import SelectDuration from "./_components/SelectDuration";
import { Button } from "@/components/ui/button";
import axios from "axios";
import CustomLoading from "../../../components/CustomLoading";
import UrlBox from "./_components/UrlBox";
import ProductName from "./_components/ProductName";
import ProductDescription from "./_components/ProductDescription";
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import PlayerDialog from "../_components/PlayerDialog";
import { v4 as uuidv4 } from "uuid";
import AddMedia from "./_components/AddMedia";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../configs/FirebaseConfig.js";
import { useUser } from "@clerk/nextjs";
import { db } from "@/configs/db";
import { Users, VideoData } from "@/configs/schema";
import { UserDetailContext } from "@/app/_context/userDataContext";
import { eq } from "drizzle-orm";
import { useToast } from "@/hooks/use-toast";

function CreateNew() {
  // storing form data:
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // storing images from user:
  const [imageList, setImageList] = useState([]);

  const [imageUrlList, setImageUrlList] = useState([]);

  const [loadingState, setLoadingState] = useState(false);

  const [videoScript, setVideoScript] = useState();

  const [audioFileUrl, setAudioFileUrl] = useState();

  const [captions, setCaptions] = useState();

  const { videoData, setVideoData } = useContext(VideoDataContext);

  const [playVideo, setPlayVideo] = useState(false);

  const [videoId, setVideoId] = useState(1);

  const { user } = useUser();

  const { userData, setUserData } = useContext(UserDetailContext);

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
  const onCreateClickHandler = async () => {
    try {
      // Wait for getVideoScript to complete
      if (!userData?.credits > 0) {
        // Alert user if he dosen't have sufficient credits.
        toast({
          title: "Error",
          description: "Insufficient credits. Please add more credits.",
        });
      }
      await getVideoScript();
    } catch (error) {
      console.error("Error in onCreateClickHandler:", error);
    }
  };

  // Get the video script based on the form data:
  const getVideoScript = async () => {
    setLoadingState(true);

    await uploadImagesToFirebase(imageList);

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

      resp.data.result && (await generateAudioFile(resp.data.result));
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

    console.log("Generated script:", script);

    try {
      const resp = await axios.post("/api/generate-audio", {
        text: script,
        id: id,
      });

      const audioFileUrl = resp.data.Result;

      if (audioFileUrl) {
        console.log("Audio download URL:", audioFileUrl);

        setVideoData((prev) => ({
          ...prev,
          audioFileUrl: audioFileUrl,
        }));

        setAudioFileUrl(audioFileUrl);

        await generateAudioCaptions(audioFileUrl);
      } else {
        console.warn("No audioFileUrl returned from the API.");
      }
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

      setVideoData((prev) => ({
        ...prev,
        captions: resp.data.result,
      }));

      setCaptions(resp.data.result);

      console.log("This is the captions:", resp.data.result);
    } catch (error) {
      console.error("Error generating captions:", error);
    } finally {
      setLoadingState(false);
    }
  };

  // Function to upload images to firebase:
  const uploadImagesToFirebase = async (imageList) => {
    setLoadingState(true);

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

        setLoadingState(false);
      }
    }
  };

  // Displays whenever videoData gets updated:
  useEffect(() => {
    // Ensure all required fields are present before saving
    if (Object.keys(videoData).length === 4) {
      saveVideoData(videoData);
    }
  }, [videoData]);

  const saveVideoData = async (videoData) => {
    if (!videoData || typeof videoData !== "object") {
      console.error("Invalid videoData:", videoData);
      return;
    }

    if (!user || !user.primaryEmailAddress?.emailAddress) {
      console.error("Invalid user or user email:", user);
      return;
    }

    setLoadingState(true);

    try {
      const query = db.insert(VideoData).values({
        script: videoData?.videoScript,
        audioFileUrl: videoData?.audioFileUrl,
        captions: videoData?.captions,
        imageList: videoData?.imageList,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      console.log("Generated SQL Query:", query.toSQL());

      const result = await query.returning({ id: VideoData?.id });

      console.log("Inserted video data:", result);

      await updateUserCredits();
    } catch (error) {
      console.error("Error saving video data:", error);
    } finally {
      setLoadingState(false);
    }
  };

  // Used to update user's credits:
  const updateUserCredits = async () => {
    const result = await db
      .update(Users)
      .set({ credits: userData?.credits - 1 })
      .where(eq(Users?.email, user?.primaryEmailAddress?.emailAddress));

    console.log("Credit deduction:", result);
    setUserData((prev) => ({
      ...prev,
      credits: userData?.credits - 1,
    }));

    setVideoData(null);
  };

  return (
    <div className="md:px-20">
      <h2 className="font-bold text-4xl text-primary text-center">
        Create New
      </h2>
      <div className="mt-10 p-10 relative animate-shadow-pulse  ">
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
        <div className="flex justify-center mt-5">
          <Button
            className="flex items-center rounded-full"
            onClick={onCreateClickHandler}
          >
            Create Video
          </Button>
        </div>
      </div>

      {/* Loading Screen */}
      <CustomLoading loading={loadingState} />

      <PlayerDialog playVideo={playVideo} videoId={videoId} />
    </div>
  );
}

export default CreateNew;
