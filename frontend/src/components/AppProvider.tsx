import type {  ReactNode } from "react";
import React, { useEffect } from "react";
import { Toaster } from "sonner";
import {useExerciseStore } from "utils/exerciseStore";


interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 */
export const AppProvider = ({ children }: Props) => {
  const {fetchExercises} = useExerciseStore();
  useEffect(() => { fetchExercises(); }, [fetchExercises]);
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
};