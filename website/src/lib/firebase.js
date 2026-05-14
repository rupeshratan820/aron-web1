import { initializeApp } from "firebase/app";
import { getAuth, OAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { getDatabase, ref, get, set, update, runTransaction, query, orderByKey, limitToFirst } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId);
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const database = app ? getDatabase(app) : null;
export const dbRoot = String(import.meta.env.VITE_FIREBASE_DB_ROOT || "botData").replace(/^\/+|\/+$/g, "") || "botData";

export function dbPath(path = "") {
  const childPath = String(path || "").replace(/^\/+|\/+$/g, "");
  return childPath ? `${dbRoot}/${childPath}` : dbRoot;
}

export function dbRef(path = "") {
  if (!database) throw new Error("Firebase is not configured.");
  return ref(database, dbPath(path));
}

export async function readValue(path, fallback = null) {
  if (!database) return fallback;
  const snapshot = await get(dbRef(path));
  return snapshot.exists() ? snapshot.val() : fallback;
}

export async function writeValue(path, value) {
  if (!database) throw new Error("Firebase is not configured.");
  await set(dbRef(path), value);
}

export async function updateValue(path, value) {
  if (!database) throw new Error("Firebase is not configured.");
  await update(dbRef(path), value);
}

export async function readFirst(path, amount = 24) {
  if (!database) return {};
  const snapshot = await get(query(dbRef(path), orderByKey(), limitToFirst(amount)));
  return snapshot.exists() ? snapshot.val() : {};
}

export function getDiscordProvider() {
  const provider = new OAuthProvider(import.meta.env.VITE_DISCORD_PROVIDER_ID || "oidc.discord");
  provider.addScope("identify");
  return provider;
}

export async function loginWithDiscord() {
  if (!auth) throw new Error("Firebase Auth is not configured.");
  const provider = getDiscordProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (error?.code === "auth/popup-blocked" || error?.code === "auth/popup-closed-by-user") {
      return signInWithRedirect(auth, provider);
    }
    throw error;
  }
}

export async function finishRedirectLogin() {
  if (!auth) return null;
  return getRedirectResult(auth).catch(() => null);
}

export function logout() {
  return auth ? signOut(auth) : Promise.resolve();
}

export function transaction(path, mutator) {
  if (!database) throw new Error("Firebase is not configured.");
  return runTransaction(dbRef(path), mutator);
}
