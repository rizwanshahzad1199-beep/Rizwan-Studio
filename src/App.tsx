/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, BarChart3, AlertTriangle, Play, Settings, Database, Heart, Shield, RefreshCw } from "lucide-react";
import MediaSelector from "./components/MediaSelector";
import AnalysisReport from "./components/AnalysisReport";
import { UltimateViralAnalysisResult } from "./types";
import ECGGraph from "./components/ECGGraph";

const LOADING_STATUS_STEPS = [
  "Initializing Ultimate Viral Analyzer engine...",
  "Aligning canvas frame sequence timelines...",
  "Extracting main and secondary visual subjects...",
  "Interrogating lighting composition structures...",
  "Initiating facial and emotive cue scanners...",
  "Querying prediction engine: TikTok & Reels...",
  "Drafting USA-Style attention-grabbing titles...",
  "Cataloging exactly 30 high-velocity hashtags...",
  "Running Mehar Rizwan's v5.0 Double-Audit validation...",
  "Validating non-guess constraints for invisible items...",
  "Formulating SEO search sub-indexes...",
  "Compiling finalized interactive report payload..."
];

const DIAGNOSTIC_STATUS_LABELS = [
  "SCANNING...",
  "ANALYZING...",
  "DETECTING CATEGORY...",
  "DETECTING NICHE...",
  "CHECKING VIRALITY...",
  "GENERATING TITLES...",
  "GENERATING CAPTIONS...",
  "GENERATING HASHTAGS...",
  "RUNNING QUALITY CHECK...",
  "ANALYSIS COMPLETE"
];

const getWaveStyleForIdx = (idx: number): "small_wave" | "medium_wave" | "large_wave" | "steady_wave" => {
  const wavs: ("small_wave" | "medium_wave" | "large_wave" | "steady_wave")[] = [
    "small_wave",   // SCANNING...
    "medium_wave",  // ANALYZING...
    "large_wave",   // DETECTING CATEGORY...
    "large_wave",   // DETECTING NICHE...
    "large_wave",   // CHECKING VIRALITY...
    "medium_wave",  // GENERATING TITLES...
    "medium_wave",  // GENERATING CAPTIONS...
    "medium_wave",  // GENERATING HASHTAGS...
    "large_wave",   // RUNNING QUALITY CHECK...
    "steady_wave"   // ANALYSIS COMPLETE
  ];
  return wavs[idx] || "steady_wave";
};

