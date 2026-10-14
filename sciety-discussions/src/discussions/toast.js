// Tiny toast store: showToast('Comment added') from anywhere; <Toast /> renders it.
import { useSyncExternalStore } from 'react';

let current = null; // { id, message }
const listeners = new Set();
let timer;

export function showToast(message) {
  current = { id: Date.now(), message };
  listeners.forEach((l) => l());
  clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    listeners.forEach((l) => l());
  }, 3000);
}

export function useToast() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}
