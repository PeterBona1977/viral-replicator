import { Platform, ScannerFilters, SearchResult, SearchAudit, SUPPORTED_COUNTRIES } from '../../types';
import { SocialScraper } from './types';
import { tiktokScraper } from './tiktokScraper';
import { youtubeScraper } from './youtubeScraper';
import { instagramScraper } from './instagramScraper';

const scrapersMap: Partial<Record<Platform, SocialScraper>> = {
  [Platform.TikTok]: tiktokScraper,
  [Platform.YouTube]: youtubeScraper,
  [Platform.Instagram]: instagramScraper
};

export const runSocialScrapers = async (filters: ScannerFilters): Promise<SearchResult> => {
  const selectedPlatforms = filters.platforms && filters.platforms.length > 0
    ? filters.platforms
    : [Platform.TikTok];

  const countryCode = filters.countries[0] || 'US';
  const primaryCountry = SUPPORTED_COUNTRIES.find(c => c.code === countryCode)?.name || 'Global';
  const keywords = filters.keywords || "trending viral videos";

  const allLogs: string[] = [
    `Initiating Multi-Platform Social Scraper Engine...`,
    `Selected Target Networks: ${selectedPlatforms.join(', ')}`
  ];

  const allVideos = [];

  for (const platform of selectedPlatforms) {
    const scraper = scrapersMap[platform];
    if (scraper) {
      try {
        const result = await scraper.scrape(filters);
        allLogs.push(...result.logs);
        allVideos.push(...result.videos);
      } catch (err: any) {
        allLogs.push(`CRITICAL [${platform} Scraper Error]: ${err.message}`);
        if (platform === Platform.TikTok && !scraper.isConfigured()) {
          throw err;
        }
      }
    }
  }

  const audit: SearchAudit = {
    operationLog: allLogs,
    strategicSummary: `Successfully extracted ${allVideos.length} social video trends across ${selectedPlatforms.join(', ')}.`,
    regionInsight: `Live engagement metrics in ${primaryCountry} for keyword "${keywords}".`,
    replicationPlaybook: {
      hookAdvice: "Fast visual hook within first 1.5s with high-contrast text overlay.",
      audioStrategy: "Sync trending audio beat transitions under 1s pacing.",
      visualDirection: "Dynamic vertical 9:16 video format optimized for mobile algorithms."
    }
  };

  return {
    videos: allVideos,
    audit
  };
};

export { tiktokScraper, youtubeScraper, instagramScraper };
