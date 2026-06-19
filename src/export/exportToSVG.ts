import type { ExcalidrawElement, ExcalidrawTextElement } from "../elements/types";
import type { AppState } from "../store/appState";
import { FONT_FAMILIES } from "../constants";

export function exportToSVG(
  elements: ExcalidrawElement[],
  appState: AppState
): string {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }

  if (elements.length === 0) {
    minX = 0; minY = 0; maxX = 100; maxY = 100;
  }

  const padding = 10;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;

  // Background
  if (appState.theme === "dark") {
    svg += `<rect width="${width}" height="${height}" fill="#121212"/>\n`;
  }

  for (const el of elements) {
    svg += renderElementSVG(el, minX + padding, minY + padding);
  }

  svg += "</svg>";
  return svg;
}

function renderElementSVG(
  el: ExcalidrawElement,
  offsetX: number,
  offsetY: number
): string {
  const x = el.x - offsetX;
  const y = el.y - offsetY;
  const opacity = el.opacity / 100;
  const transform = el.angle !== 0
    ? ` transform="rotate(${(el.angle * 180) / Math.PI} ${x + el.width / 2} ${y + el.height / 2})"`
    : "";

  let strokeDash = "";
  if (el.strokeStyle === "dashed") strokeDash = ` stroke-dasharray="8 8"`;
  else if (el.strokeStyle === "dotted") strokeDash = ` stroke-dasharray="2 4"`;

  const attrs = `stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="none" opacity="${opacity}"${strokeDash}`;

  switch (el.type) {
    case "rectangle":
    case "frame": {
      const r = el.roundness?.type === 2 ? el.roundness.value : 0;
      let fill = "";
      if (el.fillStyle !== "none") {
        const fillColor = el.backgroundColor === "transparent" ? el.strokeColor : el.backgroundColor;
        fill = ` fill="${fillColor}"`;
      }
      if (r > 0) {
        return `<rect x="${x}" y="${y}" width="${el.width}" height="${el.height}" rx="${r}" ${attrs}${fill}${transform}/>\n`;
      }
      return `<rect x="${x}" y="${y}" width="${el.width}" height="${el.height}" ${attrs}${fill}${transform}/>\n`;
    }
    case "ellipse": {
      let fill = "";
      if (el.fillStyle !== "none") {
        const fillColor = el.backgroundColor === "transparent" ? el.strokeColor : el.backgroundColor;
        fill = ` fill="${fillColor}"`;
      }
      return `<ellipse cx="${x + el.width / 2}" cy="${y + el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" ${attrs}${fill}${transform}/>\n`;
    }
    case "diamond": {
      const points = `${x + el.width / 2},${y} ${x + el.width},${y + el.height / 2} ${x + el.width / 2},${y + el.height} ${x},${y + el.height / 2}`;
      let fill = "";
      if (el.fillStyle !== "none") {
        const fillColor = el.backgroundColor === "transparent" ? el.strokeColor : el.backgroundColor;
        fill = ` fill="${fillColor}"`;
      }
      return `<polygon points="${points}" ${attrs}${fill}${transform}/>\n`;
    }
    case "arrow":
    case "line": {
      const points = (el as any).points;
      if (!points || points.length < 2) return "";
      let d = `M${x + points[0][0]},${y + points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L${x + points[i][0]},${y + points[i][1]}`;
      }
      let svg = `<path d="${d}" ${attrs}${transform}/>\n`;
      if (el.type === "arrow") {
        const arrowEl = el as any;
        if (arrowEl.endArrowhead !== "none" && points.length >= 2) {
          const last = points[points.length - 1];
          const prev = points[points.length - 2];
          const endX = x + last[0];
          const endY = y + last[1];
          const angle = Math.atan2(endY - (y + prev[1]), endX - (x + prev[0]));
          const size = 10;
          const a1x = endX - size * Math.cos(angle - 0.3);
          const a1y = endY - size * Math.sin(angle - 0.3);
          const a2x = endX - size * Math.cos(angle + 0.3);
          const a2y = endY - size * Math.sin(angle + 0.3);
          svg += `<path d="M${endX},${endY} L${a1x},${a1y} M${endX},${endY} L${a2x},${a2y}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="none"${transform}/>\n`;
        }
      }
      return svg;
    }
    case "freedraw": {
      const points = (el as any).points;
      if (!points || points.length < 2) return "";
      let d = `M${x + points[0][0]},${y + points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L${x + points[i][0]},${y + points[i][1]}`;
      }
      return `<path d="${d}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth * 2}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${el.opacity / 100}"${transform}/>\n`;
    }
    case "text": {
      const textEl = el as ExcalidrawTextElement;
      const fontFamily = FONT_FAMILIES[textEl.fontFamily];
      const lines = textEl.text.split("\n");
      let svgText = "";
      for (let i = 0; i < lines.length; i++) {
        const ly = y + (i + 1) * textEl.fontSize * textEl.lineHeight;
        svgText += `<text x="${x}" y="${ly}" font-size="${textEl.fontSize}" font-family="${fontFamily}" fill="${textEl.strokeColor}" opacity="${el.opacity / 100}"${transform}>${escapeXml(lines[i])}</text>\n`;
      }
      return svgText;
    }
    default:
      return "";
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function downloadSVG(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
