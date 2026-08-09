import { Platform, ScannerFilters, ViralVideo, VideoStatus, SUPPORTED_COUNTRIES } from '../../types';
import { SocialScraper, ScraperResult } from './types';
import { getApifyToken } from '../apifyService';

const formatViews = (num: number): string => {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const instagramScraper: SocialScraper = {
  platform: Platform.Instagram,

  isConfigured: () => {
    return !!getApifyToken();
  },

  scrape: async (filters: ScannerFilters): Promise<ScraperResult> => {
    const rawKeyword = filters.keywords ? filters.keywords.trim() : "viral reels";
    const countryCode = filters.countries[0] || 'US';
    const countryObj = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
    const countryName = countryObj ? countryObj.name : 'United States';
    const count = filters.resultCount || 8;
    const token = getApifyToken();

    const logs: string[] = [
      `Instagram Reels Scraper engine initiated`,
      `Target Region: ${countryName} (${countryCode}) | Query: "${rawKeyword}"`,
      `Time Window: ${filters.timeRange} | Max Duration: 90s`
    ];

    if (!token) {
      logs.push("⚠️ Apify API Token missing in Settings. Please set token to enable Instagram extraction.");
      return { platform: Platform.Instagram, videos: [], logs };
    }

    try {
      const actorId = "apify/instagram-reel-scraper";
      const url = `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=60`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchKeywords: [rawKeyword, `${rawKeyword} reels`],
          resultsLimit: count * 2
        })
      });

      if (response.ok) {
        const items = await response.json();
        if (Array.isArray(items) && items.length > 0) {
          logs.push(`Instagram Apify Scraper returned ${items.length} live reels.`);
          
          const filteredVideos: ViralVideo[] = [];

          for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];
            const durationSecs = Number(item.videoDuration || item.duration || 30);

            if (durationSecs > 90) {
              continue;
            }

            const viewsNum = Number(item.playCount || item.videoViewCount || item.videoPlayCount || 0);
            const likesNum = Number(item.likesCount || item.likeCount || 0);
            const commentsNum = Number(item.commentsCount || item.commentCount || 0);
            const sharesNum = Number(item.sharesCount || Math.floor(likesNum * 0.06));

            const engRatio = viewsNum > 0 ? (likesNum + commentsNum * 2) / viewsNum : 0.07;
            const engPercentage = (engRatio * 100).toFixed(1);

            const baseScore = Math.log10(Math.max(viewsNum, 100)) * 8.5;
            const engBonus = Math.min(30, engRatio * 200);

            const computedScore = Math.min(98, Math.max(38, Math.round(baseScore + engBonus)));

            const mins = Math.floor(durationSecs / 60);
            const secs = Math.floor(durationSecs % 60);
            const formattedDur = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            const summaryText = item.caption || `Instagram Reel in ${countryName} targeting ${rawKeyword}.`;

            filteredVideos.push({
              id: `ig_${item.id || idx}_${Date.now()}`,
              title: summaryText,
              description: summaryText,
              originalUrl: item.url || `https://www.instagram.com/reels`,
              thumbnailUrl: item.displayUrl || item.thumbnailUrl || 'https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=500&auto=format&fit=crop',
              platform: Platform.Instagram,
              viralScore: computedScore,
              views: formatViews(viewsNum),
              country: countryCode,
              originalPostDate: item.timestamp ? item.timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
              status: VideoStatus.Scanned,
              createdAt: Date.now(),
              searchSources: [{ title: `Instagram Reels Scraper (${countryCode})`, uri: item.url || 'https://instagram.com/reels' }],
              researchInsights: {
                hookType: 'Visual Aesthetic Hook',
                audienceSegment: `${countryName} IG Feed`,
                commercialIntent: 'High',
                viralVelocity: `${engPercentage}% Engaged Velocity`,
                creatorHandle: item.ownerUsername || 'reels_creator',
                likeCount: formatViews(likesNum),
                commentCount: formatViews(commentsNum),
                shareCount: formatViews(sharesNum),
                duration: durationSecs,
                durationFormatted: formattedDur,
                engagementRate: `${engPercentage}%`,
                summary: summaryText
              }
            });
          }

          logs.push(`Successfully filtered ${filteredVideos.length} short Instagram Reels (<90s).`);
          return { platform: Platform.Instagram, videos: filteredVideos.slice(0, count), logs };
        }
      }
    } catch (err: any) {
      logs.push(`⚠️ Instagram Live Scraper Error: ${err.message}`);
    }

    return { platform: Platform.Instagram, videos: [], logs };
  }
};

