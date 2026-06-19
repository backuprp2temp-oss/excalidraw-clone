import type { ExcalidrawElement, Point } from "../elements/types";
import { rotatePoint, distanceBetweenPointAndSegment } from "../utils/math";

export function getElementBounds(el: ExcalidrawElement): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return { x: el.x, y: el.y, width: el.width, height: el.height };
}

export function getElementCenter(el: ExcalidrawElement): Point {
  return [el.x + el.width / 2, el.y + el.height / 2];
}

export function getElementCornerPoints(el: ExcalidrawElement): Point[] {
  const { x, y, width, height } = el;
  const center: Point = [x + width / 2, y + height / 2];
  const corners: Point[] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];

  if (el.angle !== 0) {
    return corners.map((c) => rotatePoint(c, center, el.angle));
  }
  return corners;
}

export function getElementAABB(el: ExcalidrawElement): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (el.type === "arrow" || el.type === "line" || el.type === "freedraw") {
    const points = (el as any).points as Point[];
    if (!points || points.length === 0) {
      return { minX: el.x, minY: el.y, maxX: el.x + el.width, maxY: el.y + el.height };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, el.x + p[0]);
      minY = Math.min(minY, el.y + p[1]);
      maxX = Math.max(maxX, el.x + p[0]);
      maxY = Math.max(maxY, el.y + p[1]);
    }
    return { minX, minY, maxX, maxY };
  }

  const corners = getElementCornerPoints(el);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const c of corners) {
    minX = Math.min(minX, c[0]);
    minY = Math.min(minY, c[1]);
    maxX = Math.max(maxX, c[0]);
    maxY = Math.max(maxY, c[1]);
  }
  return { minX, minY, maxX, maxY };
}

export function elementsIntersectRect(
  el: ExcalidrawElement,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  const bounds = getElementAABB(el);
  return !(bounds.minX > rx + rw || bounds.maxX < rx || bounds.minY > ry + rh || bounds.maxY < ry);
}

export function getArrowEndpointPosition(
  el: ExcalidrawElement,
  point: Point,
  allElements: ExcalidrawElement[]
): { x: number; y: number } | null {
  const BINDING_DISTANCE = 15;
  for (const target of allElements) {
    if (target.id === el.id) continue;
    if (target.type === "arrow" || target.type === "line" || target.type === "freedraw") continue;

    const bounds = getElementAABB(target);
    const dist = pointToAABBDistance(point[0], point[1], bounds);

    if (dist < BINDING_DISTANCE) {
      const center: Point = [
        (bounds.minX + bounds.maxX) / 2,
        (bounds.minY + bounds.maxY) / 2,
      ];
      return {
        focus: (point[0] - center[0]) / (target.width / 2),
        elementId: target.id,
        x: point[0],
        y: point[1],
      } as any;
    }
  }
  return null;
}

function pointToAABBDistance(
  px: number,
  py: number,
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
): number {
  const dx = Math.max(bounds.minX - px, 0, px - bounds.maxX);
  const dy = Math.max(bounds.minY - py, 0, py - bounds.maxY);
  return Math.sqrt(dx * dx + dy * dy);
}

export function getResizeHandle(
  el: ExcalidrawElement,
  px: number,
  py: number,
  zoom: number
): string | null {
  const HANDLE_SIZE = 8 / zoom;
  const bounds = getElementAABB(el);
  const { minX, minY, maxX, maxY } = bounds;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  const handles: { name: string; x: number; y: number }[] = [
    { name: "nw", x: minX, y: minY },
    { name: "n", x: midX, y: minY },
    { name: "ne", x: maxX, y: minY },
    { name: "e", x: maxX, y: midY },
    { name: "se", x: maxX, y: maxY },
    { name: "s", x: midX, y: maxY },
    { name: "sw", x: minX, y: maxY },
    { name: "w", x: minX, y: midY },
  ];

  for (const handle of handles) {
    if (
      Math.abs(px - handle.x) <= HANDLE_SIZE &&
      Math.abs(py - handle.y) <= HANDLE_SIZE
    ) {
      return handle.name;
    }
  }

  // rotation handle
  const rotY = minY - 30 / zoom;
  if (Math.abs(px - midX) <= HANDLE_SIZE && Math.abs(py - rotY) <= HANDLE_SIZE) {
    return "rotation";
  }

  return null;
}

export function getRotationFromPointer(
  el: ExcalidrawElement,
  px: number,
  py: number,
  snapToAngle: boolean = false
): number {
  const center = getElementCenter(el);
  let angle = Math.atan2(py - center[1], px - center[0]);
  if (snapToAngle) {
    const snap = Math.PI / 12; // 15 degrees
    angle = Math.round(angle / snap) * snap;
  }
  return angle;
}
