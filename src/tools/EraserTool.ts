import type { AppState } from "../store/appState";
import { useStore } from "../store/appStore";

export const EraserTool = {
  cursor: "crosshair" as string,
  erasedIds: new Set<string>(),

  onPointerDown(e: PointerEvent, appState: AppState, scene: any) {
    this.erasedIds = new Set();
  },

  onPointerMove(e: PointerEvent, appState: AppState, scene: any) {
    if (e.buttons === 0) return;
    const zoom = appState.zoom.value;
    const sceneX = (e.clientX - appState.scrollX) / zoom;
    const sceneY = (e.clientY - appState.scrollY) / zoom;

    for (const el of scene.getElements()) {
      if (el.locked) continue;
      if (sceneX >= el.x && sceneX <= el.x + el.width && sceneY >= el.y && sceneY <= el.y + el.height) {
        this.erasedIds.add(el.id);
        scene.removeElements([el.id]);
      }
    }
  },

  onPointerUp(e: PointerEvent, appState: AppState, scene: any) {
    if (this.erasedIds.size > 0) {
      const store = useStore.getState();
      store.pushHistory();
    }
    this.erasedIds = new Set();
  },

  onCancel(appState: AppState, scene: any) {
    this.erasedIds = new Set();
  },
};
