import { useEffect } from "react";
import { useStore } from "../store/appStore";
import { copyToClipboardAsJSON } from "../utils/clipboard";
import { nanoid } from "nanoid";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useStore.getState();
      const appState = store.appState;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if (appState.editingElement) {
        if (e.key === "Escape") {
          store.setEditingElement(null);
          store.setAppState({ editingElement: null });
          store.pushHistory();
        }
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      const toolMap: Record<string, any> = {
        v: { type: "selection" }, "1": { type: "selection" },
        h: { type: "hand" }, "2": { type: "hand" },
        r: { type: "rectangle" }, "3": { type: "rectangle" },
        d: { type: "diamond" }, "4": { type: "diamond" },
        o: { type: "ellipse" }, "5": { type: "ellipse" },
        a: { type: "arrow" }, "6": { type: "arrow" },
        l: { type: "line" }, "7": { type: "line" },
        p: { type: "freedraw" }, "8": { type: "freedraw" },
        t: { type: "text" }, "9": { type: "text" },
        e: { type: "eraser" },
        i: { type: "image" }, "0": { type: "image" },
      };

      if (!ctrl && !shift && toolMap[key]) {
        e.preventDefault();
        store.setAppState({ activeTool: toolMap[key] });
        return;
      }

      if (ctrl && key === "z" && !shift) { e.preventDefault(); store.undo(); return; }
      if ((ctrl && key === "y") || (ctrl && key === "z" && shift)) { e.preventDefault(); store.redo(); return; }

      if (ctrl && key === "a") {
        e.preventDefault();
        const ids: Record<string, true> = {};
        store.elements.forEach((el: any) => { if (!el.locked) ids[el.id] = true; });
        store.setAppState({ selectedElementIds: ids });
        return;
      }

      if (ctrl && key === "c") {
        e.preventDefault();
        const selected = store.elements.filter((el: any) => appState.selectedElementIds[el.id]);
        if (selected.length > 0) { store.setClipboard(selected); copyToClipboardAsJSON(selected); }
        return;
      }

      if (ctrl && key === "x") {
        e.preventDefault();
        const selected = store.elements.filter((el: any) => appState.selectedElementIds[el.id]);
        if (selected.length > 0) { store.setClipboard(selected); copyToClipboardAsJSON(selected); store.deleteSelected(); store.pushHistory(); }
        return;
      }

      if (ctrl && key === "v") {
        e.preventDefault();
        const clipboard = store.getClipboard();
        if (clipboard.length > 0) {
          const newElements = clipboard.map((el: any) => ({
            ...JSON.parse(JSON.stringify(el)),
            id: nanoid(),
            x: el.x + 20,
            y: el.y + 20,
            version: el.version + 1,
            versionNonce: Math.floor(Math.random() * 2000000000),
            seed: Math.floor(Math.random() * 2000000000),
          }));
          const newIds: Record<string, true> = {};
          newElements.forEach((el: any) => (newIds[el.id] = true));
          store.setElements([...store.elements, ...newElements]);
          store.setAppState({ selectedElementIds: newIds });
          store.pushHistory();
          store.setClipboard(newElements);
        }
        return;
      }

      if (ctrl && key === "d") { e.preventDefault(); store.duplicateSelected(); return; }

      if (key === "delete" || key === "backspace") { e.preventDefault(); store.deleteSelected(); store.pushHistory(); return; }
      if (ctrl && key === "g" && !shift) { e.preventDefault(); store.groupSelected(); return; }
      if (ctrl && key === "g" && shift) { e.preventDefault(); store.ungroupSelected(); return; }

      if (key === "escape") {
        e.preventDefault();
        store.deselectAll();
        store.setAppState({ contextMenu: null, selectionElement: null });
        if (appState.activeTool.type !== "selection" && appState.activeTool.type !== "hand") {
          store.setAppState({ activeTool: { type: "selection" } });
        }
        return;
      }

      if (key === "enter" && !ctrl) {
        const selectedIds = Object.keys(appState.selectedElementIds);
        if (selectedIds.length === 1) {
          const el = store.elements.find((e: any) => e.id === selectedIds[0]);
          if (el && (el.type === "text" || el.type === "rectangle" || el.type === "ellipse" || el.type === "diamond")) {
            store.setEditingElement(el);
            store.setAppState({ editingElement: el });
          }
        }
        return;
      }

      if (ctrl && (key === "=" || key === "+")) {
        e.preventDefault();
        store.setAppState({ zoom: { value: Math.min(30, appState.zoom.value * 1.2) } });
        return;
      }
      if (ctrl && key === "-") {
        e.preventDefault();
        store.setAppState({ zoom: { value: Math.max(0.1, appState.zoom.value / 1.2) } });
        return;
      }
      if (ctrl && shift && key === "h") { e.preventDefault(); store.setAppState({ zoom: { value: 1 } }); return; }
      if (shift && key === "1") { e.preventDefault(); fitAll(store); return; }
      if (ctrl && key === "s") { e.preventDefault(); store.saveToFile(); return; }

      if (key.startsWith("arrow")) {
        e.preventDefault();
        const nudgeAmount = shift ? 10 : 1;
        let dx = 0, dy = 0;
        if (key === "arrowleft") dx = -nudgeAmount;
        if (key === "arrowright") dx = nudgeAmount;
        if (key === "arrowup") dy = -nudgeAmount;
        if (key === "arrowdown") dy = nudgeAmount;
        Object.keys(appState.selectedElementIds).forEach((id) => {
          const el = store.elements.find((e: any) => e.id === id);
          if (el) store.updateElement(id, { x: el.x + dx, y: el.y + dy });
        });
        if (Object.keys(appState.selectedElementIds).length > 0) store.pushHistory();
        return;
      }

      if (key === "[") { e.preventDefault(); ctrl ? store.sendToBack() : store.sendBackward(); return; }
      if (key === "]") { e.preventDefault(); ctrl ? store.bringToFront() : store.bringForward(); return; }

      if (ctrl && shift && key === "f") {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

function fitAll(store: any) {
  const elements = store.elements;
  if (elements.length === 0) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    minX = Math.min(minX, el.x); minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width); maxY = Math.max(maxY, el.y + el.height);
  }
  const padding = 50;
  const contentWidth = maxX - minX + padding * 2;
  const contentHeight = maxY - minY + padding * 2;
  const { width, height } = store.appState;
  const zoom = Math.min(width / contentWidth, height / contentHeight, 1);
  const scrollX = (width / zoom - (maxX + minX)) / 2;
  const scrollY = (height / zoom - (maxY + minY)) / 2;
  store.setAppState({ zoom: { value: zoom }, scrollX, scrollY });
}
