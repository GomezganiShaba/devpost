'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getRemoteConfig } from 'firebase/remote-config';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAI, GoogleAIBackend } from 'firebase/ai';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize variables as null/any to prevent module import crashes when config is missing
let app: any = null;
let auth: any = null;
let db: any = null;
let remoteConfig: any = null;
let ai: any = null;

// Only initialize Firebase if we have an API key. 
// This allows the "Graceful Sandbox Guard" in page.tsx to render a setup UI instead of the app crashing on load.
if (firebaseConfig.apiKey) {
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

    // App Check setup
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN) {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;
    }
    
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY || "dev-placeholder"),
        isTokenAutoRefreshEnabled: true
      });
    } catch (e) {
      console.warn("App Check initialization skipped or failed:", e);
    }
  }

  ai = getAI(app, { 
    backend: new GoogleAIBackend(), 
    useLimitedUseAppCheckTokens: true 
  });
}

export { app, auth, db, remoteConfig, ai };
