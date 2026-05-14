import { onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";
import { auth, finishRedirectLogin, loginWithDiscord, logout } from "../lib/firebase.js";
import { getDiscordIdentity } from "../lib/format.js";
import { syncWebUser } from "../lib/data.js";
import { useEffect } from "react";

export const useAuthStore = create((set, get) => ({
  firebaseUser: null,
  identity: null,
  loading: true,
  error: "",
  login: async () => {
    set({ error: "" });
    const result = await loginWithDiscord();
    if (result?.user) await syncWebUser(result.user);
  },
  logout: async () => {
    await logout();
    set({ firebaseUser: null, identity: null });
  },
  setUser: async (firebaseUser) => {
    const identity = firebaseUser ? getDiscordIdentity(firebaseUser) : null;
    set({ firebaseUser, identity, loading: false });
    if (firebaseUser && identity?.discordId) {
      await syncWebUser(firebaseUser).catch((error) => set({ error: error.message }));
    }
  },
  getDiscordId: () => get().identity?.discordId || ""
}));

let bootstrapped = false;

export function useAuthBootstrap() {
  const setUser = useAuthStore((state) => state.setUser);
  useEffect(() => {
    if (bootstrapped || !auth) return undefined;
    bootstrapped = true;
    finishRedirectLogin();
    return onAuthStateChanged(auth, (user) => setUser(user));
  }, [setUser]);
}
