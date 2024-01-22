import { create } from 'zustand'

export const useGlobalStore = create((set, get) => ({

  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  // the first 2 state properties/methods are just examples
  // UI state: loading, error (for the snackbar)
  loading: false,
  setLoading: (newLoadingState) => set({ loading: newLoadingState }),
  showError: false,
  setError: (newShowErrorState) => set({ showError: newShowErrorState }),
  errorMessage: '',
  setErrorMessage: (newErrorMessage) => set({ errorMessage: newErrorMessage }),

  // locations state
  locationsDownloaded: false,
  setLocationsDownloaded: (newLocationsDownloadedState) => set({ locationsDownloaded: newLocationsDownloadedState }),
  locations: [],
  setLocations: (newLocations) => set({ locations: newLocations }),
  addLocation: (newLocation) => set((state) => ({ locations: [...state.locations, newLocation] })),
  deleteLocation: (locationId) => {

    const locations = get().locations;

    const removeFromIndex = locations.findIndex((location) => locationId == location.id);

    if (-1 !== removeFromIndex) {

      const updatedLocations = [...locations];
      updatedLocations.splice(removeFromIndex, 1);
      set({ locations: updatedLocations });

    }

  },

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
  dates: [],
  setDates: (newDates) => set({ dates: newDates }),
  timeRanges: [],
  setTimeRanges: (newTimeRanges) => set({ timeRanges: newTimeRanges }),
  appointments: [],
  setAppointments: (newAppointments) => set({ appointments: newAppointments }),
  personnelCategories: [],
  setPersonnelCategories: (newPersonnelCategories) => set({ personnelCategories: newPersonnelCategories }),

  // SSE related state
  subscriptionId: '',
  setSubscriptionId: (newSubscriptionId) => set({ subscriptionId: newSubscriptionId }),

}));