export default function App() {
  const [mediaPayload, setMediaPayload] = useState<{
    mediaType: "image" | "video";
    frames: string[];
    fileName: string;
    fileSize: string;
  } | null>(null);

  const [outputDesign, setOutputDesign] = useState<"quick" | "advanced font-mono">("advanced");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [ecgStatusIdx, setEcgStatusIdx] = useState(0);
  const [report, setReport] = useState<UltimateViralAnalysisResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Health / API status state
  const [apiKeyInitialized, setApiKeyInitialized] = useState<boolean | null>(null);

  // Poll server health on load to notify user of API key state
  useEffect(() => {
    checkBackendHealth();
  }, []);

  // Rotate dynamic ECG status label step during live analysis scan
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setEcgStatusIdx(0);
      interval = setInterval(() => {
        setEcgStatusIdx((prev) => {
          // Cap at step 8 ("RUNNING QUALITY CHECK...") max until fetch finishes
          if (prev < 8) return prev + 1;
          return prev;
        });
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setApiKeyInitialized(data.initialized);
    } catch (e) {
      console.error("Health check failure:", e);
      setApiKeyInitialized(false);
    }
  };

  // Rotate loading logs to keep user engaged during the AI processing cycle
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STATUS_STEPS.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  const handleMediaReady = (payload: typeof mediaPayload) => {
    setMediaPayload(payload);
    setErrorText(null);
  };

  const executeAnalysis = async () => {
    if (!mediaPayload) {
      setErrorText("Please upload any video/image or select a standard preset first.");
      return;
    }

    setIsAnalyzing(true);
    setReport(null);
    setErrorText(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaType: mediaPayload.mediaType,
          frames: mediaPayload.frames,
          outputDesign: outputDesign.split(" ")[0], // remove design utility padding if applicable
          fileName: mediaPayload.fileName,
          fileSize: mediaPayload.fileSize,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || "Analysis failed.");
      }

      const reportData: UltimateViralAnalysisResult = await response.json();
      setReport(reportData);
    } catch (error: any) {
      console.error("Analysis execution error:", error);
      setErrorText(error?.message || "An unexpected error occurred during processing. Please verify your GEMINI_API_KEY.");
      // Repoll health in case key was just configured
      checkBackendHealth();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col font-sans selection:bg-lime-400 selection:text-black">
      
      {/* HEADER SECTION */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center text-black font-black shadow-lg shadow-lime-400/20 relative">
              <Sparkles size={20} className="animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zinc-950"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold font-sans text-white tracking-tight flex items-center gap-1.5 uppercase">
                Ultimate Viral Analyzer
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-450 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                  v5.0
                </span>
              </h1>
              <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Powered by Mehar Rizwan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="label-xs">Analysis Engine</span>
              <span className="text-[10px] font-mono text-lime-400 uppercase tracking-widest font-bold">STATUS: ACTIVE (98.2% CONFIDENCE)</span>
            </div>
            
            <div className="flex items-center gap-2">
              {apiKeyInitialized === false && (
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 max-w-[200px] md:max-w-none truncate">
                  <AlertTriangle size={12} className="shrink-0" />
                  Missing Key: See Secrets
                </span>
              )}
              {apiKeyInitialized === true && (
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <Shield size={12} />
                  Gemini SDK Active
                </span>
              )}
              <div className="w-9 h-9 rounded-full bg-lime-400 text-black font-extrabold text-xs flex items-center justify-center">MR</div>
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORKFLOW AREA */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CONTROLS & SELECTION (5 grid widths) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bento-card p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 inline-block animate-pulse"></span>
                Viral Diagnostics Laboratory
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-1 leading-relaxed">
                Upload images or videos directly, or utilize one of our prepackaged social feeds. Target copy boundaries, engagement scores, and optimal posting profiles are calculated instantly.
              </p>
            </div>

            {/* Active API-KEY Platform Guidance callout */}
            {apiKeyInitialized === false && (
              <div className="bg-amber-950/20 border border-amber-500/25 rounded-xl p-4 text-xs font-mono text-amber-300 space-y-2">
                <p className="font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                  GEMINI_API_KEY Required
                </p>
                <p className="leading-relaxed text-zinc-400">
                  To analyze uploaded files, click the <strong className="text-amber-200">Settings &gt; Secrets</strong> panel in the top-right of your AI Studio environment, and add yours. You can also test using our high-fidelity presets below.
                </p>
              </div>
            )}
          </div>

          {/* Selector component */}
          <MediaSelector
            onMediaReady={handleMediaReady}
            outputDesign={outputDesign.includes("quick") ? "quick" : "advanced"}
            setOutputDesign={(d) => setOutputDesign(d === "quick" ? "quick" : "advanced")}
            isAnalyzing={isAnalyzing}
          />

          {/* Trigger analysis button */}
          <button
            type="button"
            onClick={executeAnalysis}
            disabled={isAnalyzing || !mediaPayload}
            className={`w-full py-4 rounded-xl font-black font-sans tracking-tight uppercase transition-all flex items-center justify-center gap-2 relative overflow-hidden text-sm cursor-pointer shadow-lg ${
              isAnalyzing || !mediaPayload
                ? "bg-zinc-800 text-zinc-550 cursor-not-allowed border border-zinc-700/50 shadow-none"
                : "bg-lime-400 hover:bg-lime-300 text-black shadow-lg shadow-lime-400/20 active:translate-y-[1px]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={16} className="animate-spin text-black" />
                Executing Media Scan...
              </>
            ) : (
              <>
                <Play size={16} className="fill-black text-black" />
                Launch Analysis Engine
              </>
            )}
          </button>

          {/* Error Feedbacks */}
          {errorText && (
            <div className="bg-rose-950/20 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-mono leading-relaxed flex gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1 uppercase tracking-wider">Execution Interrupted</p>
                <p className="text-zinc-400">{errorText}</p>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: ANALYZER OUTPUTS (7 grid widths) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Default state placeholder */}
          {!isAnalyzing && !report && (
            <div className="bento-card p-12 text-center flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-lime-400/5 rounded-full blur-3xl"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-6 shadow-inner">
                <Database size={28} className="text-lime-400" />
              </div>

              <h2 className="text-lg font-bold text-white font-sans uppercase tracking-tight">
                Awaiting Diagnostics Stream
              </h2>
              <p className="text-xs text-zinc-450 max-w-sm font-mono mt-2 leading-relaxed uppercase tracking-wider">
                Provide or drag a file into the Left Dashboard, choose your model report design, and click run. Your optimized platform reports will render here.
              </p>

              {/* Swiss design hints bullet checks */}
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-left w-full max-w-md bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 font-mono text-[11px] text-zinc-450">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                  <span>USA-Style Title Sets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                  <span>Sequential video frames</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                  <span>Engagement forecasts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                  <span>Zero guesswork audits</span>
                </div>
              </div>
            </div>
          )}

          {/* Scanning / Loading Screen */}
          {isAnalyzing && (
            <div className="bento-card p-12 text-center flex flex-col items-center justify-center min-h-[520px] relative overflow-hidden shadow-2xl space-y-6">
              <div className="absolute -top-10 -right-10 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl animate-pulse"></div>
              
              {/* Dynamic hospital monitor ECG style graph */}
              <div className="w-full">
                <ECGGraph
                  waveStyle={getWaveStyleForIdx(ecgStatusIdx)}
                  statusLabel={DIAGNOSTIC_STATUS_LABELS[ecgStatusIdx]}
                  showCompletionStatus={false}
                  showConfidenceLevel={false}
                />
              </div>

              <div className="flex flex-col items-center">
                {/* Spinning status circle */}
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-zinc-805 bg-zinc-950"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-lime-400 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={20} className="text-lime-350 animate-pulse" />
                  </div>
                </div>

                <h2 className="text-sm font-black font-sans text-white uppercase tracking-wider flex items-center gap-2">
                  Scanning Media Timelines
                </h2>
                
                {/* Rotating diagnostic log */}
                <div className="h-6 mt-3 max-w-sm flex items-center justify-center">
                  <p className="text-[10px] font-mono text-lime-400 animate-pulse bg-zinc-950 px-3.5 py-1.5 rounded-full border border-zinc-850 uppercase">
                    {LOADING_STATUS_STEPS[loadingStepIdx]}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 max-w-xs font-mono leading-relaxed uppercase">
                Our Gemini neural models are performing frame classifications, visual emotion indexing, and algorithm affinity mappings dynamically.
              </p>
            </div>
          )}

          {/* Real Report visualizer */}
          {!isAnalyzing && report && (
            <div className="animate-fadeIn">
              <AnalysisReport 
                report={report} 
                reportStyle={report.seoKeywords.length === 50 && outputDesign.includes("advanced") ? "advanced" : "quick"} 
              />
            </div>
          )}

        </section>

      </main>

      {/* FOOTER watermark across layout pages */}
      <footer className="border-t border-zinc-800 py-6 bg-zinc-950 mt-12 text-zinc-550 font-mono text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Ultimate Viral Analyzer. All audits active.</p>
          <p>Powered by Mehar Rizwan • Version 5.0 Stable Release • BENTO DESIGN SYSTEM ACTIVE</p>
        </div>
      </footer>

    </div>
  );
}
