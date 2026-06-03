/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { Activity, ShieldCheck, Heart, AlertCircle } from "lucide-react";

interface ECGGraphProps {
  waveStyle: "small_wave" | "medium_wave" | "large_wave" | "steady_wave";
  statusLabel: string;
  confidenceLevel?: string | number;
  showCompletionStatus?: boolean;
  showConfidenceLevel?: boolean;
}

export default function ECGGraph({
  waveStyle,
  statusLabel,
  confidenceLevel = "98.5%",
  showCompletionStatus = true,
  showConfidenceLevel = true,
}: ECGGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<string>(waveStyle);
  const [bpm, setBpm] = useState(72);

  // Sync state style to ref so standard animation loop has instant access
  useEffect(() => {
    filterRef.current = waveStyle;
    if (waveStyle === "small_wave") setBpm(60);
    else if (waveStyle === "medium_wave") setBpm(84);
    else if (waveStyle === "large_wave") setBpm(115);
    else setBpm(72);
  }, [waveStyle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Resize handler to fit nicely in container
    const handleResize = () => {
      if (containerRef.current && canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 140 * dpr; // fixed professional viewport height
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `140px`;
        width = canvas.width;
        height = canvas.height;

        // Re-scale context
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Dynamic state management for drawing
    let lastX = 0;
    let lastY = 70; // centerY
    let sweepX = 0;
    let phase = 0;

    // Mathematical blueprint of a professional ECG PQRS waveform
    const getECGValue = (p: number, style: string) => {
      let multiplier = 1;

      switch (style) {
        case "small_wave":
          multiplier = 0.35;
          break;
        case "medium_wave":
          multiplier = 0.75;
          break;
        case "large_wave":
          multiplier = 1.4;
          break;
        case "steady_wave":
        default:
          multiplier = 0.95;
          break;
      }

      // ECG wave elements based on cycle phase (0.0 to 1.0)
      if (p < 0 || p > 1) p = p % 1;

      if (p >= 0.1 && p < 0.16) {
        // P-wave (Atrial depolarization): gentle upward curve
        return 0.12 * Math.sin(((p - 0.1) / 0.06) * Math.PI) * multiplier;
      }
      if (p >= 0.18 && p < 0.20) {
        // Q-wave: sharp tiny dip
        return -0.16 * Math.sin(((p - 0.18) / 0.02) * Math.PI) * multiplier;
      }
      if (p >= 0.20 && p < 0.23) {
        // R-spike (Ventricular depolarization): massive vertical explosion
        return 1.15 * Math.sin(((p - 0.20) / 0.03) * Math.PI) * multiplier;
      }
      if (p >= 0.23 && p < 0.26) {
        // S-wave: narrow deep downward dip
        return -0.38 * Math.sin(((p - 0.23) / 0.03) * Math.PI) * multiplier;
      }
      if (p >= 0.28 && p < 0.38) {
        // T-wave (Ventricular repolarization): smooth medium curve
        return 0.25 * Math.sin(((p - 0.28) / 0.10) * Math.PI) * multiplier;
      }
      if (p >= 0.38 && p < 0.41) {
        // U-wave: very subtle bump
        return 0.04 * Math.sin(((p - 0.38) / 0.03) * Math.PI) * multiplier;
      }

      return 0; // Baseline flat matching zero-voltage
    };

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = width / dpr;
      const cssHeight = height / dpr;
      const centerY = cssHeight / 2;

      // 1. Gently fade old contents using standard oscilloscope phosphorus composite operation
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.09)"; // creates clean sweeping glowing look
      ctx.fillRect(0, 0, cssWidth, cssHeight);
      ctx.globalCompositeOperation = "source-over";

      // 2. Erase a slice immediately ahead of the sweep sweepX to simulate moving beam
      const clearWidth = 24;
      ctx.clearRect(sweepX + 1, 0, clearWidth, cssHeight);

      // Increment phase to oscillate heart rate based on current beats-per-minute
      // BPM speed scaling: 60 BPM = 1 beat/sec. At 60fps, phase increases by ~1/60 per frame.
      const currentStyle = filterRef.current;
      let phaseIncrement = 0.016; // default fallback

      if (currentStyle === "large_wave") {
        phaseIncrement = 0.028; // hyper tachycardia speed scan
      } else if (currentStyle === "medium_wave") {
        phaseIncrement = 0.021; // elevated diagnostic speed
      } else if (currentStyle === "small_wave") {
        phaseIncrement = 0.012; // slow meticulous scan
      }

      phase = (phase + phaseIncrement) % 1.0;

      // Calculate new amplitude coordinate point
      const waveValue = getECGValue(phase, currentStyle);
      const targetAmpScale = cssHeight * 0.35; // keep it visually bounded
      const y = centerY - waveValue * targetAmpScale;

      // If we just wrapped around, do not draw link from other side of screen
      if (sweepX > 0) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(sweepX, y);

        // Styling the fluorescent glowing trace
        ctx.strokeStyle = "#a3e635"; // Neon Lime-400
        ctx.lineWidth = 2.2;
        ctx.shadowColor = "#a3e635";
        ctx.shadowBlur = 9;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();

        // Extra bright main dot at probe cursor
        ctx.beginPath();
        ctx.arc(sweepX, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 14;
        ctx.fill();

        // Reset shadows to preserve general layout rendering
        ctx.shadowBlur = 0;
      }

      // Push historical sweeping metrics
      lastX = sweepX;
      lastY = y;

      // Horizontal sweeping velocity
      const sweepVelocity = 2.5;
      sweepX += sweepVelocity;

      if (sweepX >= cssWidth) {
        sweepX = 0;
        lastX = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="border border-zinc-850 bg-zinc-950 rounded-2xl overflow-hidden relative shadow-lg shadow-black/80">
      
      {/* Oscilloscope Grid Overlay (CSS Background) */}
      <div 
        ref={containerRef}
        className="relative w-full h-[140px] overflow-hidden"
        style={{
          backgroundSize: "20px 20px, 100px 100px",
          backgroundImage: `
            linear-gradient(to right, rgba(163, 230, 53, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(163, 230, 53, 0.04) 1px, transparent 1px),
            linear-gradient(to right, rgba(163, 230, 53, 0.08) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(163, 230, 53, 0.08) 1.5px, transparent 1.5px)
          `,
          backgroundColor: "#050507",
        }}
      >
        {/* Canvas for rendering the active glow track */}
        <canvas ref={canvasRef} className="block absolute inset-0 z-10 pointers-events-none" />

        {/* Diagnostic Watermark Elements */}
        <div className="absolute top-3.5 left-4 z-20 pointer-events-none flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-lime-450/10 flex items-center justify-center text-lime-400">
            <Activity size={12} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-wider block leading-none">
              SYSTEM MONITOR
            </span>
            <span className="text-[9px] font-mono text-lime-400 uppercase tracking-widest block leading-none mt-1">
              ECG DIAGNOSTICS ACTIVE
            </span>
          </div>
        </div>

        {/* BPM Counter */}
        <div className="absolute top-3.5 right-4 z-20 pointer-events-none text-right">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block leading-none">
            FREQUENCY STYLE
          </span>
          <span className="text-sm font-mono font-black text-lime-400 block tracking-tight uppercase leading-none mt-1 select-none">
            {waveStyle.replace("_", " ")}
          </span>
        </div>

        {/* Sweep Status readout */}
        <div className="absolute bottom-3 right-4 z-20 pointer-events-none flex items-center gap-1.5 text-right font-mono bg-zinc-950/90 border border-zinc-850 px-2.5 py-1 rounded-md text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping"></span>
          <span className="text-zinc-500 uppercase">SYS STAGE:</span>
          <span className="text-white font-extrabold select-none truncate max-w-[150px] uppercase">
            {statusLabel}
          </span>
        </div>

        {/* Live sweeping dot decoration */}
        <div className="absolute bottom-3.5 left-4 z-25 pointer-events-none flex gap-3 text-xs font-mono font-bold">
          {showCompletionStatus && (
            <span className="text-[9px] text-[#00F4FF] flex items-center gap-1 uppercase select-none">
              <ShieldCheck size={11} className="inline" />
              STATUS: AUDITED
            </span>
          )}
          {showConfidenceLevel && (
            <span className="text-[9px] text-lime-300 flex items-center gap-1 uppercase select-none">
              <Heart size={11} className="inline fill-lime-350 animate-pulse text-lime-400" />
              CONFIDENCE: {confidenceLevel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
