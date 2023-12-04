import { create } from 'zustand';

const useGlobalStore = create((set, get) => ({

    isHuman: false,
    setHuman: (value) => set({ isHuman: Boolean(value) }),
    verifying: true,
    setVerifying: (value) => set({ verifying: Boolean(value) }),

}));

export default useGlobalStore;