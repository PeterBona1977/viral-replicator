import { ScannerFilters, ViralVideo } from '../types';
import { tiktokScraper } from './scrapers/tiktokScraper';

export const isTikTokScraperConfigured = (): boolean => {
  return tiktokScraper.isConfigured();
};

export const fetchTikTokViralTrends = async (filters: ScannerFilters): Promise<ViralVideo[]> => {
  const result = await tiktokScraper.scrape(filters);
  return result.videos;
};
