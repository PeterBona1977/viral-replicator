import { ScannerFilters, Platform, VideoStatus, ViralVideo, TimeRange, SUPPORTED_COUNTRIES } from '../types';
import { APIFY_API_TOKEN, APIFY_TIKTOK_ACTOR_ID, APIFY_YOUTUBE_ACTOR_ID } from '../constants';

const TOKEN_KEY = 'apify_token_override';
const ACTOR_KEY = 'apify_actor_override';
const YOUTUBE_ACTOR_KEY = 'apify_youtube_actor_override';
const INSTAGRAM_ACTOR_KEY = 'apify_instagram_actor_override';

export const APIFY_ACTOR_PRESETS = {
  TikTok: [
    { label: 'Coregent TikTok Viral Finder', id: 'coregent/tiktok-viral-video-finder' },
    { label: 'Clockworks Free TikTok Scraper', id: 'clockworks/free-tiktok-scraper' },
    { label: 'Apify Official TikTok Scraper', id: 'apify/tiktok-scraper' }
  ],
  YouTube: [
    { label: 'YouTube Shorts Scraper', id: '8frL5jLRMkNtPuwIo' },
    { label: 'Streamers YouTube Scraper', id: 'streamers/youtube-scraper' },
    { label: 'Apify Official YouTube Scraper', id: 'apify/youtube-scraper' }
  ],
  Instagram: [
    { label: 'Apify Instagram Reel Scraper', id: 'apify/instagram-reel-scraper' },
    { label: 'Apify Official Instagram Scraper', id: 'apify/instagram-scraper' },
    { label: 'Reels Scraper Engine', id: 'jaroslav/instagram-reels-scraper' }
  ]
};

export const getApifyToken = (): string => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(TOKEN_KEY);
    if (local) return local.trim();
  }
  const envToken = (import.meta as any).env?.VITE_APIFY_API_TOKEN;
  if (envToken) return envToken.trim();
  return (APIFY_API_TOKEN || '').trim();
};

export const setApifyToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
};

export const getApifyActorId = (): string => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(ACTOR_KEY);
    if (local) return local.trim();
  }
  return (APIFY_TIKTOK_ACTOR_ID || 'coregent/tiktok-viral-video-finder').trim();
};

export const setApifyActorId = (actorId: string): void => {
  if (typeof window !== 'undefined') {
    if (actorId) {
      localStorage.setItem(ACTOR_KEY, actorId.trim());
    } else {
      localStorage.removeItem(ACTOR_KEY);
    }
  }
};

export const getApifyYouTubeActorId = (): string => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(YOUTUBE_ACTOR_KEY);
    if (local) return local.trim();
  }
  return (APIFY_YOUTUBE_ACTOR_ID || '8frL5jLRMkNtPuwIo').trim();
};

export const setApifyYouTubeActorId = (actorId: string): void => {
  if (typeof window !== 'undefined') {
    if (actorId) {
      localStorage.setItem(YOUTUBE_ACTOR_KEY, actorId.trim());
    } else {
      localStorage.removeItem(YOUTUBE_ACTOR_KEY);
    }
  }
};

export const getApifyInstagramActorId = (): string => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(INSTAGRAM_ACTOR_KEY);
    if (local) return local.trim();
  }
  return 'apify/instagram-reel-scraper';
};

export const setApifyInstagramActorId = (actorId: string): void => {
  if (typeof window !== 'undefined') {
    if (actorId) {
      localStorage.setItem(INSTAGRAM_ACTOR_KEY, actorId.trim());
    } else {
      localStorage.removeItem(INSTAGRAM_ACTOR_KEY);
    }
  }
};

export interface ApifyTokenTestResult {
  success: boolean;
  username?: string;
  plan?: string;
  message: string;
  status?: number;
}

