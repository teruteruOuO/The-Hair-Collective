import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAdminStore = create(
    persist(
        (set) => ({
            admin: { logged_in: false, },

            // generic setter that mimics React's setState callback style
            setAdmin: (updater) =>
                set((s) => {
                    const nextAdmin = typeof updater === 'function' ? updater(s.admin) : updater;
                    return { admin: nextAdmin };
                }),

            _hasHydrated: false,
            setHasHydrated: (v) => set({ _hasHydrated: v }),    
        }),
        
        {
            name: 'admin', 
            storage: createJSONStorage(() => localStorage), 

            partialize: (state) => ({ admin: state.admin }),  
            version: 1,

            onRehydrateStorage: () => (state) => {  
                state?.setHasHydrated(true);
            },
        }
    )
);