import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserExperience, ExperienceData } from '@services/experience';
import { useAuthStore } from './authStore';

interface ExperienceState {
  experience_points: number;
  level: number;
  xp_to_next_level: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchExperience: () => Promise<void>;
  setExperience: (experienceData: ExperienceData) => void;
  clearError: () => void;
  syncWithBackend: () => Promise<void>;
  updateExperience: (points: number) => void;
}

export const useExperienceStore = create<ExperienceState>()(
  persist(
    (set, get) => ({
      experience_points: 0,
      level: 1,
      xp_to_next_level: 100,
      isLoading: false,
      error: null,

      fetchExperience: async () => {
        const authToken = useAuthStore.getState().authToken;
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getUserExperience(authToken);
          if (response.success) {
            set({
              experience_points: response.data.experience_points,
              level: response.data.level,
              xp_to_next_level: response.data.xp_to_next_level,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: 'Failed to fetch experience data',
            });
          }
        } catch (error) {
          console.error('Error fetching experience:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch experience',
          });
        }
      },

      setExperience: (experienceData: ExperienceData) => {
        set({
          experience_points: experienceData.experience_points,
          level: experienceData.level,
          xp_to_next_level: experienceData.xp_to_next_level,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      syncWithBackend: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const authToken = useAuthStore.getState().authToken;
          
          if (!authToken) {
            set({ 
              error: 'No authentication token available',
              isLoading: false 
            });
            return;
          }
          
          const response = await getUserExperience(authToken);

          if (response.success) {
            set({
              experience_points: response.data.experience_points,
              level: response.data.level,
              xp_to_next_level: response.data.xp_to_next_level,
              isLoading: false,
              error: null,
            });
          } else {
            set({ 
              error: 'Failed to sync experience',
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to sync experience',
            isLoading: false 
          });
        }
      },

      updateExperience: (points: number) => {
        const currentExp = get().experience_points;
        const newExp = currentExp + points;
        
        // Level calculation: 0-90 = Level 1, 100+ = Level 2+
        let newLevel: number;
        let xpToNext: number;
        
        if (newExp <= 90) {
          newLevel = 1;
          xpToNext = 100 - newExp;
        } else {
          newLevel = Math.floor((newExp - 90) / 100) + 2;
          xpToNext = 100 - ((newExp - 90) % 100);
        }
        
        set({
          experience_points: newExp,
          level: newLevel,
          xp_to_next_level: xpToNext
        });
        
        // Auto-sync with backend after updating experience
        setTimeout(() => {
          get().syncWithBackend();
        }, 500);
      },
    }),
    {
      name: 'experience-storage',
      partialize: (state) => ({
        experience_points: state.experience_points,
        level: state.level,
        xp_to_next_level: state.xp_to_next_level,
      }),
    }
  )
);
