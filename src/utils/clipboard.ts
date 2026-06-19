import type { ExcalidrawElement } from "../elements/types";

export function copyToClipboardAsJSON(elements: ExcalidrawElement[]): void {
  const json = JSON.stringify(elements);
  navigator.clipboard.writeText(json).catch(() => {});
}

export async function pasteFromClipboard(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

export function isJSONExcalidraw(text: string): boolean {
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) && data.length > 0 && data[0].type !== undefined;
  } catch {
    return false;
  }
}

export function parseExcalidrawJSON(text: string): ExcalidrawElement[] | null {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      return data as ExcalidrawElement[];
    }
    return null;
  } catch {
    return null;
  }
}
