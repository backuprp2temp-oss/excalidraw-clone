import type { ExcalidrawElement, Point } from "../elements/types";
import {
  isPointInsideRectangle,
  isPointInsideEllipse,
  isPointInsideDiamond,
  distanceBetweenPointAndSegment,
} from "../utils/math";
import { getElementAABB } from "./geometry";

export function hitTestPoint(
  elements: ExcalidrawElement[],
  px: number,
  py: number,
  zoom: number
): ExcalidrawElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.locked) continue;
    if (hitTestSingleElement(el, px, py, zoom)) return el;
  }
  return null;
}

export function hitTestSingleElement(
  el: ExcalidrawElement,
  px: number,
  py: number,
  zoom: number
): boolean {
  const threshold = Math.max(8 / zoom, 4);

  switch (el.type) {
    case "rectangle":
    case "frame":
      return isPointInsideRectangle(px, py, el.x, el.y, el.width, el.height, el.angle);
    case "ellipse":
      return isPointInsideEllipse(px, py, el.x, el.y, el.width, el.height, el.angle);
    case "diamond":
      return isPointInsideDiamond(px, py, el.x, el.y, el.width, el.height, el.angle);
    case "arrow":
    case "line":
      return hitTestLine(el as any, px, py, threshold);
    case "freedraw":
      return hitTestFreehand(el as any, px, py, threshold);
    case "text":
      return isPointInsideRectangle(px, py, el.x, el.y, el.width, el.height, el.angle);
    case "image":
      return isPointInsideRectangle(px, py, el.x, el.y, el.width, el.height, el.angle);
    default:
      return isPointInsideRectangle(px, py, (el as any).x, (el as any).y, (el as any).width, (el as any).height, (el as any).angle || 0);
  }
}

function hitTestLine(el: ExcalidrawElement, px: number, py: number, threshold: number): boolean {
  const points = (el as any).points as Point[];
  if (!points || points.length < 2) {
    return isPointInsideRectangle(px, py, el.x, el.y, el.width, el.height, el.angle);
  }

  const strokeWidth = Math.max(el.strokeWidth, 2);
  for (let i = 1; i < points.length; i++) {
    const x1 = el.x + points[i - 1][0];
    const y1 = el.y + points[i - 1][1];
    const x2 = el.x + points[i][0];
    const y2 = el.y + points[i][1];
    const dist = distanceBetweenPointAndSegment(px, py, x1, y1, x2, y2);
    if (dist <= strokeWidth + threshold) return true;
  }
  return false;
}

function hitTestFreehand(el: ExcalidrawElement, px: number, py: number, threshold: number): boolean {
  const points = (el as any).points as Point[];
  if (!points || points.length === 0) return false;

  for (let i = 1; i < points.length; i++) {
    const x1 = el.x + points[i - 1][0];
    const y1 = el.y + points[i - 1][1];
    const x2 = el.x + points[i][0];
    const y2 = el.y + points[i][1];
    const dist = distanceBetweenPointAndSegment(px, py, x1, y1, x2, y2);
    if (dist <= threshold + 4) return true;
  }
  return false;
}

export function hitTestArea(
  elements: ExcalidrawElement[],
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  requireComplete: boolean = false
): ExcalidrawElement[] {
  const results: ExcalidrawElement[] = [];
  for (const el of elements) {
    if (el.locked) continue;
    const bounds = getElementAABB(el);
    if (requireComplete) {
      if (bounds.minX >= minX && bounds.minY >= minY && bounds.maxX <= maxX && bounds.maxY <= maxY) results.push(el);
    } else {
      if (bounds.minX <= maxX && bounds.maxX >= minX && bounds.minY <= maxY && bounds.maxY >= minY) results.push(el);
    }
  }
  return results;
}
