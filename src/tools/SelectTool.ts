import type { AppState } from "../store/appState";
import { hitTestPoint, hitTestArea } from "../renderer/hitTest";
import { getResizeHandle, getElementCenter, getRotationFromPointer } from "../renderer/geometry";
import { useStore } from "../store/appStore";

export const SelectTool = {
  cursor: "default" as string,
  mode: null as "drag" | "resize" | "rotate" | "select" | null,
  startPoint: null as { x: number; y: number } | null,
  resizeHandle: null as string | null,
  initialBounds: null as any,
  dragStartElements: null as Map<string, { x: number; y: number }> | null,

  onPointerDown(e: PointerEvent, appState: AppState, scene: any) {
    const store = useStore.getState();
    const zoom = appState.zoom.value;
    const sx = e.clientX;
    const sy = e.clientY;
    const sceneX = (sx - appState.scrollX) / zoom;
    const sceneY = (sy - appState.scrollY) / zoom;

    this.startPoint = { x: sceneX, y: sceneY };

    const selectedIds = Object.keys(appState.selectedElementIds);
    for (const id of selectedIds) {
      const el = scene.getElement(id);
      if (!el) continue;
      const handle = getResizeHandle(el, sceneX, sceneY, zoom);
      if (handle === "rotation") {
        this.mode = "rotate";
        store.setAppState({ isRotating: true });
        return;
      }
      if (handle) {
        this.mode = "resize";
        this.resizeHandle = handle;
        this.initialBounds = { x: el.x, y: el.y, width: el.width, height: el.height };
        store.setAppState({ resizingElement: el });
        return;
      }
    }

    const hit = hitTestPoint(scene.getElements(), sceneX, sceneY, zoom);

    if (hit) {
      let targetElement = hit;
      if (hit.groupIds.length > 0) {
        const groupId = hit.groupIds[hit.groupIds.length - 1];
        const groupElements = scene.getElements().filter((el: any) => el.groupIds.includes(groupId));
        if (groupElements.length > 1) {
          const ids: Record<string, true> = {};
          groupElements.forEach((el: any) => (ids[el.id] = true));
          store.setAppState({ selectedElementIds: ids });
          this.mode = "drag";
          this.dragStartElements = new Map();
          groupElements.forEach((el: any) => this.dragStartElements!.set(el.id, { x: el.x, y: el.y }));
          return;
        }
      }

      if (e.shiftKey) {
        store.selectElement(hit.id, true);
      } else if (!appState.selectedElementIds[hit.id]) {
        store.selectElement(hit.id);
      }

      this.mode = "drag";
      this.dragStartElements = new Map();
      const currentSelectedIds = Object.keys(store.appState.selectedElementIds);
      for (const id of currentSelectedIds) {
        const el = scene.getElement(id);
        if (el) this.dragStartElements.set(id, { x: el.x, y: el.y });
      }
    } else {
      if (!e.shiftKey) store.deselectAll();
      this.mode = "select";
      store.setAppState({
        selectionElement: { x: sceneX, y: sceneY, width: 0, height: 0 },
      });
    }
  },

  onPointerMove(e: PointerEvent, appState: AppState, scene: any) {
    if (!this.startPoint) return;

    const zoom = appState.zoom.value;
    const sx = e.clientX;
    const sy = e.clientY;
    const sceneX = (sx - appState.scrollX) / zoom;
    const sceneY = (sy - appState.scrollY) / zoom;
    const dx = sceneX - this.startPoint.x;
    const dy = sceneY - this.startPoint.y;
    const store = useStore.getState();

    if (this.mode === "drag" && this.dragStartElements) {
      const selectedIds = Object.keys(appState.selectedElementIds);
      for (const id of selectedIds) {
        const start = this.dragStartElements.get(id);
        if (!start) continue;
        let newX = start.x + dx;
        let newY = start.y + dy;
        if (appState.snapToGrid) {
          newX = Math.round(newX / appState.gridSize) * appState.gridSize;
          newY = Math.round(newY / appState.gridSize) * appState.gridSize;
        }
        scene.updateElement(id, { x: newX, y: newY });
      }
    } else if (this.mode === "resize" && this.resizeHandle) {
      const selectedIds = Object.keys(appState.selectedElementIds);
      const elId = selectedIds[0];
      if (!elId) return;
      const el = scene.getElement(elId);
      if (!el || !this.initialBounds) return;

      let newWidth = this.initialBounds.width;
      let newHeight = this.initialBounds.height;
      let newX = this.initialBounds.x;
      let newY = this.initialBounds.y;

      const h = this.resizeHandle;
      if (h.includes("e")) newWidth = Math.max(1, this.initialBounds.width + dx);
      if (h.includes("w")) {
        newWidth = Math.max(1, this.initialBounds.width - dx);
        newX = this.initialBounds.x + dx;
      }
      if (h.includes("s")) newHeight = Math.max(1, this.initialBounds.height + dy);
      if (h.includes("n")) {
        newHeight = Math.max(1, this.initialBounds.height - dy);
        newY = this.initialBounds.y + dy;
      }

      if (e.shiftKey) {
        const aspect = this.initialBounds.width / this.initialBounds.height;
        if (h.includes("e") || h.includes("w")) newHeight = newWidth / aspect;
        else newWidth = newHeight * aspect;
      }

      scene.updateElement(elId, { x: newX, y: newY, width: newWidth, height: newHeight });
    } else if (this.mode === "rotate") {
      const selectedIds = Object.keys(appState.selectedElementIds);
      const elId = selectedIds[0];
      if (!elId) return;
      const el = scene.getElement(elId);
      if (!el) return;
      const angle = getRotationFromPointer(el, sceneX, sceneY, e.ctrlKey || e.metaKey);
      scene.updateElement(elId, { angle });
    } else if (this.mode === "select") {
      const sel = appState.selectionElement;
      if (!sel) return;
      store.setAppState({
        selectionElement: {
          x: Math.min(this.startPoint.x, sceneX),
          y: Math.min(this.startPoint.y, sceneY),
          width: Math.abs(dx),
          height: Math.abs(dy),
        },
      });
    }
  },

  onPointerUp(e: PointerEvent, appState: AppState, scene: any) {
    const store = useStore.getState();

    if (this.mode === "select" && appState.selectionElement) {
      const sel = appState.selectionElement;
      const hitElements = hitTestArea(scene.getElements(), sel.x, sel.y, sel.x + sel.width, sel.y + sel.height, !e.shiftKey);
      const ids: Record<string, true> = {};
      hitElements.forEach((el: any) => (ids[el.id] = true));
      store.setAppState({ selectedElementIds: ids, selectionElement: null });
    }

    if (this.mode === "drag" || this.mode === "resize" || this.mode === "rotate") {
      store.pushHistory();
    }

    this.mode = null;
    this.startPoint = null;
    this.resizeHandle = null;
    this.initialBounds = null;
    this.dragStartElements = null;
    store.setAppState({ resizingElement: null, isRotating: false });
  },

  onDoubleClick(e: MouseEvent, appState: AppState, scene: any) {
    const zoom = appState.zoom.value;
    const sceneX = (e.clientX - appState.scrollX) / zoom;
    const sceneY = (e.clientY - appState.scrollY) / zoom;

    const hit = hitTestPoint(scene.getElements(), sceneX, sceneY, zoom);
    if (hit && (hit.type === "text" || hit.type === "rectangle" || hit.type === "ellipse" || hit.type === "diamond")) {
      const store = useStore.getState();
      store.setEditingElement(hit);
      store.setAppState({ editingElement: hit });
    }
  },

  onCancel(appState: AppState, scene: any) {
    const store = useStore.getState();
    store.deselectAll();
    this.mode = null;
    this.startPoint = null;
    this.resizeHandle = null;
    this.initialBounds = null;
    this.dragStartElements = null;
  },
};
