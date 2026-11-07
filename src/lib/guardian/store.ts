import { create } from "zustand";
import type { Me } from "./types";

type State = {
  me: Me | null;
  forUser: string | null;
  setMe: (userId: string, me: Me) => void;
};

export const useGuardian = create<State>((set) => ({
  me: null,
  forUser: null,
  setMe: (userId, me) => set({ forUser: userId, me }),
}));
