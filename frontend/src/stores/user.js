import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useUserStore = create(
    persist(
        (set) => ({
            name: { firstName: '', lastName: '' },
            setNameFromEvent: (e) => {
                const { name: field, value } = e.target;
                set((s) => ({ name: { ...s.name, [field]: value } }));
            },
            /* Used like this:
            <input name="firstName" value={name.firstName} onChange={setNameFromEvent} />
            <input name="lastName"  value={name.lastName}  onChange={setNameFromEvent} />
            */


            // optional flag to know when rehydration finished:
            _hasHydrated: false,  // flips to true once persisted state has been loaded. Use it to avoid rendering UI that depends on persisted data until it’s ready (preventing flicker).
            setHasHydrated: (v) => set({ _hasHydrated: v }),    // sets _hasHydrated to true. Call this after rehydration completes.
        }),
        
        {
            name: 'user', // storage key
            storage: createJSONStorage(() => localStorage), // or sessionStorage

            // persist only what you need:
            partialize: (state) => ({ name: state.name }),  
            version: 1,

            onRehydrateStorage: () => (state) => {  // A lifecycle hook from Zustand’s persist middleware. Lets you run code before and after the persisted data is loaded. We use its “after” callback to flip _hasHydrated.
                state?.setHasHydrated(true);
            },
        }
    )
);