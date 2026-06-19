import rough from "roughjs";
import type { ExcalidrawElement, ExcalidrawArrowElement, ExcalidrawLineElement, ExcalidrawFreeDrawElement, ExcalidrawTextElement, ExcalidrawImageElement, Point } from "../elements/types";
import type { AppState } from "../store/appState";
import { getElementAABB, getElementCenter } from "./geometry";
import { FONT_FAMILIES, HANDLE_SIZE } from "../constants";
import { getStroke } from "perfect-freehand";

const roughShapeCache = new Map<string, any>();

function getRoughShape(rc: any, el: ExcalidrawElement): any {
  const key = `${el.seed}-${el.roughness}-${el.strokeStyle}-${el.fillStyle}-${el.width}-${el.height}`;
  if (roughShapeCache.has(key)) return roughShapeCache.get(key);

  const options: any = {
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    seed: el.seed,
    strokeLineCap: "round",
    strokeLineJoin: "round",
  };

  if (el.strokeStyle === "dashed") options.strokeLineDash = [8, 8];
  else if (el.strokeStyle === "dotted") options.strokeLineDash = [2, 4];

  if (el.fillStyle !== "none") {
    options.fill = el.backgroundColor === "transparent" ? el.strokeColor : el.backgroundColor;
    if (el.fillStyle === "solid") options.fillStyle = "solid";
    else if (el.fillStyle === "hatch") options.fillStyle = "hachure";
    else if (el.fillStyle === "cross-hatch") options.fillStyle = "cross-hatch";
    else if (el.fillStyle === "zigzag") options.fillStyle = "zigzag";
  }

  let shape: any;
  const gen = rc.generator;
  switch (el.type) {
    case "rectangle": {
      const radius = el.roundness?.type === 2 ? el.roundness.value : 0;
      shape = gen.rectangle(0, 0, el.width, el.height, { ...options, borderRadius: radius });
      break;
    }
    case "ellipse":
      shape = gen.ellipse(el.width / 2, el.height / 2, el.width, el.height, options);
      break;
    case "diamond":
      shape = gen.polygon(
        [[el.width / 2, 0], [el.width, el.height / 2], [el.width / 2, el.height], [0, el.height / 2]],
        options
      );
      break;
    default:
      shape = gen.rectangle(0, 0, el.width, el.height, options);
  }

  roughShapeCache.set(key, shape);
  return shape;
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  elements: ExcalidrawElement[],
  appState: AppState,
  rc: any
) {
  const { scrollX, scrollY, zoom, width, height } = appState;
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, width * dpr, height * dpr);
  ctx.fillStyle = appState.theme === "dark" ? "#121212" : "#ffffff";
  ctx.fillRect(0, 0, width * dpr, height * dpr);

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.translate(scrollX, scrollY);
  ctx.scale(zoom.value, zoom.value);

  if (appState.showGrid) renderGrid(ctx, appState);

  const viewMinX = -scrollX / zoom.value;
  const viewMinY = -scrollY / zoom.value;
  const viewMaxX = viewMinX + width / zoom.value;
  const viewMaxY = viewMinY + height / zoom.value;

  for (const el of elements) {
    const bounds = getElementAABB(el);
    if (bounds.maxX < viewMinX - 100 || bounds.minX > viewMaxX + 100 || bounds.maxY < viewMinY - 100 || bounds.minY > viewMaxY + 100) continue;
    try {
      renderElement(ctx, el, rc, appState);
    } catch (err) {
      console.error("Failed to render element:", el, err);
    }
  }

  if (appState.selectionElement) {
    const sel = appState.selectionElement;
    ctx.strokeStyle = "#6965db";
    ctx.lineWidth = 1 / zoom.value;
    ctx.fillStyle = "rgba(105, 101, 219, 0.1)";
    ctx.setLineDash([4 / zoom.value, 4 / zoom.value]);
    ctx.fillRect(sel.x, sel.y, sel.width, sel.height);
    ctx.strokeRect(sel.x, sel.y, sel.width, sel.height);
    ctx.setLineDash([]);
  }

  try {
    renderSelectionHandles(ctx, elements, appState);
  } catch (err) {
    console.error("Failed to render selection handles:", err);
  }
  ctx.restore();
}

