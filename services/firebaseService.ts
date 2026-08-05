import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app';
// Fix firestore imports by separating value imports from type imports to resolve resolution issues
import { getFirestore, collection, doc, setDoc, onSnapshot, query, orderBy, getDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged, Auth, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { FirebaseConfig, ViralVideo, SocialAccount } from '../types';

let db: Firestore | null = null;
let auth: Auth | null = null;
let app: FirebaseApp | null = null;

interface InitResult {
    success: boolean;
    error?: string;
    isWarning?: boolean;
}

// Initialize Firebase with the provided config
export const initFirebase = (config: FirebaseConfig): InitResult => {
  try {
    if (getApps().length > 0) {
        app = getApps().find(a => a.name === '[DEFAULT]') || getApps()[0];
    } else {
        app = initializeApp(config);
    }

    if (app) {
        db = getFirestore(app);
        auth = getAuth(app);
        
        // Attempt to set persistence immediately
        setPersistence(auth, browserLocalPersistence).catch(err => 
            console.warn("Auth persistence warning:", err.code)
        );
        return { success: true };
    }
    return { success: false, error: "App creation failed" };
  } catch (e: any) {
    console.error("Firebase Init Error:", e.message);
    return { success: false, error: e.message || "Unknown initialization error" };
  }
};

export const validateConfig = async (config: FirebaseConfig): Promise<InitResult> => {
    let tempApp: FirebaseApp | undefined;
    try {
        const tempAppName = `validator_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        tempApp = initializeApp(config, tempAppName);
        const testDb = getFirestore(tempApp);
        const testAuth = getAuth(tempApp);
        if (!testDb || !testAuth) throw new Error("Services failed to initialize");
        return { success: true };
    } catch (validationError: any) {
        return { success: false, error: validationError.message || "Validation failed." };
    } finally {
        if (tempApp) {
            try { await deleteApp(tempApp); } catch (e) {}
        }
    }
};

export const isFirebaseInitialized = () => !!db && !!auth;

// --- AUTHENTICATION ---

export const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    try {
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: name });
        return userCredential.user;
    } catch (error: any) {
        console.error("Registration Failed:", error.code);
        throw new Error(mapAuthError(error.code));
    }
};

export const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    try {
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        return userCredential.user;
    } catch (error: any) {
        console.error("Login Failed:", error.code);
        throw new Error(mapAuthError(error.code));
    }
};

const mapAuthError = (code: string) => {
    switch (code) {
        case 'auth/email-already-in-use': return "Email is already registered.";
        case 'auth/invalid-email': return "Invalid email address.";
        case 'auth/weak-password': return "Password should be at least 6 characters.";
        case 'auth/user-not-found': return "No account found with this email.";
        case 'auth/wrong-password': return "Incorrect password.";
        case 'auth/too-many-requests': return "Too many attempts. Try again later.";
        default: return "Authentication failed. Check your credentials.";
    }
};

export const logoutUser = async () => {
  if (!auth) return;
  try { await signOut(auth); } catch (error) {}
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// --- DATABASE (User Scoped) ---

export const subscribeToVideos = (userId: string, onUpdate: (videos: ViralVideo[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, "users", userId, "videos"), orderBy("createdAt", "desc"));
  return onSnapshot(q, 
    (snapshot) => {
        onUpdate(snapshot.docs.map(d => d.data() as ViralVideo));
    },
    (error) => {
        if (error.code === 'permission-denied') {
            console.warn("Sync Paused: Insufficient permissions for video stream.");
        } else {
            console.error("Video Sync Error:", error.code);
        }
    }
  );
};

export const saveVideoToDb = async (userId: string, video: ViralVideo) => {
  if (!db) return;
  try {
      const safeVideo = JSON.parse(JSON.stringify(video)); 
      await setDoc(doc(db, "users", userId, "videos", video.id), safeVideo, { merge: true });
  } catch (error: any) {
      if (error.code === 'permission-denied') {
          console.warn("Save Failed: Cloud storage permission denied.");
      } else {
          console.error("Save Video Error:", error.message);
      }
  }
};

export const saveBatchVideosToDb = async (userId: string, videos: ViralVideo[]) => {
    if (!db) return;
    try {
        await Promise.all(videos.map(v => saveVideoToDb(userId, v)));
    } catch (e: any) {
        console.warn("Batch save incomplete:", e.message);
    }
};

// --- SETTINGS PERSISTENCE ---

export const saveUserSettings = async (userId: string, accounts: SocialAccount[]) => {
    if (!db) return;
    try {
        const safeAccounts = JSON.parse(JSON.stringify(accounts));
        await setDoc(doc(db, "users", userId, "settings", "profile"), { accounts: safeAccounts }, { merge: true });
    } catch (e: any) {
        if (e.code === 'permission-denied') return; 
        console.error("Failed to save user settings:", e.message);
    }
};

// Returns null if document doesn't exist to allow initial migration logic
export const subscribeToUserSettings = (userId: string, onUpdate: (accounts: SocialAccount[] | null) => void) => {
    if (!db) return () => {};
    return onSnapshot(doc(db, "users", userId, "settings", "profile"), 
        (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.accounts) {
                    onUpdate(data.accounts);
                    return;
                }
            }
            // Explicitly signal no data
            onUpdate(null);
        },
        (error) => {
            if (error.code !== 'permission-denied') {
                console.warn("Settings Sync Error:", error.code);
            }
        }
    );
};