export const testApifyTokenConnection = async (tokenInput?: string): Promise<ApifyTokenTestResult> => {
  const token = (tokenInput !== undefined ? tokenInput : getApifyToken()).trim();
  if (!token) {
    return {
      success: false,
      message: 'Token is empty. Please enter your Apify API token.'
    };
  }

  try {
    const res = await fetch(`https://api.apify.com/v2/users/me?token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const data = await res.json();
      const userData = data.data || {};
      return {
        success: true,
        username: userData.username || userData.email || 'Apify User',
        plan: userData.plan?.name || userData.subscription?.plan || 'Active Plan',
        message: `Token Valid! Connected as @${userData.username || 'user'}`
      };
    } else {
      const errText = await res.text().catch(() => '');
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          status: res.status,
          message: `HTTP ${res.status} Forbidden: Invalid or expired Apify API Token. Verify key at console.apify.com`
        };
      }
      return {
        success: false,
        status: res.status,
        message: `Apify API Error (${res.status}): ${errText || res.statusText}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Connection Error: ${err.message || 'Failed to reach api.apify.com'}`
    };
  }
};

export const isApifyConfigured = (): boolean => {
  return !!getApifyToken();
};

const formatViews = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const fetchTikTokTrendsViaApify = async (filters: ScannerFilters): Promise<ViralVideo[]> => {
  const token = getApifyToken();
  if (!token) {
    throw new Error("Apify API Token not configured. Please set your Apify token in Settings.");
  }

  const actorId = getApifyActorId();
  const rawKeyword = filters.keywords ? filters.keywords.trim() : "";
  const countryCode = filters.countries[0] || 'US';
  const countryObj = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
  const countryName = countryObj ? countryObj.name : 'United States';
  const count = filters.resultCount || 8;

  // 1. Map Time Window filters to Apify parameters
  let timeFilterKey = "now";
  let maxDaysOld = 30;
  if (filters.timeRange === TimeRange.Today) {
    timeFilterKey = "24h";
    maxDaysOld = 2;
  } else if (filters.timeRange === TimeRange.Week) {
    timeFilterKey = "7d";
    maxDaysOld = 7;
  } else if (filters.timeRange === TimeRange.Month) {
    timeFilterKey = "30d";
    maxDaysOld = 30;
  } else if (filters.timeRange === TimeRange.Now) {
    timeFilterKey = "now";
    maxDaysOld = 3;
  }

  // 2. Build region and keyword search queries
  const baseKeyword = rawKeyword || "trending viral";
  const geoQuery = `${baseKeyword} ${countryName}`;
  const searchQueriesList = [geoQuery, baseKeyword];
  const hashtagClean = baseKeyword.replace(/\s+/g, '');

  // 3. Payload with full location, proxy, and time window parameters
  const inputPayload = {
    searchKeywords: searchQueriesList,
    searchQueries: searchQueriesList,
    keywords: searchQueriesList,
    hashtags: [hashtagClean],
    country: countryCode,
    countryCode: countryCode,
    location: countryName,
    region: countryCode,
    dateFilter: timeFilterKey,
    publishTime: timeFilterKey,
    publishTimeWindow: timeFilterKey.toUpperCase(),
    maxDaysOld: maxDaysOld,
    maxResults: count * 2,
    resultsPerPage: count * 2,
    maxItems: count * 2,
    searchSection: "",
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
    proxyConfig: {
      useApifyProxy: true,
      apifyProxyCountry: countryCode
    }
  };

  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=60`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(inputPayload)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Apify Actor Execution Failed (${response.status}): ${errorText || response.statusText}`);
  }

  const items = await response.json();
  if (!Array.isArray(items)) {
    return [];
  }

  const mappedVideos: ViralVideo[] = items.map((item: any, index: number) => {
    const viewsNum = Number(item.playCount || item.views || item.stats?.playCount || item.statistics?.playCount || 0);
    const likesNum = Number(item.diggCount || item.likes || item.stats?.diggCount || item.statistics?.diggCount || 0);
    const commentsNum = Number(item.commentCount || item.comments || item.stats?.commentCount || 0);
    const sharesNum = Number(item.shareCount || item.shares || item.stats?.shareCount || 0);

    const videoUrl = item.webVideoUrl || item.videoUrl || item.url || item.link || `https://www.tiktok.com/@${item.authorMeta?.name || 'user'}/video/${item.id || index}`;
    const authorHandle = item.authorMeta?.name || item.authorMeta?.nickName || item.author?.uniqueId || item.username || 'tiktok_creator';
    const titleText = item.text || item.title || item.desc || `Viral TikTok (${countryName}): ${baseKeyword}`;
    const thumb = item.covers?.origin || item.covers?.default || item.cover || item.thumbnailUrl || item.thumbnail || `https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=500&auto=format&fit=crop`;

    const engRatio = viewsNum > 0 ? (likesNum + commentsNum * 2 + sharesNum * 3) / viewsNum : 0.08;
    const engPercentage = (engRatio * 100).toFixed(1);

    const baseScore = Math.log10(Math.max(viewsNum, 100)) * 8.5;
    const engBonus = Math.min(30, engRatio * 200);

    const computedScore = Math.min(98, Math.max(38, Math.round(baseScore + engBonus)));
    const durationSecs = Number(item.videoMeta?.duration || item.duration || 25);
    const mins = Math.floor(durationSecs / 60);
    const secs = Math.floor(durationSecs % 60);

    return {
      id: `apify_${item.id || item.itemId || index}_${Date.now()}`,
      title: titleText,
      description: titleText,
      originalUrl: videoUrl,
      thumbnailUrl: thumb,
      platform: Platform.TikTok,
      viralScore: computedScore,
      views: formatViews(viewsNum),
      country: countryCode,
      originalPostDate: item.createTimeISO ? item.createTimeISO.split('T')[0] : new Date().toISOString().split('T')[0],
      status: VideoStatus.Scanned,
      createdAt: Date.now(),
      searchSources: [
        {
          title: `Apify Scraper (${actorId} - ${countryCode} / ${filters.timeRange})`,
          uri: videoUrl
        }
      ],
      researchInsights: {
        hookType: `Apify Verified (${engPercentage}% Engaged)`,
        audienceSegment: `${countryName} Social Graph`,
        commercialIntent: "High",
        viralVelocity: filters.timeRange === TimeRange.Today ? "Explosive (24h)" : "High Velocity",
        creatorHandle: authorHandle,
        likeCount: formatViews(likesNum),
        commentCount: formatViews(commentsNum),
        shareCount: formatViews(sharesNum),
        duration: durationSecs,
        durationFormatted: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
        engagementRate: `${engPercentage}%`,
        summary: titleText
      }
    };
  });

  return mappedVideos.slice(0, count);
};
