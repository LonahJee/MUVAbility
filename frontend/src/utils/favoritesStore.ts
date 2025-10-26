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

// This will hold the function to stop listening to Firestore changes
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

      // Action to load favorites from Firestore in real-time
      loadFavorites: (userId) => {
        if (unsubscribe) unsubscribe(); // Stop any previous listener

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

        // Optimistically update the local state for instant UI feedback
        set({ favoriteIds: updatedFavorites });

        // Update the document in Firestore
        try {
          await setDoc(docRef, { exerciseIds: updatedFavorites }, { merge: true });
        } catch (error) {
          console.error("Failed to update favorites in Firestore:", error);
          // If the update fails, revert the optimistic change
          set({ favoriteIds: currentFavorites });
        }
      },

      // Action to clean up when the user logs out
      clearFavorites: () => {
        if (unsubscribe) unsubscribe();
        set({ favoriteIds: [], loading: false });
        unsubscribe = null;
      },
    }),
    {
      // Configuration for localStorage persistence
      name: "muvability-favorites-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useFavoritesStore;
