import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  doc,
  onSnapshot,
  Unsubscribe,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { firebaseDb } from "app";


let unsubscribe: Unsubscribe | null = null;

interface FavoritesState {
  favoriteIds: string[];
  loading: boolean;
  loadFavorites: (userId: string) => void;
  toggleFavorite: (userId: string, exerciseId: string) => Promise<void>;
  clearFavorites: () => void;
}

const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      loading: false,

      
      loadFavorites: (userId) => {
        if (unsubscribe) unsubscribe();

        set({ loading: true });
        const docRef = doc(firebaseDb, "favorites", userId);

        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            set({ favoriteIds: docSnap.data().exerciseIds || [] });
          } else {
            set({ favoriteIds: [] });
          }
          set({ loading: false });
        });
      },

      // Action to add/remove a favorite AND update Firestore
      toggleFavorite: async (userId: string, exerciseId: string) => {
        const docRef = doc(firebaseDb, "favorites", userId);
        const currentFavorites = get().favoriteIds;
        const isFavorited = currentFavorites.includes(exerciseId);

        let updatedFavorites;
        if (isFavorited) {
          updatedFavorites = currentFavorites.filter((id) => id !== exerciseId);
        } else {
          updatedFavorites = [...currentFavorites, exerciseId];
        }

        
        set({ favoriteIds: updatedFavorites });


        try {
          await setDoc(docRef, { exerciseIds: updatedFavorites }, { merge: true });
        } catch (error) {
          console.error("Failed to update favorites in Firestore:", error);
          
          set({ favoriteIds: currentFavorites });
        }
      },

      
      clearFavorites: () => {
        if (unsubscribe) unsubscribe();
        set({ favoriteIds: [], loading: false });
        unsubscribe = null;
      },
    }),
    {
      
      name: "muvability-favorites-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useFavoritesStore;
