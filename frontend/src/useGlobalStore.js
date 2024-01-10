import { create } from 'zustand'

export const useGlobalStore = create((set) => ({

  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  // the first 2 state properties/methods are just examples
  loading: false,
  setLoading: (newLoadingState) => set({ loading: newLoadingState }),

  // profile state
  profileDownloaded: false,
  setProfileDownloaded: (newProfileDownloadedState) => set({ profileDownloaded: newProfileDownloadedState }),
  profileUrl: '',
  setProfileUrl: (newProfileUrl) => set({ profileUrl: newProfileUrl }),
  fullName: '',
  setFullName: (newFullName) => set({ fullName: newFullName}),
  phoneNumber: '',
  setPhoneNumber: (newPhoneNumber) => set({ phoneNumber: newPhoneNumber }),

  // calendar, location and appointments state
  registryDownloaded: false,
  setRegistryDownloaded: (newRegistryDownloadedState) => set({ registryDownloaded: newRegistryDownloadedState }),
  locations: null,
  setLocations: (newLocations) => set({ locations: newLocations }),
  dates: null,
  setDates: (newDates) => set({ dates: newDates }),
  timeRanges: null,
  setTimeRanges: (newTimeRanges) => set({ timeRanges: newTimeRanges }),
  appointments: null,
  setAppointments: (newAppointments) => set({ appointments: newAppointments }),
  personnelCategories: null,
  setPersonnelCategories: (newPersonnelCategories) => set({ personnelCategories: newPersonnelCategories }),

}));