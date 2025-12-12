"use client";

import { ReactNode } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "..";

export function PersistProvider({ children }: { children: ReactNode }) {
  return (
    <PersistGate loading={null} persistor={persistor}>
      {children}
    </PersistGate>
  );
}