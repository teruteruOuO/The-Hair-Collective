import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStylistStore = create(
    persist(
        (set) => ({
            stylist: { 
                stylists: [],
                version: 1,
            },

            // generic setter that mimics React's setState callback style
            setStylist: (updater) =>
                set((s) => {
                    const nextStylist = typeof updater === 'function' ? updater(s.stylist) : updater;
                    return { stylist: nextStylist };
                }),

            _hasHydrated: false,
            setHasHydrated: (v) => set({ _hasHydrated: v }),    
        }),
        
        {
            name: 'stylist', 
            storage: createJSONStorage(() => localStorage), 

            partialize: (state) => ({ stylist: state.stylist }),  
            version: 1,

            onRehydrateStorage: () => (state) => {  
                state?.setHasHydrated(true);
            },
        }
    )
);