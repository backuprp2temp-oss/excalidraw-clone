import type { AppState } from "../store/appState";
import { createElement } from "../elements/factory";
import { useStore } from "../store/appStore";

export const ImageTool = {
  cursor: "crosshair" as string,

  onPointerDown(e: PointerEvent, appState: AppState, scene: any) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (re) => {
        const dataURL = re.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const store = useStore.getState();
          const fileId = Math.random().toString(36).substr(2, 9);
          store.addFile(fileId, { mimeType: file.type, dataURL });

          const zoom = appState.zoom.value;
          const sceneX = (e.clientX - appState.scrollX) / zoom;
          const sceneY = (e.clientY - appState.scrollY) / zoom;

          const maxWidth = 400;
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const width = img.width * scale;
          const height = img.height * scale;

          const el = createElement("image", sceneX, sceneY, width, height, {
            strokeColor: appState.currentItemStrokeColor,
            opacity: appState.currentItemOpacity,
          });
          (el as any).fileId = fileId;
          (el as any).status = "saved";
          (el as any).scale = [1, 1];

          store.addElement(el);
          store.pushHistory();
          store.setAppState({ selectedElementIds: { [el.id]: true } });
        };
        img.src = dataURL;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  onPointerMove(e: PointerEvent, appState: AppState, scene: any) {},
  onPointerUp(e: PointerEvent, appState: AppState, scene: any) {},
  onCancel(appState: AppState, scene: any) {},
};
