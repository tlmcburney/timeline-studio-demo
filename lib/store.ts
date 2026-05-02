/**
 * Simple in-memory store using React context.
 * No database — all state lives in memory for this prototype.
 */
import { createContext, useContext } from "react";
import { Event } from "./types";

export interface AppState {
  event: Event;
  setEvent: (event: Event) => void;
}

export const AppContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppContext.Provider");
  return ctx;
}
