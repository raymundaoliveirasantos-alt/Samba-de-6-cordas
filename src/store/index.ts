import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences, Workspace } from '../types';

interface AppState {
  currentWorkspaceId: string;
  userPlan: 'free' | 'pro_stage';
  preferences: UserPreferences;
  isStageMode: boolean;
  isOnline: boolean;
  activeMetronome: {
    isPlaying: boolean;
    bpm: number;
    timeSignature: string;
    subdivision: number;
  };
  activeWorshipPadKey: string | null;

  // Actions
  setWorkspaceId: (id: string) => void;
  setUserPlan: (plan: 'free' | 'pro_stage') => void;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  setStageMode: (enabled: boolean) => void;
  setIsOnline: (online: boolean) => void;
  setMetronome: (partial: Partial<AppState['activeMetronome']>) => void;
  setActiveWorshipPadKey: (key: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentWorkspaceId: 'ws-ss-clarinetes',
      userPlan: 'pro_stage',
      isStageMode: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      preferences: {
        fontSize: 'md',
        lineHeight: 'normal',
        theme: 'stage',
        showChords: true,
        showDiagrams: true,
        instrument: 'violao',
        useNashvilleNumbers: false,
        autoScrollSpeed: 3,
      },
      activeMetronome: {
        isPlaying: false,
        bpm: 100,
        timeSignature: '4/4',
        subdivision: 1,
      },
      activeWorshipPadKey: null,

      setWorkspaceId: (id) => set({ currentWorkspaceId: id }),
      setUserPlan: (plan) => set({ userPlan: plan }),
      updatePreferences: (partial) =>
        set((state) => ({
          preferences: { ...state.preferences, ...partial },
        })),
      setStageMode: (enabled) => set({ isStageMode: enabled }),
      setIsOnline: (online) => set({ isOnline: online }),
      setMetronome: (partial) =>
        set((state) => ({
          activeMetronome: { ...state.activeMetronome, ...partial },
        })),
      setActiveWorshipPadKey: (key) => set({ activeWorshipPadKey: key }),
    }),
    {
      name: 'cifraviva_settings',
      partialize: (state) => ({
        preferences: state.preferences,
        userPlan: state.userPlan,
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    }
  )
);
