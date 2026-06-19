import type { ExcalidrawElement } from "../elements/types";
import type { AppState } from "../store/appState";

export function exportToJSON(
  elements: ExcalidrawElement[],
  appState: AppState,
  files: Record<string, { mimeType: string; dataURL: string }> = {}
): string {
  return JSON.stringify(
    {
      type: "excalidraw",
      version: 2,
      source: "https://excalidraw.com",
      elements,
      appState: {
        viewBackgroundColor: appState.theme === "dark" ? "#121212" : "#ffffff",
        gridSize: appState.gridSize,
      },
      files,
    },
    null,
    2
  );
}

export function downloadJSON(jsonString: string, filename: string) {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
