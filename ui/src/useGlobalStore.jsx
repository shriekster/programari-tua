import { create } from 'zustand';

const useGlobalStore = create((set, get) => ({

    isHuman: false,
    setHumanity: (value) => set({ isHuman: Boolean(value) }),
    verifying: true,
    setVerifying: (value) => set({ verifying: Boolean(value) }),

}));

export default useGlobalStore;