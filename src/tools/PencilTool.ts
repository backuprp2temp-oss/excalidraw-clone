import type { AppState } from "../store/appState";
import type { Point } from "../elements/types";
import { createElement } from "../elements/factory";
import { useStore } from "../store/appStore";

export const PencilTool = {
  cursor: "crosshair" as string,
  currentElementId: null as string | null,
  points: [] as Point[],
  pressures: [] as number[],
  isDrawing: false,

  onPointerDown(e: PointerEvent, appState: AppState, scene: any) {
    const zoom = appState.zoom.value;
    const sceneX = (e.clientX - appState.scrollX) / zoom;
    const sceneY = (e.clientY - appState.scrollY) / zoom;

    this.isDrawing = true;
    this.points = [[0, 0]];
    this.pressures = [e.pressure || 0.5];

    const el = createElement("freedraw", sceneX, sceneY, 0, 0, {
      strokeColor: appState.currentItemStrokeColor,
      strokeWidth: appState.currentItemStrokeWidth,
      roughness: 0,
      opacity: appState.currentItemOpacity,
    });
    (el as any).points = this.points;
    (el as any).pressures = this.pressures;
    (el as any).simulatePressure = true;
    scene.addElement(el);
    this.currentElementId = el.id;
  },

  onPointerMove(e: PointerEvent, appState: AppState, scene: any) {
    if (!this.currentElementId || !this.isDrawing) return;

    const zoom = appState.zoom.value;
    const sceneX = (e.clientX - appState.scrollX) / zoom;
    const sceneY = (e.clientY - appState.scrollY) / zoom;

    const el = scene.getElement(this.currentElementId);
    if (!el) return;

    const newPt: Point = [sceneX - el.x, sceneY - el.y];
    this.points = [...this.points, newPt];
    this.pressures = [...this.pressures, e.pressure || 0.5];

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of this.points) {
      minX = Math.min(minX, p[0]);
      minY = Math.min(minY, p[1]);
      maxX = Math.max(maxX, p[0]);
      maxY = Math.max(maxY, p[1]);
    }

    scene.updateElement(this.currentElementId, {
      points: this.points,
      pressures: this.pressures,
      x: el.x + minX,
      y: el.y + minY,
      width: maxX - minX || 1,
      height: maxY - minY || 1,
    });
  },

  onPointerUp(e: PointerEvent, appState: AppState, scene: any) {
    if (!this.currentElementId) return;
    this.isDrawing = false;
    const store = useStore.getState();
    store.pushHistory();
    store.setAppState({ selectedElementIds: { [this.currentElementId]: true } });
    this.currentElementId = null;
    this.points = [];
    this.pressures = [];
  },

  onCancel(appState: AppState, scene: any) {
    if (this.currentElementId) scene.removeElements([this.currentElementId]);
    this.currentElementId = null;
    this.points = [];
    this.pressures = [];
    this.isDrawing = false;
  },
};
