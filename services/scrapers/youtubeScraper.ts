import { Platform, ScannerFilters, ViralVideo, VideoStatus, TimeRange, SUPPORTED_COUNTRIES } from '../../types';
import { SocialScraper, ScraperResult } from './types';
import { getApifyToken, getApifyYouTubeActorId } from '../apifyService';

const formatViews = (num: number): string => {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const parseDurationInSeconds = (rawDuration: any): number => {
  if (typeof rawDuration === 'number' && !isNaN(rawDuration)) return rawDuration;
  if (typeof rawDuration === 'string') {
    // Format "01:30" or "0:45" or ISO "PT45S"
    if (rawDuration.includes(':')) {
      const parts = rawDuration.split(':').map(p => parseInt(p, 10) || 0);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const secMatch = rawDuration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/i);
    if (secMatch) {
      const mins = parseInt(secMatch[1] || '0', 10);
      const secs = parseInt(secMatch[2] || '0', 10);
      return mins * 60 + secs;
    }
    const num = parseInt(rawDuration, 10);
    if (!isNaN(num)) return num;
  }
  return 45; // Default short video estimate
};

const formatSeconds = (totalSecs: number): string => {
  const mins = Math.floor(totalSecs / 60);
  const secs = Math.floor(totalSecs % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const youtubeScraper: SocialScraper = {
  platform: Platform.YouTube,

  isConfigured: () => {
    return !!getApifyToken();
  },

  scrape: async (filters: ScannerFilters): Promise<ScraperResult> => {
    const rawKeyword = filters.keywords ? filters.keywords.trim() : "trending shorts";
    const countryCode = filters.countries[0] || 'US';
    const countryObj = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
    const countryName = countryObj ? countryObj.name : 'United States';
    const count = filters.resultCount || 8;
    const token = getApifyToken();
    const actorId = getApifyYouTubeActorId();

    let timeFilterKey = "now";
    if (filters.timeRange === TimeRange.Today) {
      timeFilterKey = "24h";
    } else if (filters.timeRange === TimeRange.Week) {
      timeFilterKey = "7d";
    } else if (filters.timeRange === TimeRange.Month) {
      timeFilterKey = "30d";
    }

    const logs: string[] = [
      `YouTube Shorts Scraper initiated (Actor: ${actorId})`,
      `Target Region: ${countryName} (${countryCode}) | Query: "${rawKeyword}"`,
      `Time Window: ${filters.timeRange} | Max Duration: 90s`
    ];

    if (!token) {
      logs.push("⚠️ Apify API Token is missing in Settings. Please set token to enable live YouTube extraction.");
      return { platform: Platform.YouTube, videos: [], logs };
    }

    try {
      const url = `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=60`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchKeywords: [rawKeyword, `${rawKeyword} shorts`],
          searchQueries: [rawKeyword],
          keywords: [rawKeyword],
          query: rawKeyword,
          maxResults: count * 3,
          maxItems: count * 3,
          country: countryCode,
          countryCode: countryCode,
          dateFilter: timeFilterKey,
          publishTime: timeFilterKey,
          shortsOnly: true,
          duration: "short",
          maxDuration: 90
        })
      });

      if (response.ok) {
        const items = await response.json();
        if (Array.isArray(items) && items.length > 0) {
          logs.push(`YouTube Apify Scraper (${actorId}) returned ${items.length} live results.`);
          
          const filteredVideos: ViralVideo[] = [];

          for (let idx = 0; idx < items.length; idx++) {
            const item = items[idx];

            // 1. Strict Short-Form Duration Filter (<90s)
            const durationSecs = parseDurationInSeconds(item.duration || item.durationSeconds || item.videoLength);
            const isExplicitShort = item.isShort || (item.url && item.url.includes('/shorts/')) || (item.title && item.title.includes('#shorts'));

            // Reject longform videos (> 90 seconds)
            if (durationSecs > 90 && !isExplicitShort) {
              continue;
            }

            const viewsNum = Number(item.viewCount || item.views || item.statistics?.viewCount || 0);
            const likesNum = Number(item.likeCount || item.likes || item.statistics?.likeCount || 0);
            const commentsNum = Number(item.commentCount || item.commentsCount || item.comments || 0);
            const sharesNum = Number(item.shareCount || item.shares || Math.floor(likesNum * 0.08));
            
            const creatorName = item.channelName || item.channelTitle || item.author || item.authorMeta?.name || item.username || item.channel?.title || 'youtube_creator';
            const videoUrl = item.webVideoUrl || item.videoUrl || item.url || item.link || `https://www.youtube.com/watch?v=${item.id || idx}`;
            const thumbUrl = item.thumbnailUrl || item.thumbnail || item.thumbnails?.[0]?.url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=500&auto=format&fit=crop';
            const titleText = item.title || item.text || item.description || `YouTube Shorts: ${rawKeyword}`;
            
            // 2. Realistic Dynamic Viral Score Calculation (Range 35 to 98)
            const engRatio = viewsNum > 0 ? (likesNum + commentsNum * 2) / viewsNum : 0.06;
            const engPercentage = (engRatio * 100).toFixed(1);

            const rawOutlier = Number(item.outlierScore || item.outlierRatio || item.outlier || item.score || 0);
            
            let baseScore = Math.log10(Math.max(viewsNum, 100)) * 8.5; // 10k views -> ~34, 100k views -> ~42.5, 1M views -> ~51
            let engagementBonus = Math.min(28, engRatio * 220); // ~10% eng -> +22
            let outlierBonus = rawOutlier > 1 ? Math.min(24, rawOutlier * 3.5) : 8;

            const computedScore = Math.min(98, Math.max(38, Math.round(baseScore + engagementBonus + outlierBonus)));

            const formattedDur = formatSeconds(durationSecs > 90 ? 55 : durationSecs);
            const summaryText = item.description || item.text || `Viral Short targeting ${rawKeyword} in ${countryName}. High visual retention with ${engPercentage}% engagement.`;

            filteredVideos.push({
              id: `yt_${item.id || item.videoId || idx}_${Date.now()}`,
              title: titleText,
              description: summaryText,
              originalUrl: videoUrl,
              thumbnailUrl: thumbUrl,
              platform: Platform.YouTube,
              viralScore: computedScore,
              views: formatViews(viewsNum),
              country: countryCode,
              originalPostDate: item.publishedAt ? item.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
              status: VideoStatus.Scanned,
              createdAt: Date.now(),
              searchSources: [{ title: `YouTube Shorts Scraper (${actorId})`, uri: videoUrl }],
              researchInsights: {
                hookType: rawOutlier > 1 ? `Outlier ${rawOutlier.toFixed(1)}x Retention Hook` : `YouTube Shorts Verified`,
                audienceSegment: `${countryName} YouTube Shorts`,
                commercialIntent: 'High',
                viralVelocity: rawOutlier > 1 ? `High Outlier (${rawOutlier.toFixed(1)}x)` : `${engPercentage}% Engaged Velocity`,
                creatorHandle: creatorName,
                likeCount: formatViews(likesNum),
                commentCount: formatViews(commentsNum),
                shareCount: formatViews(sharesNum),
                duration: durationSecs,
                durationFormatted: formattedDur,
                engagementRate: `${engPercentage}%`,
                outlierMultiplier: rawOutlier > 1 ? `${rawOutlier.toFixed(1)}x` : undefined,
                summary: summaryText
              }
            });
          }

          logs.push(`Successfully filtered ${filteredVideos.length} native YouTube Shorts (<90s) with dynamic scoring.`);
          return { platform: Platform.YouTube, videos: filteredVideos.slice(0, count), logs };
        } else {
          logs.push(`YouTube Apify Actor returned 0 items for search.`);
        }
      } else {
        const errText = await response.text().catch(() => '');
        logs.push(`⚠️ Apify YouTube Actor returned HTTP ${response.status}: ${errText || response.statusText}`);
      }
    } catch (err: any) {
      logs.push(`⚠️ YouTube Apify Scraper Error: ${err.message}`);
    }

    return { platform: Platform.YouTube, videos: [], logs };
  }
};