function renderGrid(ctx: CanvasRenderingContext2D, appState: AppState) {
  const { scrollX, scrollY, zoom, width, height, gridSize } = appState;
  const startX = Math.floor(-scrollX / zoom.value / gridSize) * gridSize;
  const startY = Math.floor(-scrollY / zoom.value / gridSize) * gridSize;
  const endX = startX + width / zoom.value + gridSize * 2;
  const endY = startY + height / zoom.value + gridSize * 2;

  ctx.strokeStyle = appState.theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1 / zoom.value;
  ctx.beginPath();
  for (let x = startX; x <= endX; x += gridSize) { ctx.moveTo(x, startY); ctx.lineTo(x, endY); }
  for (let y = startY; y <= endY; y += gridSize) { ctx.moveTo(startX, y); ctx.lineTo(endX, y); }
  ctx.stroke();
}

function renderElement(ctx: CanvasRenderingContext2D, el: ExcalidrawElement, rc: any, appState: AppState) {
  ctx.save();
  ctx.globalAlpha = el.opacity / 100;

  if (el.angle !== 0) {
    const center = getElementCenter(el);
    ctx.translate(center[0], center[1]);
    ctx.rotate(el.angle);
    ctx.translate(-center[0], -center[1]);
  }

  switch (el.type) {
    case "rectangle":
    case "frame": renderRectangle(ctx, el, rc); break;
    case "ellipse": renderEllipse(ctx, el, rc); break;
    case "diamond": renderDiamond(ctx, el, rc); break;
    case "arrow": renderArrow(ctx, el as ExcalidrawArrowElement, rc); break;
    case "line": renderLine(ctx, el as ExcalidrawLineElement, rc); break;
    case "freedraw": renderFreehand(ctx, el as ExcalidrawFreeDrawElement); break;
    case "text": renderText(ctx, el as ExcalidrawTextElement); break;
    case "image": break;
  }
  ctx.restore();
}

function renderRectangle(ctx: CanvasRenderingContext2D, el: ExcalidrawElement, rc: any) {
  if (el.roughness === 0) {
    ctx.beginPath();
    const r = el.roundness?.type === 2 ? el.roundness.value : 0;
    if (r > 0) roundRect(ctx, el.x, el.y, el.width, el.height, r);
    else ctx.rect(el.x, el.y, el.width, el.height);
    if (el.fillStyle !== "none") {
      ctx.fillStyle = el.backgroundColor === "transparent" ? el.strokeColor : el.backgroundColor;
      ctx.fill();
    }
    ctx.strokeStyle = el.strokeColor;
    ctx.lineWidth = el.strokeWidth;
    if (el.strokeStyle === "dashed") ctx.setLineDash([8, 8]);
    else if (el.strokeStyle === "dotted") ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    const shape = getRoughShape(rc, el);
    ctx.save();
    ctx.translate(el.x, el.y);
    rc.draw(shape);
    ctx.restore();
  }
  if (el.type === "frame") {
    ctx.fillStyle = el.strokeColor;
    ctx.font = "14px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText((el as any).name || "Frame", el.x + 8, el.y + 8);
  }
}

function renderEllipse(ctx: CanvasRenderingContext2D, el: ExcalidrawElement, rc: any) {
  if (el.roughness === 0) {
    ctx.beginPath();
    ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
    if (el.fillStyle !== "none") {
      ctx.fillStyle = el.backgroundColor === "transparent" ? el.strokeColor : el.backgroundColor;
      ctx.fill();
    }
    ctx.strokeStyle = el.strokeColor;
    ctx.lineWidth = el.strokeWidth;
    if (el.strokeStyle === "dashed") ctx.setLineDash([8, 8]);
    else if (el.strokeStyle === "dotted") ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    const shape = getRoughShape(rc, el);
    ctx.save();
    ctx.translate(el.x, el.y);
    rc.draw(shape);
    ctx.restore();
  }
}

