import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Family, QuillDashboard } from "../definitions";

export interface QuillDashboardListStore extends QuillDashboard {
  setApiUrl: (url: string) => void;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family) => void;
  fetchData: (queryString: string) => Promise<void>;
  setCurrentData: (data: any[]) => void;
}

export const useQuillDashboardStore = create<QuillDashboardListStore>()(
  persist(
    (set, get) => ({
      apiUrl: "http://localhost:5050/tiny/api",
      families: [],
      setApiUrl: (url: string) => set({ apiUrl: url }),
      setFamilies: (families) => set({ families }),
      setCurrentFamily: (family) => set({ currentFamily: family }),
      fetchData: async (queryString: string) => {
        const res = await fetch(
          `${get().apiUrl}/data/${get().currentFamily?.id}?${queryString}`
        );
        const data = await res.json();
        set({ currentData: data });
      },
      setCurrentData: (data) => set({ currentData: data }),
    }),
    {
      name: "quill-dashboard-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
