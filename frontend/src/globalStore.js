import { create } from 'zustand';
import { useLocation } from 'wouter';

const useGlobalStore = create((set, get) => ({

  isAdmin: false,
  setAdmin: (isAdmin) => set(({ isAdmin })),
  refreshToken: async () => {

    // try to refresh the access token
    // and redirect to /admin/login programmatically, from the client, if the server responds with a redirect (303)

  },

}));

export default useGlobalStore;