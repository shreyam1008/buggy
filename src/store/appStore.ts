import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sidebarOpen: boolean;
  currentGreeting: string;
  lastGreetingDate: string;
  theme: 'dark' | 'light';
  installBannerDismissed: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentGreeting: (greeting: string) => void;
  dismissInstallBanner: () => void;
}

const greetings = [
  "Radhey Radhey 🙏",
  "Jai Shree Krishna 🦚",
  "Jai Shree Radhe 🌸",
  "Hare Krishna 🪷",
  "Jai Shree Kripalu 🌺",
  "Radhe Govind 💫",
  "Krishna Krishna 🎵",
  "Radhe Shyam ✨",
];

const getDailyGreeting = (): string => {
  const dayIndex = new Date().getDate() % greetings.length;
  return greetings[dayIndex];
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      currentGreeting: getDailyGreeting(),
      lastGreetingDate: new Date().toDateString(),
      theme: 'dark',
      installBannerDismissed: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setCurrentGreeting: (greeting) => set({ currentGreeting: greeting }),
      
      dismissInstallBanner: () => set({ installBannerDismissed: true }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        installBannerDismissed: state.installBannerDismissed,
        lastGreetingDate: state.lastGreetingDate,
        currentGreeting: state.currentGreeting,
      }),
    }
  )
);

// Update greeting daily
export const updateDailyGreeting = () => {
  const store = useAppStore.getState();
  const today = new Date().toDateString();
  
  if (store.lastGreetingDate !== today) {
    const newGreeting = getDailyGreeting();
    useAppStore.setState({
      currentGreeting: newGreeting,
      lastGreetingDate: today,
    });
  }
};
