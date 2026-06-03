/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Supported main categories
export type MainCategory =
  | "Animals"
  | "Wildlife"
  | "Pets"
  | "Baby"
  | "Family"
  | "Food"
  | "Cooking"
  | "Nature"
  | "Travel"
  | "Luxury"
  | "Cars"
  | "Sports"
  | "Fitness"
  | "Technology"
  | "Science"
  | "Education"
  | "Comedy"
  | "Memes"
  | "Motivation"
  | "Business"
  | "Lifestyle"
  | "DIY"
  | "Entertainment"
  | "News"
  | "Other";

export interface CategoryDetection {
  mainCategory: MainCategory | "Not Clearly Visible";
  subCategory: string; // or 'Not Clearly Visible'
  niche: string; // or 'Not Clearly Visible'
  contentType: string;
  targetAudience: string;
}

export interface EngagementPrediction {
  likes: string; // Estimated numbers with high/medium/low range (e.g. "10K - 50K")
  shares: string;
  comments: string;
  saves: string;
  reach: string;
}

export interface PlatformScore {
  score: number; // 1-100
  potential: "Low" | "Medium" | "High" | "Extreme";
  pros: string[];
  cons: string[];
}

export interface PlatformAnalysis {
  facebook: PlatformScore;
  instagram: PlatformScore;
  tiktok: PlatformScore;
  youtubeShorts: PlatformScore;
  x: PlatformScore;
  pinterest: PlatformScore;
}

export interface SceneAnalysis {
  sceneNo: number;
  description: string;
  action: string;
  emotion: string;
  retentionPotential: "Low" | "Medium" | "High";
}

export interface VisualAnalysis {
  mainSubject: string;
  secondarySubjects: string;
  visibleObjects: string[];
  background: string;
  environment: string;
  lighting: string;
  colors: string[];
  cameraAngle: string;
  composition: string;
  facialExpressions: string;
  bodyLanguage: string;
  actionDetection: string;
  emotionDetection: string;
  storyPotential: string;
  visualQualityScore: number; // 1-10
}

export interface VideoAnalysis {
  videoLengthSeconds: number;
  sceneBreakdown: SceneAnalysis[];
  openingHookStrength: number; // 1-100
  middleRetentionStrength: number; // 1-100
  endingStrength: number; // 1-100
  storytellingQuality: string;
  cameraMotion: string;
  editingQuality: string;
  audioAnalysis: string;
  musicAnalysis: string;
  voiceAnalysis: string;
  watchTimePredictionSeconds: number;
  retentionPredictionPercentage: number;
  replayValue: "Low" | "Medium" | "High" | "Extremely High";
}

export interface PlatformContent {
  title: string;
  short_caption: string;
  long_caption: string;
  hashtags: string[];
  seo_tags: string[];
}

export interface UltimateViralAnalysisResult {
  toolName: string;
  poweredBy: string;
  version: string;
  timestamp: string;
  mediaType: "image" | "video";
  
  category: CategoryDetection;
  
  // Virality scores
  overallViralScore: number; // 1-100
  viralProbability: "Low" | "Medium" | "High" | "Very High" | "Extreme";
  
  // Platform-specific content outputs (new layout)
  facebook_page: PlatformContent;
  instagram: PlatformContent;
  tiktok: PlatformContent;
  youtube_channel: PlatformContent;
  
  // Content Generation output (legacy / fallback)
  titles: string[]; // Up to 20 options
  hooks: string[]; // Up to 15 options
  shortCaption: string;
  longCaption: string;
  hashtags: string[]; // Up to 30 options
  seoKeywords: string[]; // Up to 50 options
  seoHashtags: string[]; // Up to 50 options
  
  // Intelligence
  strengths: string[];
  weaknesses: string[];
  emotionalTriggers: string[];
  viralTriggers: string[];
  bestPostingTimes: string[];
  bestPlatform: string;
  
  engagementPrediction: EngagementPrediction;
  platformAnalysis: PlatformAnalysis;
  
  // Media specific breakdowns
  imageAnalysisDetail?: VisualAnalysis;
  videoAnalysisDetail?: VideoAnalysis;
  
  // Title safety and hook engine audit
  title_safety_and_hook_engine?: TitleSafetyAndHookEngine;
  
  // Advanced Analysis Engine Verification
  advanced_analysis_engine?: AdvancedAnalysisEngine;
  
  // Audit Verification
  qualityAuditPassed: boolean;
  confidenceScore: number; // percentage, e.g. 95
}

export interface AdvancedAnalysisEngine {
  multi_pass_analysis: boolean;
  analysis_passes: number;
  passes: string[];
  cross_check_results: boolean;
  self_verification: boolean;
  consistency_check: boolean;
  confidence_scoring: boolean;
  minimum_confidence_threshold: number;
  uncertainty_policy: {
    allow_guessing: boolean;
    if_uncertain: string;
  };
  detection_modules: {
    main_subject_detection: boolean;
    secondary_subject_detection: boolean;
    animal_breed_detection: boolean;
    species_detection: boolean;
    object_detection: boolean;
    activity_detection: boolean;
    environment_detection: boolean;
    weather_detection: boolean;
    emotion_detection: boolean;
    camera_angle_detection: boolean;
    lighting_detection: boolean;
    color_analysis: boolean;
    story_analysis: boolean;
    viral_trigger_analysis: boolean;
    audience_analysis: boolean;
    category_analysis: boolean;
    niche_analysis: boolean;
  };
  video_analysis_modules?: {
    frame_by_frame_analysis: boolean;
    scene_transition_detection: boolean;
    hook_analysis: boolean;
    retention_analysis: boolean;
    watch_time_prediction: boolean;
    replay_value_analysis: boolean;
    audio_analysis: boolean;
    voice_analysis: boolean;
    motion_analysis: boolean;
    ending_impact_analysis: boolean;
  };
  quality_control: {
    verify_category: boolean;
    verify_niche: boolean;
    verify_titles: boolean;
    verify_captions: boolean;
    verify_hashtags: boolean;
    verify_seo_tags: boolean;
    verify_viral_prediction: boolean;
    final_audit: boolean;
  };
  strict_rules: string[];
}

export interface TitleSafetyAndHookEngine {
  facebook_safe: boolean;
  instagram_safe: boolean;
  tiktok_safe: boolean;
  youtube_safe: boolean;
  final_content_review: boolean;
  scroll_stopper_titles: boolean;
  target_audience_check: string[];
  passed_rules: string[];
  failed_rules: string[];
}

export interface SampleMedia {
  id: string;
  title: string;
  type: "image" | "video";
  url: string;
  category: string;
  thumbnail: string;
}
