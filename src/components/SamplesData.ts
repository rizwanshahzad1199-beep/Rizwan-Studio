/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PresetSample {
  id: string;
  title: string;
  type: "image" | "video";
  category: string;
  description: string;
  suggestedOutput: string;
  // A single gorgeous base64 stylized data URL or SVG mockup for instant rendering
  thumbnail: string;
  // Sequential keyframes (array of base64 data URLs)
  frames: string[];
}

// Generate stylized SVG grids encoded as Data URLs to serve as reliable presets with zero external dependencies
const makeGradientSvg = (title: string, color1: string, color2: string, text: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
      <defs>
        <linearGradient id="g_${title.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g_${title.replace(/\s+/g, '')})" rx="12" />
      <circle cx="320" cy="180" r="70" fill="white" fill-opacity="0.15" />
      <g transform="translate(320, 180)">
        <text text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="'Inter', sans-serif" font-weight="800" font-size="28" letter-spacing="-0.5">${title}</text>
        <text y="40" text-anchor="middle" dominant-baseline="middle" fill="#e2e8f0" font-family="'JetBrains Mono', monospace" font-size="14" fill-opacity="0.9">${text}</text>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: "preset-cute-pet",
    title: "Puppy's First Snow",
    type: "video",
    category: "Pets / Animals",
    description: "Extremely cute close-up of a golden retriever puppy blinking as snowflakes land on its nose. Highly emotional and shareable.",
    suggestedOutput: "advanced",
    thumbnail: makeGradientSvg("Cute Puppy", "#FF8C94", "#FFD3B6", "Viral Pet Keyframes"),
    frames: [
      makeGradientSvg("Puppy Frame 1", "#FF8993", "#FFD1B5", "Scene: Puppy steps out (0.0s)"),
      makeGradientSvg("Puppy Frame 2", "#FF829E", "#FFCBBA", "Scene: Snowflakes fall (1.5s)"),
      makeGradientSvg("Puppy Frame 3", "#FF7CA8", "#FFC5BF", "Scene: Extreme close-up nose (3.0s)"),
      makeGradientSvg("Puppy Frame 4", "#FF76B3", "#FFBFC4", "Scene: Blinks & sneezes (4.5s)"),
      makeGradientSvg("Puppy Frame 5", "#FF70BD", "#FFB9C9", "Scene: Wagging tail Joy (6.0s)")
    ]
  },
  {
    id: "preset-cooking-gourmet",
    title: "15-Sec Creamy Pasta Prep",
    type: "video",
    category: "Food / Cooking",
    description: "High-speed culinary short showing hot garlic oil, cream swirl, and fresh parmesan grating in cinematic macro lighting.",
    suggestedOutput: "quick",
    thumbnail: makeGradientSvg("Gourmet Pasta", "#FFA07A", "#FF4500", "Viral Cooking Prep"),
    frames: [
      makeGradientSvg("Pasta Frame 1", "#FFA27C", "#FF4300", "Scene: Hot pan garlic pop (0.0s)"),
      makeGradientSvg("Pasta Frame 2", "#FFA883", "#FF3C00", "Scene: Pouring heavy cream (3.0s)"),
      makeGradientSvg("Pasta Frame 3", "#FFAE8A", "#FF3500", "Scene: Al dente pasta toss (6.0s)"),
      makeGradientSvg("Pasta Frame 4", "#FFB491", "#FF2E00", "Scene: Grating cheese rainfall (9.0s)"),
      makeGradientSvg("Pasta Frame 5", "#FFBA98", "#FF2700", "Scene: Slow-mo steam swirl (12.0s)")
    ]
  },
  {
    id: "preset-luxury-cars",
    title: "Cyberpunk Supercar Glow",
    type: "image",
    category: "Luxury / Cars",
    description: "A dark neon-lit street in Tokyo featuring a matte black hypercar with electric cyan rims under wet rain reflections.",
    suggestedOutput: "advanced",
    thumbnail: makeGradientSvg("Tokyo Grid Run", "#1A1B2F", "#16E2F5", "Viral Hypercar Shot"),
    frames: [
      makeGradientSvg("Hypercar Main Hero", "#1A1B2F", "#16E2F5", "Subject: Matte Black Supercar")
    ]
  },
  {
    id: "preset-meme-comedy",
    title: "Me vs. My Compiler",
    type: "image",
    category: "Comedy / Memes",
    description: "Highly relatable programming meme containing a side-by-side comparative split layout of developer facial expressions.",
    suggestedOutput: "quick",
    thumbnail: makeGradientSvg("Dev Meme", "#43C6AC", "#191654", "Relatability Viral Loop"),
    frames: [
      makeGradientSvg("Dev Meme Main", "#43C6AC", "#191654", "Subject: Relative Coding Meme")
    ]
  }
];
