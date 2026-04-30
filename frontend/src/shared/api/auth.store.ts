import { create } from "zustand";

export interface IAuthStore {
  accessToken: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const authToken = create<IAuthStore>((set) => ({
  accessToken: null,

  setToken: (token) => set({ accessToken: token }),

  clearToken: () => set({ accessToken: null }),
}));