function renderDiamond(ctx: CanvasRenderingContext2D, el: ExcalidrawElement, rc: any) {
  if (el.roughness === 0) {
    ctx.beginPath();
    ctx.moveTo(el.x + el.width / 2, el.y);
    ctx.lineTo(el.x + el.width, el.y + el.height / 2);
    ctx.lineTo(el.x + el.width / 2, el.y + el.height);
    ctx.lineTo(el.x, el.y + el.height / 2);
    ctx.closePath();
    if (el.fillStyle !== "none") {
      ctx.fillStyle = el.backgroundColor === "transparent" ? el.strokeColor : el.backgroundColor;
      ctx.fill();
    }
    ctx.strokeStyle = el.strokeColor;
    ctx.lineWidth = el.strokeWidth;
    if (el.strokeStyle === "dashed") ctx.setLineDash([8, 8]);
    else if (el.strokeStyle === "dotted") ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    const shape = getRoughShape(rc, el);
    ctx.save();
    ctx.translate(el.x, el.y);
    rc.draw(shape);
    ctx.restore();
  }
}

function renderArrow(ctx: CanvasRenderingContext2D, el: ExcalidrawArrowElement, rc: any) {
  if (!el.points || el.points.length < 2) return;
  const points = el.points;

  for (let i = 1; i < points.length; i++) {
    const x1 = el.x + points[i - 1][0], y1 = el.y + points[i - 1][1];
    const x2 = el.x + points[i][0], y2 = el.y + points[i][1];
    if (x1 === x2 && y1 === y2) continue;
    if (el.roughness > 0) {
      try {
        const line = rc.generator.line(x1, y1, x2, y2, { stroke: el.strokeColor, strokeWidth: el.strokeWidth, roughness: el.roughness, seed: el.seed + i });
        rc.draw(line);
      } catch {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.stroke();
    }
  }

  if (el.endArrowhead !== "none" && points.length >= 2) {
    const last = points[points.length - 1], prev = points[points.length - 2];
    renderArrowhead(ctx, el.x + prev[0], el.y + prev[1], el.x + last[0], el.y + last[1], el.endArrowhead, el.strokeColor, el.strokeWidth);
  }
  if (el.startArrowhead !== "none" && points.length >= 2) {
    const first = points[0], second = points[1];
    renderArrowhead(ctx, el.x + second[0], el.y + second[1], el.x + first[0], el.y + first[1], el.startArrowhead, el.strokeColor, el.strokeWidth);
  }
}

function renderArrowhead(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, type: string, color: string, strokeWidth: number) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const size = 10 + strokeWidth * 2;
  ctx.save();
  ctx.translate(toX, toY);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;

  switch (type) {
    case "arrow":
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(-size, -size / 3);
      ctx.moveTo(0, 0); ctx.lineTo(-size, size / 3);
      ctx.stroke(); break;
    case "bar":
      ctx.beginPath(); ctx.moveTo(0, -size / 2); ctx.lineTo(0, size / 2); ctx.stroke(); break;
    case "dot":
      ctx.beginPath(); ctx.arc(0, 0, size / 3, 0, Math.PI * 2); ctx.fill(); break;
    case "triangle":
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, -size / 2.5); ctx.lineTo(-size, size / 2.5); ctx.closePath(); ctx.fill(); break;
    case "circle":
      ctx.beginPath(); ctx.arc(-size / 2, 0, size / 2.5, 0, Math.PI * 2); ctx.fill(); break;
  }
  ctx.restore();
}

