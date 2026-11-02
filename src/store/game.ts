import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  initialProgress,
  migrateLegacyProgress,
  submitLesson,
  submitBoss,
  claimQuest,
  currentDaily,
  type Progression,
  type Outcome,
  type QuestId,
} from "../domain/progression";
export type Panel =
  "dashboard" | "quests" | "progress" | "settings" | "island" | null;
interface State extends Progression {
  language: "id" | "en";
  setLanguage: (language: "id" | "en") => void;
  mathPosition: string | null;
  setMathPosition: (id: string) => void;
  name: string;
  loggedIn: boolean;
  sound: boolean;
  reduced: boolean;
  panel: Panel;
  selected: string;
  camera: { x: number; y: number; zoom: number };
  migrationNotice: boolean;
  dismissMigration: () => void;
  login: (name: string) => void;
  logout: () => void;
  setPanel: (panel: Panel) => void;
  select: (id: string) => void;
  setCamera: (camera: State["camera"]) => void;
  toggleSound: () => void;
  toggleReduced: () => void;
  readLesson: (id: string) => void;
  finishQuiz: (id: string, answers: number[]) => Outcome;
  finishBoss: (answers: number[]) => Outcome;
  claim: (id: QuestId) => void;
  refreshDay: () => void;
}
export const useGame = create<State>()(
  persist(
    (set, get) => ({
      ...initialProgress(),
      language: "id",
      name: "Alex",
      loggedIn: false,
      sound: true,
      reduced: false,
      mathPosition: null,
      panel: null,
      selected: "math",
      camera: { x: 0, y: 0, zoom: 1 },
      migrationNotice: false,
      setLanguage: (language) => set({ language }),
      setMathPosition: (mathPosition) => set({ mathPosition }),
      login: (name) => set({ name: name.trim() || "Alex", loggedIn: true }),
      logout: () => set({ loggedIn: false, panel: null }),
      setPanel: (panel) => set({ panel }),
      select: (selected) => set({ selected, panel: "island" }),
      setCamera: (camera) => set({ camera }),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      toggleReduced: () => set((s) => ({ reduced: !s.reduced })),
      dismissMigration: () => set({ migrationNotice: false }),
      readLesson: (id) =>
        set((s) => ({ readLessons: [...new Set([...s.readLessons, id])] })),
      finishQuiz: (id, answers) => {
        const result = submitLesson(get(), id, answers);
        set(result.state);
        return result.outcome;
      },
      finishBoss: (answers) => {
        const result = submitBoss(get(), answers);
        set(result.state);
        return result.outcome;
      },
      claim: (id) => set(claimQuest(get(), id)),
      refreshDay: () => {
        const daily = currentDaily(get());
        if (daily !== get().daily) set({ daily });
      },
    }),
    {
      name: "qwizo-sprint1",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted) => {
        const old = persisted as Partial<State>;
        return {
          ...migrateLegacyProgress(old.completedLessons),
          language: old.language ?? "id",
          mathPosition: old.mathPosition ?? null,
          name: old.name ?? "Alex",
          loggedIn: old.loggedIn ?? false,
          sound: old.sound ?? true,
          reduced: old.reduced ?? false,
          migrationNotice: true,
        };
      },
      partialize: (s) => ({
        language: s.language,
        mathPosition: s.mathPosition,
        name: s.name,
        loggedIn: s.loggedIn,
        sound: s.sound,
        reduced: s.reduced,
        xp: s.xp,
        coins: s.coins,
        results: s.results,
        readLessons: s.readLessons,
        completedLessons: s.completedLessons,
        streak: s.streak,
        lastActivity: s.lastActivity,
        daily: s.daily,
        bossWon: s.bossWon,
        bossAttempts: s.bossAttempts,
        migrationNotice: s.migrationNotice,
      }),
    },
  ),
);
