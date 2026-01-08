import { create } from 'zustand';
import type { User, Persona } from './types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  myPersonas: Persona[];
  setUser: (user: User | null) => void;
  setMyPersonas: (personas: Persona[]) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  myPersonas: [],
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setMyPersonas: (personas) => set({ myPersonas: personas }),
  
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false, myPersonas: [] });
  },
}));
