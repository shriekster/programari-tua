import { create } from 'zustand'

export const useGlobalStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  loading: false,
  setLoading: (newLoadingState) => set({ loading: newLoadingState }),
}));