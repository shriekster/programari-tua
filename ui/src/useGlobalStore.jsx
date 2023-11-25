import { create } from 'zustand';

const useGlobalStore = create((set, get) => ({

    isHuman: false,
    setHumanity: (updatedHumanity) => set({ isHuman: Boolean(updatedHumanity) })

}));

export default useGlobalStore;