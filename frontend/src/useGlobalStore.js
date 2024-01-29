import { create } from 'zustand'

export const useGlobalStore = create((set, get) => ({

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
  dates: new Map(),
  setDates: (newDates) => set({ dates: newDates }),
  addDate: (date) => {

    const updatedDates = new Map(get().dates);
    updatedDates.set(date.day, date);

    set({ dates: updatedDates});

  },
  updateDate: (date) => {

    const updatedDates = new Map(get().dates);
    
    updatedDates.set(date.day, date);

    set({ dates: updatedDates});

  },
  deleteDate: (day) => {

    const updatedDates = new Map(get().dates);
    updatedDates.delete(day);

    set({ dates: updatedDates});

  },
  timeRanges: [],
  setTimeRanges: (newTimeRanges) => set({ timeRanges: newTimeRanges }),
  addTimeRange: (newTimeRange) => set((state) => ({ timeRanges: [...state.timeRanges, newTimeRange]})),
  updateTimeRange: (updatedTimeRange) => {

    const updatedTimeRanges = [...get().timeRanges];
    
    const updatedIndex = updatedTimeRanges.findIndex((timeRange) => timeRange.id == updatedTimeRange.id);
    
    if (-1 !== updatedIndex) {

      updatedTimeRanges.splice(updatedIndex, 1, updatedTimeRange);

    }

    set({ timeRanges: updatedTimeRanges});

  },
  deleteTimeRange: (timeRange) => {

    const updatedTimeRanges = [...get().timeRanges];
    
    const updatedIndex = updatedTimeRanges.findIndex((t) => t.id == timeRange.id);
    
    if (-1 !== updatedIndex) {

      updatedTimeRanges.splice(updatedIndex, 1);

    }

    set({ timeRanges: updatedTimeRanges});

  },
  appointments: [],
  setAppointments: (newAppointments) => set({ appointments: newAppointments }),
  personnelCategories: [],
  setPersonnelCategories: (newPersonnelCategories) => set({ personnelCategories: newPersonnelCategories }),

  // SSE related state
  subscriptionId: '',
  setSubscriptionId: (newSubscriptionId) => set({ subscriptionId: newSubscriptionId }),

  // user theme state
  userTheme: localStorage.getItem('userTheme') ?? 'dark',
  toggleUserTheme: () => {
    
    const currentTheme = get().userTheme;

    const newTheme = 'dark' === currentTheme ? 'light' : 'dark';

    localStorage.setItem('userTheme', newTheme);

    set({ userTheme: newTheme });
    
  },

}));