function renderLine(ctx: CanvasRenderingContext2D, el: ExcalidrawLineElement, rc: any) {
  if (!el.points || el.points.length < 2) return;
  for (let i = 1; i < el.points.length; i++) {
    const x1 = el.x + el.points[i - 1][0], y1 = el.y + el.points[i - 1][1];
    const x2 = el.x + el.points[i][0], y2 = el.y + el.points[i][1];
    if (x1 === x2 && y1 === y2) continue;
    if (el.roughness > 0) {
      try {
        const line = rc.generator.line(x1, y1, x2, y2, { stroke: el.strokeColor, strokeWidth: el.strokeWidth, roughness: el.roughness, seed: el.seed + i });
        rc.draw(line);
      } catch {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      if (el.strokeStyle === "dashed") ctx.setLineDash([8, 8]);
      else if (el.strokeStyle === "dotted") ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

function renderFreehand(ctx: CanvasRenderingContext2D, el: ExcalidrawFreeDrawElement) {
  if (!el.points || el.points.length < 2) return;
  const outlinePoints = getStroke(el.points, {
    size: el.strokeWidth * 2,
    thinning: 0.5,
    smoothing: 0.5,
    simulatePressure: el.simulatePressure,
  });
  if (outlinePoints.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(el.x + outlinePoints[0][0], el.y + outlinePoints[0][1]);
  for (let i = 1; i < outlinePoints.length; i++) {
    ctx.lineTo(el.x + outlinePoints[i][0], el.y + outlinePoints[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = el.strokeColor;
  ctx.fill();
}

function renderText(ctx: CanvasRenderingContext2D, el: ExcalidrawTextElement) {
  if (!el.text) return;
  const fontFamily = FONT_FAMILIES[el.fontFamily];
  ctx.font = `${el.fontSize}px ${fontFamily}`;
  ctx.fillStyle = el.strokeColor;
  ctx.textBaseline = "top";
  const lines = el.text.split("\n");
  const lineHeight = el.fontSize * el.lineHeight;
  for (let i = 0; i < lines.length; i++) {
    let x = el.x;
    if (el.textAlign === "center") { ctx.textAlign = "center"; x = el.x + el.width / 2; }
    else if (el.textAlign === "right") { ctx.textAlign = "right"; x = el.x + el.width; }
    else ctx.textAlign = "left";
    ctx.fillText(lines[i], x, el.y + i * lineHeight);
  }
}

function renderSelectionHandles(ctx: CanvasRenderingContext2D, elements: ExcalidrawElement[], appState: AppState) {
  const { selectedElementIds, zoom } = appState;
  const selectedIds = Object.keys(selectedElementIds);
  if (selectedIds.length === 0) return;
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
  if (selectedElements.length === 0) return;

  const handleSize = HANDLE_SIZE / zoom.value;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of selectedElements) {
    const bounds = getElementAABB(el);
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  }

  const padding = 4 / zoom.value;
  minX -= padding; minY -= padding; maxX += padding; maxY += padding;

  ctx.strokeStyle = "#6965db";
  ctx.lineWidth = 1.5 / zoom.value;
  ctx.setLineDash([4 / zoom.value, 4 / zoom.value]);
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  ctx.setLineDash([]);

  const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
  const handles = [
    { x: minX, y: minY }, { x: midX, y: minY }, { x: maxX, y: minY },
    { x: maxX, y: midY }, { x: maxX, y: maxY }, { x: midX, y: maxY },
    { x: minX, y: maxY }, { x: minX, y: midY },
  ];

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#6965db";
  ctx.lineWidth = 1.5 / zoom.value;
  for (const handle of handles) {
    ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
  }

  // Rotation handle
  const rotY = minY - 30 / zoom.value;
  ctx.beginPath(); ctx.moveTo(midX, minY); ctx.lineTo(midX, rotY);
  ctx.strokeStyle = "#6965db"; ctx.lineWidth = 1 / zoom.value; ctx.stroke();
  ctx.beginPath(); ctx.arc(midX, rotY, handleSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.strokeStyle = "#6965db"; ctx.stroke();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function clearRoughCache() {
  roughShapeCache.clear();
}
