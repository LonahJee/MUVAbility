import type {  ReactNode } from "react";
import React, { useEffect } from "react";
import { Toaster } from "sonner";
import {useExerciseStore } from "utils/exerciseStore";


interface Props {
  children: ReactNode;
}


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