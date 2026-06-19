import type { ExcalidrawElement } from "../elements/types";
import type { AppState } from "../store/appState";

export async function exportToPNG(
  elements: ExcalidrawElement[],
  appState: AppState,
  opts: {
    exportBackground: boolean;
    exportWithDarkMode: boolean;
    exportScale: number;
    exportPadding: number;
  }
): Promise<Blob> {
  const padding = opts.exportPadding;
  const scale = opts.exportScale;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    minX = Math.min(minX, el.x); minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width); maxY = Math.max(maxY, el.y + el.height);
  }

  if (elements.length === 0) { minX = 0; minY = 0; maxX = 100; maxY = 100; }

  const width = (maxX - minX + padding * 2) * scale;
  const height = (maxY - minY + padding * 2) * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  if (opts.exportBackground) {
    ctx.fillStyle = opts.exportWithDarkMode ? "#121212" : "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.scale(scale, scale);
  ctx.translate(-minX + padding, -minY + padding);

  const { renderScene } = await import("../renderer/render");
  const rough = (await import("roughjs")).default;
  const rc = rough.canvas(canvas);

  const tempState: AppState = {
    ...appState,
    scrollX: 0,
    scrollY: 0,
    zoom: { value: 1 },
    width: width / scale,
    height: height / scale,
    theme: opts.exportWithDarkMode ? "dark" : ("light" as "light" | "dark"),
  };

  renderScene(ctx, elements, tempState, rc);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else resolve(new Blob());
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
