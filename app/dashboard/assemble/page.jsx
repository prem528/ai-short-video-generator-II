"use client";

import React, { useState, useContext, useEffect } from "react";
import SelectLanguage from "../create-new/_components/SelectLanguage";
import SelectGender from "../create-new/_components/SelectGender";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/configs/db";
import { Users, VideoData } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { UserDetailContext } from "@/app/_context/userDataContext";
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import PlayerDialog from "../_components/PlayerDialog";
import CustomLoading from "@/components/CustomLoading";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { Player } from "@remotion/player";
import RemotionVideo from "../_components/RemotionVideo";
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Upload, 
  Film, 
  FileAudio, 
  CheckCircle2, 
  AlertCircle, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  MoveLeft,
  MoveRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Scissors
} from "lucide-react";

function AssembleVideo() {
  const [step, setStep] = useState(1); // 1 = Setup Narration, 2 = Editing Suite

  const [formData, setFormData] = useState({
    language: "English",
    gender: "MALE",
    aspectRatio: "9:16",
    showCaptions: true,
  });
  const [scriptText, setScriptText] = useState("");
  const [audioFileUrl, setAudioFileUrl] = useState("");
  const [captions, setCaptions] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Keep dialog active only for compile completions
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoId] = useState(null);

  const [selectedClipIndex, setSelectedClipIndex] = useState(null);
  const [zoom, setZoom] = useState(25); // Pixels per second

  const { userData, setUserData } = useContext(UserDetailContext);
  const { videoData, setVideoData } = useContext(VideoDataContext);
  const { user } = useUser();
  const { toast } = useToast();

  // 1. On Mount: Restore workspace state from Redis cache
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const loadWorkspace = async () => {
      try {
        const resp = await axios.get(
          `/api/workspace?email=${user.primaryEmailAddress.emailAddress}`
        );
        const state = resp.data.state;
        if (state) {
          setScriptText(state.scriptText || "");
          setFormData((prev) => ({
            ...prev,
            aspectRatio: state.aspectRatio || "9:16",
            showCaptions: state.showCaptions !== false,
          }));
          setMediaList(state.mediaList || []);
          setAudioFileUrl(state.audioFileUrl || "");
          setCaptions(state.captions || null);
          setStep(state.step || 1);

          toast({
            title: "Workspace Restored",
            description: "Restored your active timeline from local cache.",
          });
        }
      } catch (err) {
        console.error("Failed to load workspace from Redis:", err);
      }
    };

    loadWorkspace();
  }, [user]);

  // 2. Auto-Save: Save edits and step to Redis
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    if (!scriptText && mediaList.length === 0 && !audioFileUrl) return;

    const timer = setTimeout(async () => {
      try {
        await axios.post("/api/workspace", {
          email: user.primaryEmailAddress.emailAddress,
          state: {
            scriptText,
            aspectRatio: formData.aspectRatio,
            showCaptions: formData.showCaptions !== false,
            mediaList,
            audioFileUrl,
            captions,
            step,
          },
        });
      } catch (err) {
        console.error("Auto-save to Redis failed:", err);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [scriptText, formData.aspectRatio, formData.showCaptions, mediaList, audioFileUrl, captions, step, user]);

  const handleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  // 3. Local Upload API handler
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setLoadingState(true);
    setLoadingMessage("Uploading assets to local disk cache...");
    const newMediaItems = [];

    for (const file of files) {
      try {
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        const resp = await axios.post("/api/upload-temp", uploadForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const localUrl = resp.data.Result;

        newMediaItems.push({
          id: uuidv4(),
          url: localUrl,
          type: file.type.startsWith("video") ? "video" : "image",
          duration: 5.0, // Default duration in seconds
          name: file.name,
        });
      } catch (error) {
        console.error("Local file upload error:", error);
        toast({
          title: "Upload Failed",
          description: `Failed to save ${file.name} to local disk.`,
          variant: "destructive",
        });
      }
    }

    setMediaList((prev) => [...prev, ...newMediaItems]);
    if (selectedClipIndex === null && newMediaItems.length > 0) {
      setSelectedClipIndex(mediaList.length);
    }
    setLoadingState(false);
    setLoadingMessage("");
  };

  const handleGenerateVoiceover = async () => {
    if (!scriptText.trim()) {
      toast({
        title: "Missing script",
        description: "Please enter or paste your script first.",
        variant: "destructive",
      });
      return;
    }

    setLoadingState(true);
    setLoadingMessage("Generating speech synthesis...");
    const id = uuidv4();

    try {
      const resp = await axios.post("/api/generate-audio", {
        text: scriptText,
        id: id,
        language: formData.language,
        gender: formData.gender,
      });

      const generatedAudioUrl = resp.data.Result;

      if (generatedAudioUrl) {
        setAudioFileUrl(generatedAudioUrl);
        setLoadingMessage("Transcribing speech captions...");

        const captionResp = await axios.post("/api/generate-caption", {
          audioFileUrl: generatedAudioUrl,
        });

        setCaptions(captionResp.data.result);
        toast({
          title: "Voiceover Created!",
          description: "Synthesized audio and captions successfully.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "No audio URL was returned.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating voiceover:", error);
      toast({
        title: "Synthesis Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingState(false);
      setLoadingMessage("");
    }
  };

  const handleMove = (index, direction) => {
    const newList = [...mediaList];
    const targetIndex = direction === "left" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newList.length) return;

    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    setMediaList(newList);
    setSelectedClipIndex(targetIndex);
  };

  const handleDeleteScene = (index) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
    setSelectedClipIndex(null);
  };

  const handleDurationChange = (index, newDuration) => {
    setMediaList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, duration: Math.max(0.1, parseFloat(newDuration) || 0.1) } : item
      )
    );
  };

  const handleTypeChange = (index, type) => {
    setMediaList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, type } : item))
    );
  };

  const handleResizeStart = (e, index) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startDuration = mediaList[index].duration;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaSeconds = deltaX / zoom;
      const newDuration = Math.max(0.1, parseFloat((startDuration + deltaSeconds).toFixed(1)));
      setMediaList((prev) =>
        prev.map((item, i) => (i === index ? { ...item, duration: newDuration } : item))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleAssemble = async () => {
    const credits = userData?.credits ?? 0;
    if (credits <= 0) {
      toast({
        title: "Insufficient credits",
        description: "Please add more credits to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!audioFileUrl) {
      toast({
        title: "Voiceover missing",
        description: "Please generate the voiceover for your script first.",
        variant: "destructive",
      });
      return;
    }

    if (mediaList.length === 0) {
      toast({
        title: "No scenes uploaded",
        description: "Please upload at least one video or image scene.",
        variant: "destructive",
      });
      return;
    }

    setLoadingState(true);
    setLoadingMessage("Assembling metadata & compiling workspace...");

    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) throw new Error("User email not found");

      const scriptPayload = {
        isAssembleFlow: true,
        scriptText: scriptText,
        aspectRatio: formData.aspectRatio || "9:16",
        mediaList: mediaList,
        showCaptions: formData.showCaptions !== false,
      };

      const result = await db.insert(VideoData).values({
        script: scriptPayload,
        audioFileUrl: audioFileUrl,
        captions: captions || [],
        imageList: mediaList.map((item) => item.url),
        createdBy: email,
        title: "Custom Assembled Video",
        language: formData.language,
        gender: formData.gender,
      }).returning({ id: VideoData.id });

      if (result?.length > 0) {
        const newVideoId = result[0].id;
        
        await db
          .update(Users)
          .set({ credits: credits - 1 })
          .where(eq(Users.email, email));

        setUserData((prev) => ({
          ...prev,
          credits: credits - 1,
        }));

        await axios.delete(`/api/workspace?email=${email}`).catch(() => {});

        setVideoId(newVideoId);
        setPlayVideo(true);

        toast({
          title: "Assemble Complete!",
          description: "Your video compilation is ready.",
        });
      }
    } catch (error) {
      console.error("Assembly failed:", error);
      toast({
        title: "Assembly Failed",
        description: "An error occurred while compiling your video metadata.",
        variant: "destructive",
      });
    } finally {
      setLoadingState(false);
      setLoadingMessage("");
    }
  };

  const totalVideoDuration = mediaList.reduce((acc, item) => acc + item.duration, 0);
  const totalAudioDuration = captions && captions.length > 0 ? (captions[captions.length - 1].end / 1000) : 0;
  const maxTimelineDuration = Math.max(totalVideoDuration, totalAudioDuration, 15);

  const rulerTicks = [];
  const tickSpacing = zoom >= 30 ? 1 : (zoom >= 15 ? 2 : 5);
  for (let i = 0; i <= Math.ceil(maxTimelineDuration); i += tickSpacing) {
    rulerTicks.push(i);
  }

  const isAudioVideoAligned = Math.abs(totalVideoDuration - totalAudioDuration) < 0.5;
  const isLandscape = formData.aspectRatio === "16:9";

  return (
    <div className="mx-auto max-w-7xl w-full max-w-full overflow-hidden px-4 py-6 md:py-8 flex flex-col gap-6">
      <CustomLoading loading={loadingState} message={loadingMessage} />

      {/* Header Wizard Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors
              ${step === 1 ? "bg-brand text-brand-foreground" : "bg-green-500/25 text-green-400"}`}>
              {step > 1 ? "✓" : "1"}
            </span>
            <span className={`text-xs font-semibold uppercase tracking-wider
              ${step === 1 ? "text-foreground" : "text-muted-foreground"}`}>Setup Script</span>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground" />

          <div className="flex items-center gap-1.5">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors
              ${step === 2 ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground"}`}>
              2
            </span>
            <span className={`text-xs font-semibold uppercase tracking-wider
              ${step === 2 ? "text-foreground" : "text-muted-foreground"}`}>Timeline Suite</span>
          </div>
        </div>

        {step === 2 && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              className="gap-1.5 border-border bg-transparent text-muted-foreground hover:text-foreground h-9 text-xs"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Script
            </Button>

            <Button
              size="sm"
              onClick={handleAssemble}
              disabled={!audioFileUrl || mediaList.length === 0}
              className="bg-brand text-brand-foreground hover:bg-brand/90 font-semibold h-9 text-xs brand-glow"
            >
              <Film className="h-4 w-4 gap-1.5" /> Compile Video
            </Button>
          </div>
        )}
      </div>

      {/* STEP 1: SCRIPT SETUP & VOICEOVER SYNTHESIS */}
      {step === 1 && (
        <div className="mx-auto max-w-4xl w-full space-y-6">
          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span className="h-9 w-[3px] rounded-full bg-gradient-to-b from-brand to-brand-2" />
              <div>
                <span className="timecode text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Assemble Flow
                </span>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  Narration & Voice Settings
                </h2>
              </div>
            </div>
          </div>

          {/* Section 1 — Voice Settings */}
          <Section
            index="01"
            title="Voice & Language"
            description="Select the language and voice gender for the custom voiceover narration."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SelectLanguage onUserSelect={handleInputChange} />
              <SelectGender onUserSelect={handleInputChange} />
            </div>
          </Section>

          {/* Section 2 — Layout & style */}
          <Section
            index="02"
            title="Layout & Captions"
            description="Choose the dimensions and subtitle settings for the generated video."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Aspect Ratio</label>
                <Select defaultValue="9:16" value={formData.aspectRatio} onValueChange={(val) => handleInputChange("aspectRatio", val)}>
                  <SelectTrigger className="mt-2 w-full bg-background border-border">
                    <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent className="bg-panel border-border text-foreground">
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Subtitles / Captions</label>
                <Select defaultValue="enable" value={formData.showCaptions !== false ? "enable" : "disable"} onValueChange={(val) => handleInputChange("showCaptions", val === "enable")}>
                  <SelectTrigger className="mt-2 w-full bg-background border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-panel border-border text-foreground">
                    <SelectItem value="enable">Show Captions</SelectItem>
                    <SelectItem value="disable">Disable Captions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* Section 3 — Narration Script */}
          <Section
            index="03"
            title="Narration Script"
            description="Paste or write the audio script text. Voicebox will synthesize this into speech."
          >
            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Paste your voiceover script here..."
                rows={6}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="resize-none bg-background border-border placeholder:text-muted-foreground/60 text-sm leading-relaxed"
              />
              <span className="text-right text-[11px] timecode text-muted-foreground/80 mt-1">
                {scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0} words
              </span>
            </div>

            <Button
              onClick={handleGenerateVoiceover}
              disabled={!scriptText.trim() || loadingState}
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-semibold h-11"
            >
              Generate Voiceover
            </Button>

            {audioFileUrl && (
              <div className="mt-2 flex flex-col gap-3 rounded-xl bg-background/40 border border-border/80 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-green-400 font-semibold">
                    <CheckCircle2 className="h-4.5 w-4.5" /> Voiceover Ready
                  </div>
                  
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-green-500 text-white hover:bg-green-600 font-semibold h-8 text-xs px-4"
                  >
                    Go to Timeline Suite <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
                <audio src={audioFileUrl} controls className="w-full h-8 text-xs mt-1" />
              </div>
            )}
          </Section>
        </div>
      )}

      {/* STEP 2: TIMELINE STUDIO (SPLIT EDITOR LAYOUT) */}
      {step === 2 && (
        <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden animate-fade-in">
          {/* Top Panel Split Workspace */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Inspector Panel */}
            <div className="lg:col-span-2">
              <Card className="flex flex-col gap-5 p-5 bg-panel border-border h-[430px] justify-between">
                <div className="min-h-0 flex flex-col">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-base font-semibold flex items-center gap-2 text-foreground/90">
                      <Layers className="h-4.5 w-4.5 text-brand-2" /> Clip Inspector
                    </h2>

                    <label className="flex items-center gap-1.5 cursor-pointer rounded-lg bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      Add Scenes
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {selectedClipIndex !== null && mediaList[selectedClipIndex] ? (
                    <div className="flex flex-col gap-4 p-4 rounded-xl bg-background/40 border border-border flex-grow overflow-y-auto">
                      <div className="flex gap-4 items-center">
                        {/* Selected Preview Box */}
                        <div className="h-20 w-20 rounded-lg overflow-hidden bg-black flex-shrink-0 relative border border-border/60">
                          {mediaList[selectedClipIndex].type === "video" ? (
                            <video src={mediaList[selectedClipIndex].url} className="h-full w-full object-cover" muted />
                          ) : (
                            <img src={mediaList[selectedClipIndex].url} className="h-full w-full object-cover" alt="" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate mb-1">
                            {mediaList[selectedClipIndex].name}
                          </p>
                          <span className="timecode text-xs font-semibold bg-secondary/60 px-2 py-0.5 rounded text-muted-foreground">
                            Scene {selectedClipIndex + 1}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground">Clip Type</label>
                          <Select
                            value={mediaList[selectedClipIndex].type}
                            onValueChange={(val) => handleTypeChange(selectedClipIndex, val)}
                          >
                            <SelectTrigger className="h-8 mt-1.5 bg-background border-border text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-panel border-border text-foreground">
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground">Duration (seconds)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={mediaList[selectedClipIndex].duration}
                            onChange={(e) => handleDurationChange(selectedClipIndex, e.target.value)}
                            className="h-8 mt-1.5 bg-background border-border text-center text-xs"
                          />
                        </div>
                      </div>

                      {/* Clip Actions */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={selectedClipIndex === 0}
                          onClick={() => handleMove(selectedClipIndex, "left")}
                          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <MoveLeft className="h-3.5 w-3.5" /> Left
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={selectedClipIndex === mediaList.length - 1}
                          onClick={() => handleMove(selectedClipIndex, "right")}
                          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <MoveRight className="h-3.5 w-3.5" /> Right
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScene(selectedClipIndex)}
                          className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl py-8 px-4 text-center bg-background/20 flex-grow mt-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground/60 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Select a clip in the timeline below to inspect properties, adjust durations, or shift order.
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between p-3 rounded-xl border text-xs leading-normal bg-background/35 border-border flex-shrink-0 mt-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className={`h-4.5 w-4.5 flex-shrink-0 ${isAudioVideoAligned ? "text-green-400" : "text-amber-400"}`} />
                    <div className="truncate">
                      <span className="font-semibold block text-foreground/90">Timeline Alignment Status</span>
                      <span className="text-[11px] text-muted-foreground">
                        Video: <strong className="text-foreground">{totalVideoDuration.toFixed(1)}s</strong> | Audio: <strong className="text-foreground">{totalAudioDuration.toFixed(1)}s</strong>
                      </span>
                    </div>
                  </div>

                  {!isAudioVideoAligned && (
                    <span className="timecode shrink-0 bg-amber-500/10 text-amber-400 font-semibold px-2 py-0.5 rounded text-[10px] uppercase border border-amber-500/20">
                      {totalVideoDuration > totalAudioDuration ? "Overrun" : "Gap"}
                    </span>
                  )}
                </div>
              </Card>
            </div>

            {/* Embedded Preview Player */}
            <div className="lg:col-span-3">
              <Card className="flex flex-col gap-4 p-5 bg-panel border-border h-[430px]">
                <h2 className="text-base font-semibold flex items-center gap-2 text-foreground/90 flex-shrink-0">
                  <Play className="h-4.5 w-4.5 text-brand" /> Live Render Preview
                </h2>

                <div className="relative flex items-center justify-center bg-black rounded-xl overflow-hidden border border-border/80 flex-grow h-0">
                  {mediaList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground/60 select-none">
                      <Scissors className="h-8 w-8 text-muted-foreground/45 mb-2 animate-bounce" />
                      Upload files in the inspector to preview timeline play.
                    </div>
                  ) : (
                    <Player
                      component={RemotionVideo}
                      durationInFrames={Math.max(30, Math.round(totalVideoDuration * 30))}
                      compositionWidth={isLandscape ? 1920 : 720}
                      compositionHeight={1080}
                      fps={30}
                      controls={true}
                      style={{
                        width: "100%",
                        height: "100%",
                        aspectRatio: isLandscape ? "16/9" : "9/16",
                        maxHeight: "310px",
                      }}
                      inputProps={{
                        imageList: mediaList.map((item) => item.url),
                        audioFileUrl: audioFileUrl,
                        captions: captions,
                        script: {
                          isAssembleFlow: true,
                          aspectRatio: formData.aspectRatio,
                          mediaList: mediaList,
                        },
                      }}
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Visual Timeline Section */}
          <Card className="p-5 bg-panel border-border flex flex-col gap-4 w-full max-w-full overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Film className="h-4 w-4 text-brand-2" /> Multi-Track Timeline
              </span>

              <div className="flex items-center gap-3">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="w-24 h-1 rounded bg-secondary appearance-none cursor-pointer accent-brand"
                />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Scrollable Tracks wrapper */}
            <div className="overflow-x-auto w-full border border-border/80 bg-background/30 rounded-xl p-4 scrollbar-thin">
              <div className="flex flex-col gap-4 min-w-max pr-10 relative">
                
                {/* 1. Time Ruler Header */}
                <div className="h-6 flex items-end relative border-b border-border/40 pb-1 text-[10px] text-muted-foreground select-none">
                  {rulerTicks.map((sec) => (
                    <div
                      key={sec}
                      className="absolute flex flex-col items-center justify-end h-full"
                      style={{ left: `${sec * zoom}px`, transform: "translateX(-50%)" }}
                    >
                      <span className="timecode text-[9px]">{sec}s</span>
                      <div className="w-[1px] h-1.5 bg-border/60 mt-1" />
                    </div>
                  ))}
                </div>

                {/* 2. Video Track */}
                <div className="flex items-center gap-0 relative py-1">
                  {mediaList.length === 0 ? (
                    <div 
                      className="h-18 rounded-xl border border-dashed border-border/50 flex items-center justify-center px-6 text-xs text-muted-foreground bg-background/10"
                      style={{ width: "350px" }}
                    >
                      Upload scenes to start editing
                    </div>
                  ) : (
                    mediaList.map((item, index) => {
                      const width = item.duration * zoom;
                      const isSelected = selectedClipIndex === index;

                      return (
                        <div
                          key={item.id}
                          onClick={(e) => handleClipClick(e, index)}
                          className={`h-18 rounded-xl border flex items-center justify-between relative overflow-hidden group select-none transition-shadow cursor-pointer p-2
                            ${
                              isSelected
                                ? "bg-brand/20 border-brand brand-glow"
                                : "bg-background/60 border-border/70 hover:border-border-2 hover:bg-background/80"
                            }`}
                          style={{ width: `${width}px` }}
                        >
                          <div className="h-12 w-12 rounded-lg bg-black overflow-hidden flex-shrink-0 relative border border-border/50">
                            {item.type === "video" ? (
                              <video src={item.url} className="h-full w-full object-cover" muted />
                            ) : (
                              <img src={item.url} className="h-full w-full object-cover" alt="" />
                            )}
                            <span className="absolute top-0.5 left-0.5 text-[8px] font-bold bg-black/60 px-1 rounded uppercase tracking-wider text-white scale-[0.85]">
                              {item.type === "video" ? "vid" : "img"}
                            </span>
                          </div>

                          <div className="flex-grow flex flex-col justify-center ml-2 mr-3 min-w-0">
                            <span className="text-[10px] font-semibold truncate block text-foreground/90 pr-1">
                              {item.name || `Clip ${index + 1}`}
                            </span>
                            <span className="timecode text-[9px] text-muted-foreground font-semibold">
                              {item.duration.toFixed(1)}s
                            </span>
                          </div>

                          {/* EAST-WEST RESIZE DRAG HANDLE */}
                          <div
                            onMouseDown={(e) => handleResizeStart(e, index)}
                            className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-brand bg-brand-2/20 flex items-center justify-center transition-colors group-hover:bg-brand-2/30"
                            title="Drag to adjust duration"
                          >
                            <div className="w-[1px] h-4 bg-foreground/30" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 3. Audio Track */}
                <div className="py-1">
                  {audioFileUrl ? (
                    <div 
                      className="h-10 rounded-xl relative overflow-hidden bg-brand/10 border border-brand/25 flex items-center px-4"
                      style={{ width: `${totalAudioDuration * zoom}px` }}
                    >
                      <div 
                        className="absolute inset-0 opacity-40"
                        style={{
                          background: `repeating-linear-gradient(90deg, hsl(var(--brand)) 0px, hsl(var(--brand)) 3px, transparent 3px, transparent 8px)`,
                          height: "60%",
                          top: "20%"
                        }}
                      />
                      <span className="text-[10px] timecode text-brand font-semibold z-10 flex items-center gap-1.5">
                        <FileAudio className="h-3.5 w-3.5" /> Synthesized Speech Narration ({totalAudioDuration.toFixed(1)}s)
                      </span>
                    </div>
                  ) : (
                    <div 
                      className="h-10 rounded-xl border border-dashed border-border/50 flex items-center px-4 text-xs text-muted-foreground bg-background/5"
                      style={{ width: "350px" }}
                    >
                      No voiceover generated yet
                    </div>
                  )}
                </div>

              </div>
            </div>
          </Card>
        </div>
      )}

      <PlayerDialog playVideo={playVideo} videoId={videoId} />
    </div>
  );

  function handleClipClick(e, index) {
    e.preventDefault();
    setSelectedClipIndex(index);
  }
}

/** Numbered form section component matching the design system of /create-new */
function Section({ index, title, description, children }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm">
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

export default AssembleVideo;
