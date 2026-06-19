import type { AppState } from "../store/appState";
import { createElement } from "../elements/factory";
import { useStore } from "../store/appStore";

export const TextTool = {
  cursor: "text" as string,

  onPointerDown(e: PointerEvent, appState: AppState, scene: any) {
    const zoom = appState.zoom.value;
    const sceneX = (e.clientX - appState.scrollX) / zoom;
    const sceneY = (e.clientY - appState.scrollY) / zoom;
    const store = useStore.getState();

    const existingText = scene.getElements().find(
      (el: any) => el.type === "text" && sceneX >= el.x && sceneX <= el.x + el.width && sceneY >= el.y && sceneY <= el.y + el.height
    );

    if (existingText) {
      store.setEditingElement(existingText);
      store.setAppState({ editingElement: existingText, activeTool: { type: "selection" } });
      // Blur canvas so textarea can receive focus
      (e.target as HTMLElement)?.blur();
      return;
    }

    const el = createElement("text", sceneX, sceneY, 150, 40, {
      strokeColor: appState.currentItemStrokeColor,
      opacity: appState.currentItemOpacity,
    });
    (el as any).text = "";
    (el as any).fontSize = appState.currentItemFontSize;
    (el as any).fontFamily = appState.currentItemFontFamily;
    (el as any).textAlign = appState.currentItemTextAlign;
    (el as any).verticalAlign = "top";
    (el as any).lineHeight = 1.25;
    (el as any).baseline = 0;
    (el as any).containerId = null;
    scene.addElement(el);

    store.setEditingElement(el);
    store.setAppState({ editingElement: el, selectedElementIds: { [el.id]: true } });
    // Blur canvas so textarea can receive focus
    (e.target as HTMLElement)?.blur();
  },

  onPointerMove(e: PointerEvent, appState: AppState, scene: any) {},
  onPointerUp(e: PointerEvent, appState: AppState, scene: any) {},

  onCancel(appState: AppState, scene: any) {
    const store = useStore.getState();
    store.setEditingElement(null);
    store.setAppState({ editingElement: null });
  },
};
