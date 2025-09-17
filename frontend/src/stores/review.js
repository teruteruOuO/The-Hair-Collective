import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useReviewStore = create(
    persist(
        (set) => ({
            review: { email: '', },

            // generic setter that mimics React's setState callback style
            setReview: (updater) =>
                set((s) => {
                    const nextReview = typeof updater === 'function' ? updater(s.review) : updater;
                    return { review: nextReview };
                }),

            _hasHydrated: false,
            setHasHydrated: (v) => set({ _hasHydrated: v }),    
        }),
        
        {
            name: 'review', 
            storage: createJSONStorage(() => localStorage), 

            partialize: (state) => ({ review: state.review }),  
            version: 1,

            onRehydrateStorage: () => (state) => {  
                state?.setHasHydrated(true);
            },
        }
    )
);