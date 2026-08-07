import { Platform, ScannerFilters, ViralVideo } from '../../types';

export interface ScraperResult {
  platform: Platform;
  videos: ViralVideo[];
  logs: string[];
}

export interface SocialScraper {
  platform: Platform;
  scrape: (filters: ScannerFilters) => Promise<ScraperResult>;
  isConfigured: () => boolean;
}
