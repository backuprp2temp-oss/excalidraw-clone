import { create } from "zustand";
import { nanoid } from "nanoid";
import type { ExcalidrawElement, ActiveTool, StrokeWidth, StrokeStyle, FillStyle, FontFamily, Arrowhead, RoundnessType } from "../elements/types";
import type { AppState } from "./appState";
import { initialAppState } from "./appState";

type HistoryEntry = {
  elements: ExcalidrawElement[];
  appState: Partial<AppState>;
};

type StoreState = {
  elements: ExcalidrawElement[];
  appState: AppState;
  history: HistoryEntry[];
  historyIndex: number;
  fileStore: Record<string, { mimeType: string; dataURL: string }>;
  clipboard: ExcalidrawElement[];

  setElements: (elements: ExcalidrawElement[]) => void;
  addElement: (element: ExcalidrawElement) => void;
  updateElement: (id: string, updates: Partial<ExcalidrawElement>) => void;
  removeElements: (ids: string[]) => void;
  getElement: (id: string) => ExcalidrawElement | undefined;
  setAppState: (updates: Partial<AppState>) => void;
  setActiveTool: (tool: ActiveTool) => void;
  selectElement: (id: string, addToSelection?: boolean) => void;
  deselectAll: () => void;
  clearSelection: () => void;
  setSelectedElements: (ids: string[]) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  setEditingElement: (el: ExcalidrawElement | null) => void;
  saveToFile: () => void;
  loadFromFile: (json: string) => void;
  addFile: (id: string, data: { mimeType: string; dataURL: string }) => void;
  getFile: (id: string) => { mimeType: string; dataURL: string } | undefined;
  setClipboard: (elements: ExcalidrawElement[]) => void;
  getClipboard: () => ExcalidrawElement[];
  replaceElement: (element: ExcalidrawElement) => void;
  resetStore: () => void;
};

