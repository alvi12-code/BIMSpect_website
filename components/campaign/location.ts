"use client";

import { useSyncExternalStore } from "react";

// history.replaceState does not emit an event, so in-page URL updates made
// here announce themselves; back/forward and fragment changes use popstate.
const LOCATION_CHANGE_EVENT = "bimspect:location-change";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(LOCATION_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(LOCATION_CHANGE_EVENT, onChange);
  };
}

// The server snapshot is empty; React re-renders with the real query after
// hydration without a hydration mismatch.
export function useLocationSearch() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => ""
  );
}

// `null` state lets the Next.js App Router keep its own history state in sync.
export function replaceLocation(url: string) {
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
}
