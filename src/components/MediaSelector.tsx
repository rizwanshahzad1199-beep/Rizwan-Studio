/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Video, Image, FileVideo, Sparkles, Check, Play, AlertCircle } from "lucide-react";
import { PRESET_SAMPLES, PresetSample } from "./SamplesData";

interface MediaSelectorProps {
  onMediaReady: (payload: {
    mediaType: "image" | "video";
    frames: string[];
    fileName: string;
    fileSize: string;
  }) => void;
  outputDesign: "quick" | "advanced";
  setOutputDesign: (design: "quick" | "advanced") => void;
  isAnalyzing: boolean;
}

export default function MediaSelector({
  onMediaReady,
  outputDesign,
  setOutputDesign,
  isAnalyzing,
}: MediaSelectorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [extractingKeyframes, setExtractingKeyframes] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup sample presets configuration
  const handleSelectPreset = (preset: PresetSample) => {
    if (isAnalyzing) return;
    setSelectedFile(null);
    setMediaType(preset.type);
    setSelectedPresetId(preset.id);
    setFrames([...preset.frames]);
    setOutputDesign(preset.suggestedOutput as "quick" | "advanced");
    
    onMediaReady({
      mediaType: preset.type,
      frames: [...preset.frames],
      fileName: preset.title,
      fileSize: "Curated Preset Asset Preview",
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (isAnalyzing) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleProcessFile = async (file: File) => {
    setSelectedPresetId(null);
    setSelectedFile(file);
    const isVideoFile = file.type.startsWith("video/");
    const isImageFile = file.type.startsWith("image/");
    
    if (!isVideoFile && !isImageFile) {
      alert("Unsupported file format. Please upload an image or video.");
      setSelectedFile(null);
      return;
    }

    const type = isVideoFile ? "video" : "image";
    setMediaType(type);
    setFrames([]);

    if (type === "image") {
      setExtractingKeyframes(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFrames([base64]);
        setExtractingKeyframes(false);
        onMediaReady({
          mediaType: "image",
          frames: [base64],
          fileName: file.name,
          fileSize: formatBytes(file.size),
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Dynamic Video extraction
      setExtractingKeyframes(true);
      setExtractionProgress(10);
      try {
        const videoUrl = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";

        const seekTime = (v: HTMLVideoElement, time: number): Promise<string> => {
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Video seeking timed out."));
            }, 5000);

            const onSeeked = () => {
              clearTimeout(timeout);
              v.removeEventListener("seeked", onSeeked);
              const canvas = document.createElement("canvas");
              canvas.width = 480;
              canvas.height = 270;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              }
              resolve(canvas.toDataURL("image/jpeg", 0.75));
            };
            v.addEventListener("seeked", onSeeked);
            v.currentTime = time;
          });
        };

        video.onloadedmetadata = async () => {
          setExtractionProgress(30);
          const duration = video.duration || 10;
          // Capture 5 frames as sequential timelines
          const intervals = [
            duration * 0.1,
            duration * 0.3,
            duration * 0.5,
            duration * 0.7,
            duration * 0.9,
          ];
          
          const extracted: string[] = [];
          try {
            for (let i = 0; i < intervals.length; i++) {
              const base64 = await seekTime(video, intervals[i]);
              extracted.push(base64);
              setExtractionProgress(30 + Math.floor(((i + 1) / intervals.length) * 70));
            }
            setFrames(extracted);
            onMediaReady({
              mediaType: "video",
              frames: extracted,
              fileName: file.name,
              fileSize: formatBytes(file.size),
            });
          } catch (err) {
            console.error("Frame seeking issue:", err);
            // Fallback: draw single snapshot at start if seeking failed
            const fallbackCanvas = document.createElement("canvas");
            fallbackCanvas.width = 480;
            fallbackCanvas.height = 270;
            const ctx = fallbackCanvas.getContext("2d");
            if (ctx) ctx.drawImage(video, 0, 0, fallbackCanvas.width, fallbackCanvas.height);
            const fallbackBase64 = fallbackCanvas.toDataURL("image/jpeg", 0.7);
            setFrames([fallbackBase64]);
            onMediaReady({
              mediaType: "video",
              frames: [fallbackBase64],
              fileName: file.name,
              fileSize: formatBytes(file.size),
            });
          } finally {
            setExtractingKeyframes(false);
          }
        };

        // Fallback for metadata load failure
        video.onerror = () => {
          throw new Error("Unable to read video file metadata.");
        };

      } catch (err) {
        console.error("Error drawing video:", err);
        setExtractingKeyframes(false);
        alert("Failed to analyze frames from your video file. Please test using alternate files or standard presets.");
      }
    }
  };

  const handleCardClick = () => {
    if (isAnalyzing) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bento-card p-6 shadow-xl">
        <h3 className="text-xs font-bold text-zinc-400 mb-4 font-mono uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
          Step 1: Input Media Feed
        </h3>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleCardClick}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-lime-400 bg-lime-450/10 shadow-[0_0_20px_rgba(190,242,100,0.1)]"
              : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-950"
          } ${isAnalyzing ? "opacity-30 cursor-not-allowed" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isAnalyzing}
          />

          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-450">
            <UploadCloud size={24} className="text-zinc-400" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-200">
              Drag & drop media, or <span className="text-lime-400 hover:underline font-bold">browse files</span>
            </p>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wide">
              Supports: MP4, MOV, WEBM, PNG, JPG, WEBP (Auto keyframe extraction)
            </p>
          </div>
        </div>

        {/* Video Keyframe progress tracker */}
        {extractingKeyframes && (
          <div className="mt-4 p-4 bg-zinc-950 rounded-lg border border-zinc-850">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                <Sparkles size={14} className="animate-spin text-lime-400" />
                Constructing Frame Timeline...
              </span>
              <span className="text-xs font-mono font-black text-lime-400">
                {extractionProgress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 transition-all duration-300"
                style={{ width: `${extractionProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Extracted timeline layout */}
        {frames.length > 0 && !extractingKeyframes && (
          <div className="mt-4 p-4 bg-zinc-950 rounded-lg border border-zinc-850">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-450">
              <span className="flex items-center gap-1.5 text-lime-400 font-bold uppercase tracking-wider">
                <Check size={14} />
                Timeline Slices Ready
              </span>
              <span>{frames.length} Frame(s) Extracted</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {frames.map((frame, idx) => (
                <div key={idx} className="relative aspect-video rounded overflow-hidden border border-zinc-800 bg-zinc-900 group">
                  <img
                    src={frame}
                    alt={`Frame ${idx + 1}`}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 right-1 font-mono text-[10px] bg-zinc-950/90 px-1 py-0.5 rounded text-zinc-300">
                    {mediaType === "video" ? `SLICE ${idx + 1}` : "Source"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[11px] font-mono text-zinc-500 uppercase tracking-wide flex items-center gap-1">
              <AlertCircle size={12} className="text-zinc-650 shrink-0" />
              <span>Frames parsed sequentially to build high-relevance retention profiles.</span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Library (Awesome feature for fast testing) */}
      <div className="bento-card p-6 shadow-xl">
        <h3 className="text-xs font-bold text-zinc-450 mb-4 font-mono uppercase tracking-widest flex items-center gap-2">
          Or Select Curated Social Asset Presets
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_SAMPLES.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                disabled={isAnalyzing}
                className={`flex text-left items-stretch gap-3 p-3 rounded-xl border transition-all duration-350 ${
                  isSelected
                    ? "border-lime-400 bg-zinc-900 ring-1 ring-lime-450/40 shadow-sm"
                    : "border-zinc-850 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-950"
                } ${isAnalyzing ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Thumb */}
                <div className="w-24 aspect-video rounded-lg overflow-hidden shrink-0 border border-zinc-850 bg-zinc-900 relative">
                  <img
                    src={preset.thumbnail}
                    alt={preset.title}
                    className="w-full h-full object-cover animate-fadeIn"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // fallback nicely if thumbnail fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {preset.type === "video" ? (
                    <div className="absolute inset-0 bg-zinc-950/25 flex items-center justify-center">
                      <Play className="text-lime-400 fill-lime-400" size={14} />
                    </div>
                  ) : (
                    <div className="absolute top-1 right-1 bg-zinc-950/70 p-0.5 rounded">
                      <Image size={10} className="text-zinc-400" />
                    </div>
                  )}
                  <div className="absolute bottom-0.5 left-1 text-[8px] tracking-wider font-extrabold bg-zinc-950/80 px-1 py-0.5 rounded text-white font-mono uppercase">
                    {preset.type}
                  </div>
                </div>

                {/* Text info */}
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                    {preset.category}
                  </span>
                  <p className="text-xs font-bold text-zinc-200 truncate mt-0.5 uppercase tracking-wide">
                    {preset.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 italic leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Output Options */}
      <div className="bento-card p-6 shadow-xl">
        <h3 className="text-xs font-bold text-zinc-450 mb-4 font-mono uppercase tracking-widest flex items-center gap-2">
          Step 2: Core Intelligence Design
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setOutputDesign("quick")}
            disabled={isAnalyzing}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
              outputDesign === "quick"
                ? "border-lime-400 bg-lime-400/5 ring-1 ring-lime-440/30"
                : "border-zinc-850 bg-zinc-950/50 hover:border-zinc-805"
            } ${isAnalyzing ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Quick Report</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                outputDesign === "quick" ? "border-lime-400 bg-lime-400" : "border-zinc-700"
              }`}>
                {outputDesign === "quick" && <Check size={10} className="text-zinc-950 font-black" />}
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 min-h-[48px] leading-relaxed">
              Main indicators, virality rating, platform forecasts, best caption, 30 top tags, and 10 dynamic titles. Fast and focused.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setOutputDesign("advanced")}
            disabled={isAnalyzing}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
              outputDesign === "advanced"
                ? "border-lime-400 bg-lime-400/5 ring-1 ring-lime-440/30"
                : "border-zinc-850 bg-zinc-950/50 hover:border-zinc-805"
            } ${isAnalyzing ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Advanced Intel</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                outputDesign === "advanced" ? "border-lime-400 bg-lime-400" : "border-zinc-700"
              }`}>
                {outputDesign === "advanced" && <Check size={10} className="text-zinc-950 font-black" />}
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 min-h-[48px] leading-relaxed">
              Full itemized visual breakdown, emotional stimuli mapping, 20 custom titles, 15 hooks, 50 keywords, and platform pros/cons, posting schedule.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
