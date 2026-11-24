'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getRemoteConfig } from 'firebase/remote-config';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAI, GoogleAIBackend } from 'firebase/ai';

// Provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDihaDLm5eDv7KKNedLNbKe2i-eWFr14MY",
  authDomain: "studio-9343992032-15548.firebaseapp.com",
  projectId: "studio-9343992032-15548",
  storageBucket: "studio-9343992032-15548.firebasestorage.app",
  messagingSenderId: "12992098294",
  appId: "1:12992098294:web:57ec36379e0a320c5861d7"
};

// Initialize variables as null to prevent crashes when config is missing or invalid
let app: any = null;
let auth: any = null;
let db: any = null;
let remoteConfig: any = null;
let ai: any = null;

// Only initialize Firebase if we have a valid configuration
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_key") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });

  if (typeof window !== 'undefined') {
    remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
    remoteConfig.defaultConfig = {
      cloud_reasoning_model: "gemini-3.8-flash",
      cloud_fallback_model: "gemini-3.5-flash-lite",
      max_on_device_chars: 12000
    };

    // App Check setup - ReCaptcha Enterprise (using a fallback if site key missing)
    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY || "6Lc-b5cqAAAAAK45Vz3S9PTBYIRCoc_j8lgKZo2Qk";
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
    } catch (e) {
      console.warn("App Check initialization skipped or failed:", e);
    }
  }

  // Initialize Firebase AI with App Check protection enabled
  ai = getAI(app, { 
    backend: new GoogleAIBackend(), 
    useLimitedUseAppCheckTokens: true 
  });
}

export { app, auth, db, remoteConfig, ai };
