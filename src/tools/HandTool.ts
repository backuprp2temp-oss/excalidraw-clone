import type { AppState } from "../store/appState";
import { useStore } from "../store/appStore";

export const HandTool = {
  cursor: "grab" as string,
  isPanning: false,
  lastX: 0,
  lastY: 0,

  onPointerDown(e: PointerEvent, appState: AppState, scene: any) {
    this.isPanning = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.cursor = "grabbing";
  },

  onPointerMove(e: PointerEvent, appState: AppState, scene: any) {
    if (!this.isPanning) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    const store = useStore.getState();
    store.setAppState({ scrollX: appState.scrollX + dx, scrollY: appState.scrollY + dy });
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  },

  onPointerUp(e: PointerEvent, appState: AppState, scene: any) {
    this.isPanning = false;
    this.cursor = "grab";
  },

  onCancel(appState: AppState, scene: any) {
    this.isPanning = false;
    this.cursor = "grab";
  },
};
