import type { AppState } from "../store/appState";
import { createElement } from "../elements/factory";
import { useStore } from "../store/appStore";

function createShapeTool(type: "rectangle" | "ellipse" | "diamond") {
  let startPoint: { x: number; y: number } | null = null;
  let currentElementId: string | null = null;
  let lastElementId: string | null = null;

  return {
    cursor: "crosshair" as string,

    onPointerDown(e: PointerEvent, appState: AppState, scene: any) {
      const zoom = appState.zoom.value;
      const sx = e.clientX;
      const sy = e.clientY;
      let sceneX = (sx - appState.scrollX) / zoom;
      let sceneY = (sy - appState.scrollY) / zoom;

      if (appState.snapToGrid) {
        sceneX = Math.round(sceneX / appState.gridSize) * appState.gridSize;
        sceneY = Math.round(sceneY / appState.gridSize) * appState.gridSize;
      }

      startPoint = { x: sceneX, y: sceneY };

      const overrides = {
        strokeColor: appState.currentItemStrokeColor,
        backgroundColor: appState.currentItemBackgroundColor,
        fillStyle: appState.currentItemFillStyle,
        strokeWidth: appState.currentItemStrokeWidth,
        strokeStyle: appState.currentItemStrokeStyle,
        roughness: appState.currentItemRoughness,
        opacity: appState.currentItemOpacity,
        roundness: appState.currentItemRoundness === 1 ? null : { type: 2, value: 8 },
      };
      const el = createElement(type as any, sceneX, sceneY, 0, 0, overrides as any);

      scene.addElement(el);
      currentElementId = el.id;
      lastElementId = el.id;
    },

    onPointerMove(e: PointerEvent, appState: AppState, scene: any) {
      if (!startPoint || !currentElementId) return;

      const zoom = appState.zoom.value;
      const sx = e.clientX;
      const sy = e.clientY;
      let sceneX = (sx - appState.scrollX) / zoom;
      let sceneY = (sy - appState.scrollY) / zoom;

      if (appState.snapToGrid) {
        sceneX = Math.round(sceneX / appState.gridSize) * appState.gridSize;
        sceneY = Math.round(sceneY / appState.gridSize) * appState.gridSize;
      }

      let x = Math.min(startPoint.x, sceneX);
      let y = Math.min(startPoint.y, sceneY);
      let w = Math.abs(sceneX - startPoint.x);
      let h = Math.abs(sceneY - startPoint.y);

      if (e.shiftKey) {
        const size = Math.max(w, h);
        w = size;
        h = size;
        if (sceneX < startPoint.x) x = startPoint.x - size;
        if (sceneY < startPoint.y) y = startPoint.y - size;
      }

      if (e.altKey) {
        const cx = startPoint.x;
        const cy = startPoint.y;
        x = cx - w / 2;
        y = cy - h / 2;
      }

      scene.updateElement(currentElementId, { x, y, width: w, height: h });
    },

    onPointerUp(e: PointerEvent, appState: AppState, scene: any) {
      const store = useStore.getState();
      if (lastElementId) {
        store.pushHistory();
        store.setAppState({
          selectedElementIds: { [lastElementId]: true },
        });
      }
      startPoint = null;
      currentElementId = null;
      lastElementId = null;
    },

    onCancel(appState: AppState, scene: any) {
      if (currentElementId) scene.removeElements([currentElementId]);
      startPoint = null;
      currentElementId = null;
      lastElementId = null;
    },
  };
}

export const RectangleTool = createShapeTool("rectangle");
export const EllipseTool = createShapeTool("ellipse");
export const DiamondTool = createShapeTool("diamond");
