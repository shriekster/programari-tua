import { create } from 'zustand';

const useGlobalStore = create((set, get) => ({

  isAdmin: false,
  setAdmin: (isAdmin) => set(({ isAdmin })),

}));

export default useGlobalStore;