export const useStore = create<StoreState>((set, get) => ({
  elements: [],
  appState: { ...initialAppState },
  history: [],
  historyIndex: -1,
  fileStore: {},
  clipboard: [],

  setElements: (elements) => set({ elements, appState: { ...get().appState, isDirty: true } }),

  addElement: (element) => {
    set((state) => ({
      elements: [...state.elements, element],
      appState: { ...state.appState, isDirty: true },
    }));
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates, version: el.version + 1, updated: Date.now() } as ExcalidrawElement : el
      ),
      appState: { ...state.appState, isDirty: true },
    }));
  },

  removeElements: (ids) => {
    set((state) => {
      const idSet = new Set(ids);
      const newSelectedIds = { ...state.appState.selectedElementIds };
      ids.forEach((id) => delete newSelectedIds[id]);
      return {
        elements: state.elements.filter((el) => !idSet.has(el.id)),
        appState: { ...state.appState, selectedElementIds: newSelectedIds, isDirty: true },
      };
    });
  },

  getElement: (id) => get().elements.find((el) => el.id === id),

  setAppState: (updates) => set((state) => ({ appState: { ...state.appState, ...updates } })),

  setActiveTool: (tool) => set((state) => ({ appState: { ...state.appState, activeTool: tool } })),

  selectElement: (id, addToSelection = false) =>
    set((state) => {
      if (addToSelection) {
        const current = state.appState.selectedElementIds;
        if (current[id]) {
          const newIds = { ...current };
          delete newIds[id];
          return { appState: { ...state.appState, selectedElementIds: newIds } };
        }
        return { appState: { ...state.appState, selectedElementIds: { ...current, [id]: true } } };
      }
      return { appState: { ...state.appState, selectedElementIds: { [id]: true } } };
    }),

  deselectAll: () => set((state) => ({ appState: { ...state.appState, selectedElementIds: {} } })),

  clearSelection: () => set((state) => ({ appState: { ...state.appState, selectedElementIds: {}, editingElement: null } })),

  setSelectedElements: (ids) =>
    set((state) => ({
      appState: { ...state.appState, selectedElementIds: Object.fromEntries(ids.map((id) => [id, true])) },
    })),

  pushHistory: () => {
    const { elements, appState, history, historyIndex } = get();
    const entry: HistoryEntry = {
      elements: JSON.parse(JSON.stringify(elements)),
      appState: { selectedElementIds: { ...appState.selectedElementIds } },
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(entry);
    if (newHistory.length > 100) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;
    const entry = history[historyIndex];
    set({
      elements: JSON.parse(JSON.stringify(entry.elements)),
      appState: { ...get().appState, ...entry.appState },
      historyIndex: historyIndex - 1,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 2] || history[historyIndex + 1];
    if (!entry) return;
    set({
      elements: JSON.parse(JSON.stringify(entry.elements)),
      appState: { ...get().appState, ...entry.appState },
      historyIndex: historyIndex + 1,
    });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  duplicateSelected: () => {
    const { elements, appState } = get();
    const selected = elements.filter((el) => appState.selectedElementIds[el.id]);
    if (selected.length === 0) return;
    const newElements = selected.map((el) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: nanoid(),
      x: el.x + 10,
      y: el.y + 10,
      version: el.version + 1,
      versionNonce: Math.floor(Math.random() * 2000000000),
      seed: Math.floor(Math.random() * 2000000000),
      updated: Date.now(),
    }));
    const newIds: Record<string, true> = {};
    newElements.forEach((el: any) => (newIds[el.id] = true));
    set((state) => ({
      elements: [...state.elements, ...newElements],
      appState: { ...state.appState, selectedElementIds: newIds, isDirty: true },
    }));
  },

  deleteSelected: () => {
    const { elements, appState } = get();
    const selectedIds = Object.keys(appState.selectedElementIds);
    if (selectedIds.length === 0) return;
    const idSet = new Set(selectedIds);
    set((state) => ({
      elements: state.elements.filter((el) => !idSet.has(el.id)),
      appState: { ...state.appState, selectedElementIds: {}, isDirty: true },
    }));
  },

  bringForward: () => {
    const { elements, appState } = get();
    const selectedIds = Object.keys(appState.selectedElementIds);
    if (selectedIds.length === 0) return;
    const newElements = [...elements];
    for (let i = newElements.length - 2; i >= 0; i--) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i + 1].id)) {
        [newElements[i], newElements[i + 1]] = [newElements[i + 1], newElements[i]];
      }
    }
    set({ elements: newElements, appState: { ...appState, isDirty: true } });
  },

  sendBackward: () => {
    const { elements, appState } = get();
    const selectedIds = Object.keys(appState.selectedElementIds);
    if (selectedIds.length === 0) return;
    const newElements = [...elements];
    for (let i = 1; i < newElements.length; i++) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i - 1].id)) {
        [newElements[i], newElements[i - 1]] = [newElements[i - 1], newElements[i]];
      }
    }
    set({ elements: newElements, appState: { ...appState, isDirty: true } });
  },

  bringToFront: () => {
    const { elements, appState } = get();
    const selectedIds = Object.keys(appState.selectedElementIds);
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const rest = elements.filter((el) => !selectedIds.includes(el.id));
    set({ elements: [...rest, ...selected], appState: { ...appState, isDirty: true } });
  },

  sendToBack: () => {
    const { elements, appState } = get();
    const selectedIds = Object.keys(appState.selectedElementIds);
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const rest = elements.filter((el) => !selectedIds.includes(el.id));
    set({ elements: [...selected, ...rest], appState: { ...appState, isDirty: true } });
  },

  groupSelected: () => {
    const { elements, appState } = get();
    const selectedIds = Object.keys(appState.selectedElementIds);
    if (selectedIds.length < 2) return;
    const groupId = nanoid();
    const newElements = elements.map((el) => {
      if (selectedIds.includes(el.id)) return { ...el, groupIds: [...el.groupIds, groupId] };
      return el;
    });
    set({ elements: newElements, appState: { ...appState, isDirty: true } });
  },

  ungroupSelected: () => {
    const { elements, appState } = get();
    const selectedIds = Object.keys(appState.selectedElementIds);
    const selectedGroups = new Set<string>();
    elements.forEach((el) => {
      if (selectedIds.includes(el.id)) el.groupIds.forEach((g) => selectedGroups.add(g));
    });
    if (selectedGroups.size === 0) return;
    const newElements = elements.map((el) => {
      if (selectedIds.includes(el.id)) return { ...el, groupIds: el.groupIds.filter((g) => !selectedGroups.has(g)) };
      return el;
    });
    set({ elements: newElements, appState: { ...appState, isDirty: true } });
  },

  setEditingElement: (el) => set((state) => ({ appState: { ...state.appState, editingElement: el } })),

  saveToFile: () => {
    const { elements, appState, fileStore } = get();
    const data = {
      type: "excalidraw",
      version: 2,
      source: "https://excalidraw.com",
      elements,
      appState: { viewBackgroundColor: appState.theme === "dark" ? "#121212" : "#ffffff", gridSize: appState.gridSize },
      files: fileStore,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appState.name || "Untitled"}.excalidraw`;
    a.click();
    URL.revokeObjectURL(url);
  },

  loadFromFile: (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.type === "excalidraw") {
        set({ elements: data.elements || [], fileStore: data.files || {}, appState: { ...get().appState, isDirty: false } });
      }
    } catch (e) {
      console.error("Failed to load file:", e);
    }
  },

  addFile: (id, data) => set((state) => ({ fileStore: { ...state.fileStore, [id]: data } })),

  getFile: (id) => get().fileStore[id],

  setClipboard: (elements) => set({ clipboard: elements }),
  getClipboard: () => get().clipboard,

  replaceElement: (element) => set((state) => ({
    elements: state.elements.map((el) => el.id === element.id ? element : el),
  })),

  resetStore: () => set({ elements: [], appState: { ...initialAppState }, history: [], historyIndex: -1 }),
}));
