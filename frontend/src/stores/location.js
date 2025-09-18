import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useLocationStore = create(
    persist(
        (set) => ({
            location: { 
                id: 0,
                name: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                phone: '',
                availabilities: [],
                version: 1
            },

            // generic setter that mimics React's setState callback style
            setLocation: (updater) =>
                set((s) => {
                    const nextLocation = typeof updater === 'function' ? updater(s.location) : updater;
                    return { location: nextLocation };
                }),

            _hasHydrated: false,
            setHasHydrated: (v) => set({ _hasHydrated: v }),    
        }),
        
        {
            name: 'location', 
            storage: createJSONStorage(() => localStorage), 

            partialize: (state) => ({ location: state.location }),  
            version: 1,

            onRehydrateStorage: () => (state) => {  
                state?.setHasHydrated(true);
            },
        }
    )
);