
import { Platform, VideoStatus, ViralVideo, FirebaseConfig } from './types';

// --- CONFIGURATION ---
// PASTE YOUR SUPABASE KEY BELOW TO CONNECT BY DEFAULT
export const SUPABASE_URL = "https://khxqykyascnhybgucgxr.supabase.co"; 
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeHF5a3lhc2NuaHliZ3VjZ3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDIwNDYsImV4cCI6MjA4MjA3ODA0Nn0.1ugO4r62szPQVHcb7-_zqvvJpDBakT08Q39WQ-5zlSM"; 

export const APIFY_API_TOKEN = "apify_api_Qzyi0vxrFzO0u59hBkRv0SeL8PTgn91zkiEI"; 
export const APIFY_TIKTOK_ACTOR_ID = "coregent/tiktok-viral-video-finder"; 

export const MOCK_VIRAL_VIDEOS: ViralVideo[] = [];

export const POOL_VIRAL_VIDEOS: ViralVideo[] = [];

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyABVkc5Crtj9lOSUnoGxyKGraIdqw6_zmQ",
  authDomain: "hunter-d4212.firebaseapp.com",
  projectId: "hunter-d4212",
  storageBucket: "hunter-d4212.firebasestorage.app",
  messagingSenderId: "790031060020",
  appId: "1:790031060020:web:929d8382140633c4984e61",
  measurementId: "G-RR9Y7HZKB0"
};
