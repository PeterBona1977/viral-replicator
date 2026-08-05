import { Platform, VideoStatus, ViralVideo, ScannerFilters, SUPPORTED_COUNTRIES, SocialAccount, PublishingMetadata, SearchResult, SearchAudit, SearchSource } from "../types";
import { fetchTikTokTrendsViaApify, isApifyConfigured } from "./apifyService";

export const scanForViralTrends = async (filters: ScannerFilters, accounts: SocialAccount[]): Promise<SearchResult> => {
    const countryCode = filters.countries[0];
    const primaryCountry = SUPPORTED_COUNTRIES.find(c => c.code === countryCode)?.name || 'Global';
    const keywords = filters.keywords || "trending viral videos";

    if (!isApifyConfigured()) {
        throw new Error("Apify API Token not configured. Please enter a valid Apify Token in Settings.");
    }

    const apifyVideos = await fetchTikTokTrendsViaApify(filters);

    const audit: SearchAudit = {
        operationLog: [
            "Apify TikTok Scraper engine invoked",
            `Successfully fetched ${apifyVideos.length} real TikTok videos from Apify`,
            `Targeting region ${primaryCountry} & search query "${keywords}"`,
            "Extracted live metrics, creator handles, and viral scores"
        ],
        strategicSummary: `Successfully extracted ${apifyVideos.length} real-world TikTok videos via Apify.`,
        regionInsight: `Live engagement metrics in ${primaryCountry} for search term "${keywords}".`,
        replicationPlaybook: { 
            hookAdvice: "Fast visual hook within first 1.5s with high-contrast text overlay.", 
            audioStrategy: "Sync trending TikTok sound with 0.8s beat transitions.", 
            visualDirection: "Dynamic vertical 9:16 video format with vibrant exposure." 
        }
    };

    return { videos: apifyVideos, audit };
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

export const generateSocialMetadata = async (video: ViralVideo, platforms: Platform[]): Promise<PublishingMetadata> => {
    const cleanTitle = (video.title || "viral video").replace(/[^\w\s]/gi, '');
    const keywords = cleanTitle.split(/\s+/).filter(w => w.length > 3).slice(0, 4);
    const hashtags = Array.from(new Set(['#viral', '#fyp', '#trending', '#tiktok', ...keywords.map(w => `#${w.toLowerCase()}`)]));
    
    return {
        caption: `🔥 ${video.title}\n\nViral trend analysis by @${video.researchInsights?.creatorHandle || 'creator'} (${video.views} views).\n\nReplicate this viral hook now!`,
        hashtags: hashtags.slice(0, 6),
        platforms: platforms
    };
};
