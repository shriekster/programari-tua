import { create } from 'zustand';
import { useLocation } from 'wouter';

const useGlobalStore = create((set, get) => ({

  isAdmin: false,
  setAdmin: (isAdmin) => set(({ isAdmin })),
  refreshToken: async () => {

    // try to refresh the access token

  },

}));

export default useGlobalStore;