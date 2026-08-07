
export enum Platform {
  TikTok = 'TikTok',
  Instagram = 'Instagram',
  YouTube = 'YouTube',
  Facebook = 'Facebook',
  Snapchat = 'Snapchat'
}

export enum VideoStatus {
  Scanned = 'Scanned',
  Generating = 'Generating',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Posted = 'Posted',
  Rejected = 'Rejected'
}

export enum GenerationStep {
  None = 'None',
  Analyzing = 'Analyzing Trend...',
  Scripting = 'Cinematographer Composing...',
  Rendering = 'Veo Studio Rendering...'
}

export enum TimeRange {
  Now = 'Now (Trending)',
  Today = 'Today (24h)',
  Week = 'This Week',
  Month = 'This Month'
}

// Generic Discovery Type
export interface DiscoveredVideo {
  id: string;
  platform: string;
  title: string;
  description: string;
  username: string;
  published_date?: string;
  view_count?: number;
  like_count?: number;
  url?: string;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface SearchAudit {
  operationLog: string[];
  strategicSummary: string;
  replicationPlaybook: {
    hookAdvice: string;
    audioStrategy: string;
    visualDirection: string;
  };
  regionInsight: string;
  queryFormulation?: string;
}

export interface SearchResult {
  videos: ViralVideo[];
  audit: SearchAudit;
}

export interface ResearchInsights {
  hookType: string;
  audienceSegment: string;
  commercialIntent: 'High' | 'Medium' | 'Low';
  viralVelocity: string;
  retentionRate?: string; 
  engagementVelocity?: string;
  shareRatio?: string;
  musicId?: string;
  shareCount?: string;
  commentCount?: string;
  likeCount?: string;
  isStemVerified?: boolean;
  regionCode?: string;
  hashtags?: string[];
  creatorHandle?: string;
  duration?: number;
  effectIds?: string[];
}

export interface PublishingMetadata {
  caption: string;
  hashtags: string[];
  platforms: Platform[];
  postedAt?: number;
}

export interface ViralVideo {
  id: string;
  title: string;
  description: string;
  originalUrl: string;
  thumbnailUrl: string;
  platform: Platform;
  viralScore: number;
  views: string;
  country: string;
  postedTimeAgo?: string;
  originalPostDate?: string;
  status: VideoStatus;
  generationStep?: GenerationStep;
  generatedVideoUrl?: string;
  generationPrompt?: string;
  createdAt: number;
  searchSources?: SearchSource[];
  researchInsights?: ResearchInsights;
  publishingMetadata?: PublishingMetadata;
}

export interface SocialAccount {
  platform: Platform;
  username: string;
  connected: boolean;
}

export interface SupabaseConfig {
  url: string;
  key: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface ScannerFilters {
  countries: string[];
  platforms: Platform[];
  resultCount: number;
  timeRange: TimeRange;
  keywords: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: ScannerFilters;
  createdAt: number;
}

export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'PT', name: 'Portugal' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'KR', name: 'South Korea' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'ES', name: 'Spain' }
];
