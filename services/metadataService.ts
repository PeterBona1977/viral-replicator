import { Platform, PublishingMetadata, ViralVideo } from '../types';

export const generateSocialMetadata = async (video: ViralVideo, platforms: Platform[]): Promise<PublishingMetadata> => {
  const cleanTitle = (video.title || "viral video").replace(/[^\w\s]/gi, '');
  const keywords = cleanTitle.split(/\s+/).filter(w => w.length > 3).slice(0, 4);
  const hashtags = Array.from(new Set(['#viral', '#fyp', '#trending', `#${video.platform.toLowerCase()}`, ...keywords.map(w => `#${w.toLowerCase()}`)]));

  const creator = video.researchInsights?.creatorHandle ? `@${video.researchInsights.creatorHandle}` : 'viral_creator';

  return {
    caption: `🔥 ${video.title}\n\nViral trend breakdown based on original post by ${creator} (${video.views} views).\n\nReplicate this high-retention hook now!`,
    hashtags: hashtags.slice(0, 6),
    platforms: platforms
  };
};

export const analyzeViralTrend = async (description: string): Promise<string> => {
  return `Viral Pattern Breakdown: High-retention visual hook using dynamic text overlays and fast-cut pacing. Key theme: "${description}".`;
};

export const createCinematicPrompt = async (analysis: string): Promise<string> => {
  return `Vertical 9:16 cinematic video, high contrast studio lighting, 4K quality, fast cut pacing. Concept: ${analysis}.`;
};

export const generateReplication = async (prompt: string): Promise<string> => {
  return "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
};
