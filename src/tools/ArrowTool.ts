import type { AppState } from "../store/appState";
import type { Point } from "../elements/types";
import { createElement } from "../elements/factory";
import { useStore } from "../store/appStore";

export const ArrowTool = {
  cursor: "crosshair" as string,
  currentElementId: null as string | null,
  startSceneX: 0,
  startSceneY: 0,

  onPointerDown(e: PointerEvent, appState: AppState, scene: any) {
    const zoom = appState.zoom.value;
    let sceneX = (e.clientX - appState.scrollX) / zoom;
    let sceneY = (e.clientY - appState.scrollY) / zoom;

    if (appState.snapToGrid) {
      sceneX = Math.round(sceneX / appState.gridSize) * appState.gridSize;
      sceneY = Math.round(sceneY / appState.gridSize) * appState.gridSize;
    }

    this.startSceneX = sceneX;
    this.startSceneY = sceneY;

    const el = createElement("arrow", sceneX, sceneY, 0, 0, {
      strokeColor: appState.currentItemStrokeColor,
      strokeWidth: appState.currentItemStrokeWidth,
      strokeStyle: appState.currentItemStrokeStyle,
      roughness: appState.currentItemRoughness,
      opacity: appState.currentItemOpacity,
    });
    (el as any).startArrowhead = appState.currentItemStartArrowhead;
    (el as any).endArrowhead = appState.currentItemEndArrowhead;
    (el as any).points = [[0, 0]];
    scene.addElement(el);
    this.currentElementId = el.id;
  },

  onPointerMove(e: PointerEvent, appState: AppState, scene: any) {
    if (!this.currentElementId) return;

    const zoom = appState.zoom.value;
    const sceneX = (e.clientX - appState.scrollX) / zoom;
    const sceneY = (e.clientY - appState.scrollY) / zoom;

    const dx = sceneX - this.startSceneX;
    const dy = sceneY - this.startSceneY;

    const points: Point[] = [[0, 0], [dx, dy]];

    scene.updateElement(this.currentElementId, {
      points,
      width: Math.abs(dx),
      height: Math.abs(dy),
    });
  },

  onPointerUp(e: PointerEvent, appState: AppState, scene: any) {
    if (!this.currentElementId) return;

    const el = scene.getElement(this.currentElementId);
    if (!el) { this.currentElementId = null; return; }

    const zoom = appState.zoom.value;
    const sceneX = (e.clientX - appState.scrollX) / zoom;
    const sceneY = (e.clientY - appState.scrollY) / zoom;

    const dx = sceneX - this.startSceneX;
    const dy = sceneY - this.startSceneY;

    // Remove zero-length arrows
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
      scene.removeElements([this.currentElementId]);
      this.currentElementId = null;
    } else {
      scene.updateElement(this.currentElementId, {
        points: [[0, 0], [dx, dy]],
        width: Math.abs(dx),
        height: Math.abs(dy),
      });
    }

    const store = useStore.getState();
    store.pushHistory();
    store.setAppState({ selectedElementIds: this.currentElementId ? { [this.currentElementId]: true } : {} });
    this.currentElementId = null;
  },

  onKeyDown(e: KeyboardEvent, appState: AppState, scene: any) {
    if (e.key === "Escape") {
      if (this.currentElementId) scene.removeElements([this.currentElementId]);
      this.currentElementId = null;
      const store = useStore.getState();
      store.setAppState({ activeTool: { type: "selection" } });
    }
  },

  onCancel(appState: AppState, scene: any) {
    if (this.currentElementId) scene.removeElements([this.currentElementId]);
    this.currentElementId = null;
  },
};
