import type { Point } from "../elements/types";

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function distanceBetweenPointAndSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;

  let xx: number, yy: number;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return distance(px, py, xx, yy);
}

export function rotatePoint(
  point: Point,
  center: Point,
  angle: number
): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point[0] - center[0];
  const dy = point[1] - center[1];
  return [
    center[0] + dx * cos - dy * sin,
    center[1] + dx * sin + dy * cos,
  ];
}

export function getElementCenter(el: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Point {
  return [el.x + el.width / 2, el.y + el.height / 2];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function getBoundingBox(elements: { x: number; y: number; width: number; height: number }[]) {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function isPointInsideRectangle(
  px: number,
  py: number,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number = 0
): boolean {
  if (angle !== 0) {
    const center: Point = [x + width / 2, y + height / 2];
    const rotated = rotatePoint([px, py], center, -angle);
    px = rotated[0];
    py = rotated[1];
  }
  return px >= x && px <= x + width && py >= y && py <= y + height;
}

export function isPointInsideEllipse(
  px: number,
  py: number,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number = 0
): boolean {
  if (angle !== 0) {
    const center: Point = [x + width / 2, y + height / 2];
    const rotated = rotatePoint([px, py], center, -angle);
    px = rotated[0];
    py = rotated[1];
  }
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;
  if (rx === 0 || ry === 0) return false;
  return ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1;
}

export function isPointInsideDiamond(
  px: number,
  py: number,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number = 0
): boolean {
  if (angle !== 0) {
    const center: Point = [x + width / 2, y + height / 2];
    const rotated = rotatePoint([px, py], center, -angle);
    px = rotated[0];
    py = rotated[1];
  }
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;
  if (rx === 0 || ry === 0) return false;
  return Math.abs(px - cx) / rx + Math.abs(py - cy) / ry <= 1;
}

export function getResizeOffset(
  handle: string,
  dx: number,
  dy: number,
  width: number,
  height: number
): { x: number; y: number; w: number; h: number } {
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;

  if (handle.includes("w")) {
    x = dx;
    w = width - dx;
  }
  if (handle.includes("e")) {
    w = width + dx;
  }
  if (handle.includes("n")) {
    y = dy;
    h = height - dy;
  }
  if (handle.includes("s")) {
    h = height + dy;
  }

  return { x, y, w, h };
}

export function pointInPolygon(px: number, py: number, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getLinearElementLength(points: Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]);
  }
  return length;
}

export function mod(m: number, n: number): number {
  return ((m % n) + n) % n;
}
