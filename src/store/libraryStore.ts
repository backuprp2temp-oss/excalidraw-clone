import { create } from "zustand";
import type { ExcalidrawElement } from "../elements/types";
import { nanoid } from "nanoid";

export type LibraryItem = {
  id: string;
  status: "published" | "unpublished";
  elements: ExcalidrawElement[];
  created: number;
};

type LibraryState = {
  items: LibraryItem[];
  isOpen: boolean;
  addItem: (elements: ExcalidrawElement[]) => void;
  removeItem: (id: string) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  exportLibrary: () => void;
  importLibrary: (json: string) => void;
};

const STORAGE_KEY = "excalidraw-library";

function loadLibrary(): LibraryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLibrary(items: LibraryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  items: loadLibrary(),
  isOpen: false,

  addItem: (elements) => {
    const item: LibraryItem = {
      id: nanoid(),
      status: "unpublished",
      elements: JSON.parse(JSON.stringify(elements)),
      created: Date.now(),
    };
    const newItems = [...get().items, item];
    saveLibrary(newItems);
    set({ items: newItems });
  },

  removeItem: (id) => {
    const newItems = get().items.filter((item) => item.id !== id);
    saveLibrary(newItems);
    set({ items: newItems });
  },

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),

  exportLibrary: () => {
    const data = JSON.stringify(get().items, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "excalidraw-library.excalidrawlib";
    a.click();
    URL.revokeObjectURL(url);
  },

  importLibrary: (json) => {
    try {
      const items = JSON.parse(json) as LibraryItem[];
      const newItems = [...get().items, ...items];
      saveLibrary(newItems);
      set({ items: newItems });
    } catch (e) {
      console.error("Failed to import library:", e);
    }
  },
}));
