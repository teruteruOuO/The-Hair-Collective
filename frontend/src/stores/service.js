import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useServiceStore = create(
    persist(
        (set) => ({
            service: { 
                types: [],
                version: 1,
                scrollToInstances: false   // Used by REST APIs of component so that they scroll to the component
            },

            // generic setter that mimics React's setState callback style
            setService: (updater) =>
                set((s) => {
                    const nextService = typeof updater === 'function' ? updater(s.service) : updater;
                    return { service: nextService };
                }),

            _hasHydrated: false,
            setHasHydrated: (v) => set({ _hasHydrated: v }),    
        }),
        
        {
            name: 'service', 
            storage: createJSONStorage(() => localStorage), 

            partialize: (state) => ({ service: state.service }),  
            version: 1,

            onRehydrateStorage: () => (state) => {  
                state?.setHasHydrated(true);
            },
        }
    )
);