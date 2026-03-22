import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Family, QuillDashboard } from "../definitions";

export interface QuillDashboardListStore extends QuillDashboard {
  setApiUrl: (url: string) => void;
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family?: Family) => void;
  fetchData: (queryString: string, familyId?: string) => Promise<void>;
  setCurrentData: (data: any[]) => void;
  familyTabIds: string[];
  addFamilyTab: (id: string) => void;
  removeFamilyTab: (id: string) => void;
  clearFamilyTabs: () => void;
}

export const useQuillDashboardStore = create<QuillDashboardListStore>()(
  persist(
    (set, get) => ({
      apiUrl: "http://localhost:5050/tiny/api",
      families: [],
      setApiUrl: (url: string) => set({ apiUrl: url }),
      setFamilies: (families) => set({ families }),
      setCurrentFamily: (family) => set({ currentFamily: family }),
      familyTabIds: [],
      addFamilyTab: (id) =>
        set((state) => ({
          familyTabIds: state.familyTabIds.includes(id)
            ? state.familyTabIds
            : [...state.familyTabIds, id],
        })),
      removeFamilyTab: (id) =>
        set((state) => ({
          familyTabIds: state.familyTabIds.filter((t) => t !== id),
        })),
      clearFamilyTabs: () => set({ familyTabIds: [] }),
      fetchData: async (queryString: string, familyId?: string) => {
        const res = await fetch(
          `${get().apiUrl}/data/${
            familyId || get().currentFamily?.id
          }?${queryString}`
        );
        const data = await res.json();
        set({ currentData: data });
      },
      setCurrentData: (data) => set({ currentData: data }),
    }),
    {
      name: "quill-dashboard",
      partialize: (state) => ({ familyTabIds: state.familyTabIds }),
    }
  )
);
