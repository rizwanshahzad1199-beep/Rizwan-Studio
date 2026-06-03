/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[Warning] GEMINI_API_KEY environment variable is not set yet. Analysis calls will fail until configured.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const app = express();
const PORT = 3000;

// Increase body limit to handle sequential keyframes (base64)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Express v4/v5 routing
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", initialized: !!apiKey });
});

/**
 * Define the response structure for Gemini schema validation
 */
const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  description: "Ultimate Viral Analyzer Report JSON Schema",
  required: [
    "toolName",
    "poweredBy",
    "version",
    "timestamp",
    "category",
    "overallViralScore",
    "viralProbability",
    "facebook_page",
    "instagram",
    "tiktok",
    "youtube_channel",
    "titles",
    "hooks",
    "shortCaption",
    "longCaption",
    "hashtags",
    "seoKeywords",
    "seoHashtags",
    "strengths",
    "weaknesses",
    "emotionalTriggers",
    "viralTriggers",
    "bestPostingTimes",
    "bestPlatform",
    "engagementPrediction",
    "platformAnalysis",
    "title_safety_and_hook_engine",
    "advanced_analysis_engine",
    "qualityAuditPassed",
    "confidenceScore"
  ],
  properties: {
    toolName: { type: Type.STRING, description: "Must be 'Ultimate Viral Analyzer'" },
    poweredBy: { type: Type.STRING, description: "Must be 'Mehar Rizwan'" },
    version: { type: Type.STRING, description: "Must be '5.0'" },
    timestamp: { type: Type.STRING, description: "ISO Timestamp of the report" },
    
    category: {
      type: Type.OBJECT,
      required: ["mainCategory", "subCategory", "niche", "contentType", "targetAudience"],
      properties: {
        mainCategory: {
          type: Type.STRING,
          description: "Must be one of: Animals, Wildlife, Pets, Baby, Family, Food, Cooking, Nature, Travel, Luxury, Cars, Sports, Fitness, Technology, Science, Education, Comedy, Memes, Motivation, Business, Lifestyle, DIY, Entertainment, News, Other. If not identifiable, state 'Not Clearly Visible'"
        },
        subCategory: { type: Type.STRING, description: "Sub category name or 'Not Clearly Visible'" },
        niche: { type: Type.STRING, description: "Shorter sub-category / specific focus niche or 'Not Clearly Visible'" },
        contentType: { type: Type.STRING, description: "E.g., Informational, Comedy, Aesthetic, Storytelling, Challenge" },
        targetAudience: { type: Type.STRING, description: "Description of the primary targeted viewer persona" }
      }
    },
    
    overallViralScore: { type: Type.INTEGER, description: "Score from 1 to 100 representing virality" },
    viralProbability: {
      type: Type.STRING,
      description: "Must be one of: Low, Medium, High, Very High, Extreme"
    },

    facebook_page: {
      type: Type.OBJECT,
      description: "Platform content specifically optimized for Facebook Page.",
      required: ["title", "short_caption", "long_caption", "hashtags", "seo_tags"],
      properties: {
        title: { type: Type.STRING, description: "Facebook specific engaging post title." },
        short_caption: { type: Type.STRING, description: "Facebook specific short caption (high view retention)." },
        long_caption: { type: Type.STRING, description: "Facebook specific detailed storytelling narrative caption." },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 7 to 10 relevant high-performing hashtags for Facebook (do not include '#' symbol)."
        },
        seo_tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 10 to 20 highly relevant SEO tags tailored for Facebook search algorithm indexing."
        }
      }
    },

    instagram: {
      type: Type.OBJECT,
      description: "Platform content specifically optimized for Instagram Reels/Feed.",
      required: ["title", "short_caption", "long_caption", "hashtags", "seo_tags"],
      properties: {
        title: { type: Type.STRING, description: "Instagram specific engaging title/hook." },
        short_caption: { type: Type.STRING, description: "Instagram specific short bio/caption under 120 chars." },
        long_caption: { type: Type.STRING, description: "Instagram specific descriptive storytelling caption with rich phrasing." },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 7 to 10 relevant high-performing hashtags for Instagram (do not include '#' symbol)."
        },
        seo_tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 10 to 20 highly relevant SEO tags tailored for Instagram explore and Reels feed algorithm."
        }
      }
    },

    tiktok: {
      type: Type.OBJECT,
      description: "Platform content specifically optimized for TikTok For You Page.",
      required: ["title", "short_caption", "long_caption", "hashtags", "seo_tags"],
      properties: {
        title: { type: Type.STRING, description: "TikTok specific trendy short hook title." },
        short_caption: { type: Type.STRING, description: "TikTok specific quick trend-setting caption under 100 chars." },
        long_caption: { type: Type.STRING, description: "TikTok specific highly interactive narrative/question caption." },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 7 to 10 relevant viral trending hashtags for TikTok (do not include '#' symbol)."
        },
        seo_tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 10 to 20 highly relevant SEO tags tailored for TikTok SEO keyword search indexing."
        }
      }
    },

    youtube_channel: {
      type: Type.OBJECT,
      description: "Platform content specifically optimized for YouTube Shorts/Videos.",
      required: ["title", "short_caption", "long_caption", "hashtags", "seo_tags"],
      properties: {
        title: { type: Type.STRING, description: "YouTube CTR-optimized attention-grabbing title." },
        short_caption: { type: Type.STRING, description: "YouTube descriptive summary under 140 chars." },
        long_caption: { type: Type.STRING, description: "YouTube comprehensive description detailing background story and calls-to-action." },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 7 to 10 relevant YouTube hashtags for description field (do not include '#' symbol)."
        },
        seo_tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exactly 10 to 20 highly relevant search tags specifically matching YouTube video keyword tags."
        }
      }
    },
    
    titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Generate 20 high-performing, attention-grabbing USA style titles relevant to the media content"
    },
    hooks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Generate 15 dynamic video/image opening hook strategies (hook texts or copy overlays)"
    },
    
    shortCaption: { type: Type.STRING, description: "Concise caption optimized for maximum read-rate" },
    longCaption: { type: Type.STRING, description: "Longer, keyword-rich SEO caption with high storytelling value" },
    
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Clean lists of exactly 30 high-performing viral hashtags relevant to the media (without '#')"
    },
    seoKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 50 clean SEO keywords relevant to indexing the content"
    },
    seoHashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 50 clean SEO-ranking hashtags/search keys relevant to indexing the content"
    },
    
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List 3 to 5 clear visual/narrative strengths discovered during analysis"
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List 2 to 3 points of friction or elements that might lower retention/engagement"
    },
    emotionalTriggers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "E.g., Nostalgia, Awe, Humility, Curiosity, Surprise, Adrenaline"
    },
    viralTriggers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "E.g., Relatability, Loop potential, Curiosity gap, Controversy, Sharing trigger"
    },
    
    bestPostingTimes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Provide 3 high-volume posting times appropriate for this content niche"
    },
    bestPlatform: { type: Type.STRING, description: "The single best performing social network for this content format" },
    
    engagementPrediction: {
      type: Type.OBJECT,
      required: ["likes", "shares", "comments", "saves", "reach"],
      properties: {
        likes: { type: Type.STRING, description: "Estimated like engagement tier (e.g. 10K - 25K)" },
        shares: { type: Type.STRING, description: "Estimated share counts (e.g. 5K - 12K)" },
        comments: { type: Type.STRING, description: "Estimated comment engagement (e.g. 300 - 800)" },
        saves: { type: Type.STRING, description: "Estimated bookmark/save counts (e.g. 1K - 4K)" },
        reach: { type: Type.STRING, description: "Total predicted media reach estimate (e.g. 100K - 350K)" }
      }
    },
    
    platformAnalysis: {
      type: Type.OBJECT,
      required: ["facebook", "instagram", "tiktok", "youtubeShorts", "x", "pinterest"],
      properties: {
        facebook: {
          type: Type.OBJECT,
          required: ["score", "potential", "pros", "cons"],
          properties: {
            score: { type: Type.INTEGER },
            potential: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        instagram: {
          type: Type.OBJECT,
          required: ["score", "potential", "pros", "cons"],
          properties: {
            score: { type: Type.INTEGER },
            potential: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        tiktok: {
          type: Type.OBJECT,
          required: ["score", "potential", "pros", "cons"],
          properties: {
            score: { type: Type.INTEGER },
            potential: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        youtubeShorts: {
          type: Type.OBJECT,
          required: ["score", "potential", "pros", "cons"],
          properties: {
            score: { type: Type.INTEGER },
            potential: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        x: {
          type: Type.OBJECT,
          required: ["score", "potential", "pros", "cons"],
          properties: {
            score: { type: Type.INTEGER },
            potential: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        pinterest: {
          type: Type.OBJECT,
          required: ["score", "potential", "pros", "cons"],
          properties: {
            score: { type: Type.INTEGER },
            potential: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    },
    
    imageAnalysisDetail: {
      type: Type.OBJECT,
      properties: {
        mainSubject: { type: Type.STRING },
        secondarySubjects: { type: Type.STRING },
        visibleObjects: { type: Type.ARRAY, items: { type: Type.STRING } },
        background: { type: Type.STRING },
        environment: { type: Type.STRING },
        lighting: { type: Type.STRING },
        colors: { type: Type.ARRAY, items: { type: Type.STRING } },
        cameraAngle: { type: Type.STRING },
        composition: { type: Type.STRING },
        facialExpressions: { type: Type.STRING },
        bodyLanguage: { type: Type.STRING },
        actionDetection: { type: Type.STRING },
        emotionDetection: { type: Type.STRING },
        storyPotential: { type: Type.STRING },
        visualQualityScore: { type: Type.INTEGER }
      }
    },
    
    videoAnalysisDetail: {
      type: Type.OBJECT,
      properties: {
        videoLengthSeconds: { type: Type.INTEGER },
        sceneBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["sceneNo", "description", "action", "emotion", "retentionPotential"],
            properties: {
              sceneNo: { type: Type.INTEGER },
              description: { type: Type.STRING },
              action: { type: Type.STRING },
              emotion: { type: Type.STRING },
              retentionPotential: { type: Type.STRING }
            }
          }
        },
        openingHookStrength: { type: Type.INTEGER },
        middleRetentionStrength: { type: Type.INTEGER },
        endingStrength: { type: Type.INTEGER },
        storytellingQuality: { type: Type.STRING },
        cameraMotion: { type: Type.STRING },
        editingQuality: { type: Type.STRING },
        audioAnalysis: { type: Type.STRING },
        musicAnalysis: { type: Type.STRING },
        voiceAnalysis: { type: Type.STRING },
        watchTimePredictionSeconds: { type: Type.INTEGER },
        retentionPredictionPercentage: { type: Type.INTEGER },
        replayValue: { type: Type.STRING }
      }
    },
    
    title_safety_and_hook_engine: {
      type: Type.OBJECT,
      description: "Platform safety audit and scroll stopper checks of titles and hooks",
      required: [
        "facebook_safe",
        "instagram_safe",
        "tiktok_safe",
        "youtube_safe",
        "final_content_review",
        "scroll_stopper_titles",
        "target_audience_check",
        "passed_rules",
        "failed_rules"
      ],
      properties: {
        facebook_safe: { type: Type.BOOLEAN, description: "Whether the text elements fully comply with Facebook content guidelines" },
        instagram_safe: { type: Type.BOOLEAN, description: "Whether the text elements fully comply with Instagram community guidelines" },
        tiktok_safe: { type: Type.BOOLEAN, description: "Whether the text elements fully comply with TikTok community guidelines" },
        youtube_safe: { type: Type.BOOLEAN, description: "Whether the text elements fully comply with YouTube advertiser guidelines" },
        final_content_review: { type: Type.BOOLEAN, description: "Overall final content suitability review status" },
        scroll_stopper_titles: { type: Type.BOOLEAN, description: "Whether generated titles satisfy scroll stopper triggers" },
        target_audience_check: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Target dollar-based audience alignment checklist (e.g. ['USA Optimized', 'Canada Compatible', 'ANZ Aligned'])"
        },
        passed_rules: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of general safety rule descriptions verified as passed"
        },
        failed_rules: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of general safety rule descriptions flagged as failed or skipped to maintain safety policy"
        }
      }
    },

    advanced_analysis_engine: {
      type: Type.OBJECT,
      description: "Advanced multi-pass visual intelligence and validation engine report",
      required: [
        "multi_pass_analysis",
        "analysis_passes",
        "passes",
        "cross_check_results",
        "self_verification",
        "consistency_check",
        "confidence_scoring",
        "minimum_confidence_threshold",
        "uncertainty_policy",
        "detection_modules",
        "quality_control",
        "strict_rules"
      ],
      properties: {
        multi_pass_analysis: { type: Type.BOOLEAN, description: "Whether sequential analyzer multi-pass cycles were conducted" },
        analysis_passes: { type: Type.INTEGER, description: "Total number of detailed passes completed (must be 5)" },
        passes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of completed passes: ['Subject Detection', 'Object Detection', 'Scene and Environment Detection', 'Emotion and Story Detection', 'Validation and Verification']"
        },
        cross_check_results: { type: Type.BOOLEAN },
        self_verification: { type: Type.BOOLEAN },
        consistency_check: { type: Type.BOOLEAN },
        confidence_scoring: { type: Type.BOOLEAN },
        minimum_confidence_threshold: { type: Type.INTEGER },
        uncertainty_policy: {
          type: Type.OBJECT,
          required: ["allow_guessing", "if_uncertain"],
          properties: {
            allow_guessing: { type: Type.BOOLEAN },
            if_uncertain: { type: Type.STRING }
          }
        },
        detection_modules: {
          type: Type.OBJECT,
          required: [
            "main_subject_detection",
            "secondary_subject_detection",
            "animal_breed_detection",
            "species_detection",
            "object_detection",
            "activity_detection",
            "environment_detection",
            "weather_detection",
            "emotion_detection",
            "camera_angle_detection",
            "lighting_detection",
            "color_analysis",
            "story_analysis",
            "viral_trigger_analysis",
            "audience_analysis",
            "category_analysis",
            "niche_analysis"
          ],
          properties: {
            main_subject_detection: { type: Type.BOOLEAN },
            secondary_subject_detection: { type: Type.BOOLEAN },
            animal_breed_detection: { type: Type.BOOLEAN },
            species_detection: { type: Type.BOOLEAN },
            object_detection: { type: Type.BOOLEAN },
            activity_detection: { type: Type.BOOLEAN },
            environment_detection: { type: Type.BOOLEAN },
            weather_detection: { type: Type.BOOLEAN },
            emotion_detection: { type: Type.BOOLEAN },
            camera_angle_detection: { type: Type.BOOLEAN },
            lighting_detection: { type: Type.BOOLEAN },
            color_analysis: { type: Type.BOOLEAN },
            story_analysis: { type: Type.BOOLEAN },
            viral_trigger_analysis: { type: Type.BOOLEAN },
            audience_analysis: { type: Type.BOOLEAN },
            category_analysis: { type: Type.BOOLEAN },
            niche_analysis: { type: Type.BOOLEAN }
          }
        },
        video_analysis_modules: {
          type: Type.OBJECT,
          required: [
            "frame_by_frame_analysis",
            "scene_transition_detection",
            "hook_analysis",
            "retention_analysis",
            "watch_time_prediction",
            "replay_value_analysis",
            "audio_analysis",
            "voice_analysis",
            "motion_analysis",
            "ending_impact_analysis"
          ],
          properties: {
            frame_by_frame_analysis: { type: Type.BOOLEAN },
            scene_transition_detection: { type: Type.BOOLEAN },
            hook_analysis: { type: Type.BOOLEAN },
            retention_analysis: { type: Type.BOOLEAN },
            watch_time_prediction: { type: Type.BOOLEAN },
            replay_value_analysis: { type: Type.BOOLEAN },
            audio_analysis: { type: Type.BOOLEAN },
            voice_analysis: { type: Type.BOOLEAN },
            motion_analysis: { type: Type.BOOLEAN },
            ending_impact_analysis: { type: Type.BOOLEAN }
          }
        },
        quality_control: {
          type: Type.OBJECT,
          required: [
            "verify_category",
            "verify_niche",
            "verify_titles",
            "verify_captions",
            "verify_hashtags",
            "verify_seo_tags",
            "verify_viral_prediction",
            "final_audit"
          ],
          properties: {
            verify_category: { type: Type.BOOLEAN },
            verify_niche: { type: Type.BOOLEAN },
            verify_titles: { type: Type.BOOLEAN },
            verify_captions: { type: Type.BOOLEAN },
            verify_hashtags: { type: Type.BOOLEAN },
            verify_seo_tags: { type: Type.BOOLEAN },
            verify_viral_prediction: { type: Type.BOOLEAN },
            final_audit: { type: Type.BOOLEAN }
          }
        },
        strict_rules: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Strict audit constraints enforced during analysis lifecycle"
        }
      }
    },

    qualityAuditPassed: { type: Type.BOOLEAN, description: "Must verify that lists have exactly the requested amount of items and correct categories are assigned" },
    confidenceScore: { type: Type.INTEGER, description: "A percentage confidence level between 50 and 100 based on the visibility of elements" }
  }
};

/**
 * Endpoint to analyze image or sequential video frames
 */
app.post("/api/analyze", async (req: Request, res: Response) => {
  try {
    const { mediaType, frames, outputDesign, fileName, fileSize } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not defined. Please add your key in the AI Studio Settings secrets panel."
      });
    }

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({
        error: "No frames/images provided for analysis."
      });
    }

    // Convert frames (base64) to GoogleGenAI inlineData structure
    const imageParts = frames.map((frameData: string) => {
      let mimeType = "image/jpeg";
      let base64Data = frameData;

      if (frameData.startsWith("data:")) {
        const matches = frameData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      return {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };
    });

    const isVideo = mediaType === "video";
    const systemPrompt = `You are Ultimate Viral Analyzer powered by Mehar Rizwan. Analyze every uploaded image or video before generating any output. Never guess. Never create titles, captions, hashtags, SEO keywords, categories, niches, audience predictions, engagement predictions, or viral scores until analysis is complete. Use only visible information. If confidence is low, state 'Not Clearly Visible'. All outputs must pass quality validation.`;

    const modelPrompt = `
      Perform a deep, absolute visual and engagement analysis of the provided media.
      Media Type: \${mediaType} \${isVideo ? "(The uploaded images represent sequential frames extracted over the video lifetime)" : "(A single high-resolution image upload)"}
      Filename hints: \${fileName || "unknown"}
      Filesize hints: \${fileSize || "unknown"}
      Report style requested: \${outputDesign} (Provide complete data mapping in JSON)

      STRICT COMPLIANCE RULES:
      1. Choose the single most accurate Main Category from: Animals, Wildlife, Pets, Baby, Family, Food, Cooking, Nature, Travel, Luxury, Cars, Sports, Fitness, Technology, Science, Education, Comedy, Memes, Motivation, Business, Lifestyle, DIY, Entertainment, News, Other.
      2. If elements inside the scene cannot be determined, set the value to "Not Clearly Visible".
      
      3. TITLE SAFETY, WATCH TIME & HOOK ENGINE AUDIT:
         - Support dollar-based international markets of United States, Canada, Australia, and New Zealand.
         - Ensure all generated titles are Scroll-Stopper titles but strictly conform to title safety.
         - Safety constraints: Create extreme curiosity without clickbait. Keep titles easy to read, family friendly, and emotionally engaging.
         - Strictly AVOID: misleading claims, fake stories, shocking misinformation, exaggerated promises, dangerous topics, medical claims, financial promises, politics, hate speech, adult/violence content, gambling references, controversial or offensive language, profanity.
         - Caption constraints: Generate safe, family-friendly, natural body captions. Avoid policy violating or adult language.
         - Evaluate compliance in the "title_safety_and_hook_engine" schema node (set all safety check booleans to true after ensuring full compliance).
         - Include list of validated safety rules in "passed_rules", and other descriptions in "failed_rules" or "target_audience_check".

      4. STRICTOR EMOJI PLACEMENT CONSTRAINTS (CRITICAL CLASS OF ERRORS):
         - Use only ONE relevant emoji from the approved list at the END of each generated title/short caption/long caption.
         - NEVER place emojis at the beginning.
         - NEVER use multiple/duplicate emojis.
         - Zero tolerance for spammy, repetitive, or random emojis.
         - APPROVED LIST OF EMOJIS: ❤️, 🐾, 😊, 🥰, 🌿, ✨, 🔥, 😲, 😍, 🦁, 🐶, 🐱, 👶, 🚀, 💎, 💪.
         - If none fits well, default to ✨ at the very end.

      5. For the platform-specific contents:
         - facebook_page: Tailor a Title, a Short Caption (under 150 chars), a Long Caption (deep narrative), exactly 7 to 10 relevant hashtags, and exactly 10 to 20 relevant SEO tags.
         - instagram: Tailor a Title, a Short Caption (under 120 chars), a Long Caption (reels story hook), exactly 7 to 10 relevant hashtags, and exactly 10 to 20 relevant SEO tags.
         - tiktok: Tailor a Title (highly trendy), a Short Caption (under 100 chars), a Long Caption (dynamic conversation starter), exactly 7 to 10 relevant hashtags, and exactly 10 to 20 relevant SEO tags.
         - youtube_channel: Tailor a Title (high CTR), a Short Caption (under 140 chars), a Long Caption (comprehensive background + CTA), exactly 7 to 10 relevant hashtags, and exactly 10 to 20 relevant SEO tags.
         - ALWAYS generate totally different, platform-specific titles, captions, hashtags, and SEO tags for each of the four platforms. Never reuse the exact same title/caption across platforms.
         - Ensure hashtags contain only clean alphanumerics (do NOT include '#' symbol).

      6. Support legacy array hooks/titles as fallback:
         - Generate exactly 20 Attention-Grabbing USA style viral titles (complying strictly with the single approved emoji rule at the end, and title safety metrics).
         - Generate exactly 15 opening visual hook strategies or copy overlay structures.
         - Generate exactly 30 high-converting hashtags (without the leading "#", clean alphanumerics).
         - Generate exactly 50 SEO Keywords.
         - Generate exactly 50 SEO hashtags (search keys, clean nouns).

      7. Produce comprehensive platform specific analyses with engagement scoring (1-100), key pros and cons.
      
      8. If this is a video analysis:
         - Estimate the videoLengthSeconds (e.g. from 5s to 60s based on frame count or context).
         - Fill in multiple items in "videoAnalysisDetail.sceneBreakdown" representing each of the sequential canvas frames provided.
         - Populate editingQuality, storytellingQuality, cameraMotion, and watchTime predictions.
         
      9. If this is an image analysis:
         - Populate the "imageAnalysisDetail" structure details completely (mainSubject, secondarySubjects, objects, lighting, composition, cameraAngle, quality score).

      10. ADVANCED ANALYSIS ENGINE (MULTI-PASS AUDIT):
         - Set "multi_pass_analysis" to true.
         - Specify 5 "analysis_passes".
         - List completed passes strictly as ["Subject Detection", "Object Detection", "Scene and Environment Detection", "Emotion and Story Detection", "Validation and Verification"] in the "passes" array.
         - Perform "cross_check_results", "self_verification", and "consistency_check" (set all to true).
         - Adhere strictly to the "uncertainty_policy": allow_guessing should be false, and if_uncertain set to "Not Clearly Visible".
         - Evaluate each key detection module inside "detection_modules" (main_subject_detection, secondary_subject_detection, animal_breed_detection, species_detection, object_detection, activity_detection, environment_detection, weather_detection, emotion_detection, camera_angle_detection, lighting_detection, color_analysis, story_analysis, viral_trigger_analysis, audience_analysis, category_analysis, niche_analysis). Set them all to true.
         - If this is a video analysis, also evaluate video_analysis_modules (frame_by_frame_analysis, scene_transition_detection, hook_analysis, retention_analysis, watch_time_prediction, replay_value_analysis, audio_analysis, voice_analysis, motion_analysis, ending_impact_analysis) as true.
         - Complete full "quality_control" block auditing category, niche, titles, captions, hashtags, seo_tags, and viral prediction. Set audit flags to true.
         - List our core "strict_rules" inside strict_rules array verbatim:
           ["Never generate content before analysis is complete.", "Never assume hidden details.", "Never identify unclear objects with certainty.", "Never use irrelevant hashtags.", "Never create captions that do not match the content.", "Never create titles that do not match the content.", "Run verification before every output.", "Output only after all validation checks pass."]

      Perform double-analysis and cross-validation to satisfy Mehar Rizwan's version 5.0 quality audit rules and Title Safety validation. Return the results in perfect JSON format.
    `;

    console.log(`[Backend] Sending request to Gemini-3.5-flash for ${mediaType} analysis...`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...imageParts,
        { text: modelPrompt },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Lower temperature to follow rules strictly and prevent guessing
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response or empty text returned from Gemini API.");
    }

    // Attempt to parse validation
    const reportData = JSON.parse(responseText);
    
    // Inject server details if missing
    reportData.toolName = "Ultimate Viral Analyzer";
    reportData.poweredBy = "Mehar Rizwan";
    reportData.version = "5.0";
    reportData.timestamp = new Date().toISOString();
    reportData.mediaType = mediaType;

    return res.json(reportData);
  } catch (error: any) {
    console.error("[Backend Error] Error in analyze endpoint:", error);
    return res.status(500).json({
      error: "Analysis request failed",
      details: error?.message || error
    });
  }
});

// Configure Vite or Static files depending on Environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.info("[Dev Mode] Running Express server with interactive Vite middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.info("[Production Mode] Serving optimized static frontend assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Ultimate Viral Analyzer Server] successfully mounted and running on port ${PORT}`);
  });
}

startServer();
