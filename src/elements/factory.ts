import { nanoid } from "nanoid";
import type {
  ExcalidrawElement,
  ExcalidrawBaseElement,
  ExcalidrawArrowElement,
  ExcalidrawLineElement,
  ExcalidrawFreeDrawElement,
  ExcalidrawTextElement,
  ExcalidrawImageElement,
  ExcalidrawFrameElement,
  ExcalidrawRectangleElement,
  ExcalidrawEllipseElement,
  ExcalidrawDiamondElement,
  ElementType,
  Point,
  StrokeWidth,
  StrokeStyle,
  FillStyle,
  FontFamily,
  Arrowhead,
  Roundness,
} from "./types";
import {
  DEFAULT_STROKE_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_STROKE_STYLE,
  DEFAULT_FILL_STYLE,
  DEFAULT_ROUGHNESS,
  DEFAULT_OPACITY,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_START_ARROWHEAD,
  DEFAULT_END_ARROWHEAD,
} from "../constants";

function createBase(
  type: ElementType,
  x: number,
  y: number,
  width: number,
  height: number,
  overrides: Partial<ExcalidrawBaseElement> = {}
): ExcalidrawBaseElement {
  return {
    id: nanoid(),
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    opacity: DEFAULT_OPACITY,
    strokeColor: DEFAULT_STROKE_COLOR,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    strokeStyle: DEFAULT_STROKE_STYLE,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    fillStyle: DEFAULT_FILL_STYLE,
    roughness: DEFAULT_ROUGHNESS,
    roundness: { type: 2, value: 8 },
    groupIds: [],
    locked: false,
    version: 1,
    seed: Math.floor(Math.random() * 2000000000),
    versionNonce: Math.floor(Math.random() * 2000000000),
    boundElements: null,
    updated: Date.now(),
    ...overrides,
  };
}

export function createElement(
  type: "rectangle",
  x: number,
  y: number,
  width: number,
  height: number,
  overrides?: Partial<ExcalidrawRectangleElement>
): ExcalidrawRectangleElement;
export function createElement(
  type: "ellipse",
  x: number,
  y: number,
  width: number,
  height: number,
  overrides?: Partial<ExcalidrawEllipseElement>
): ExcalidrawEllipseElement;
export function createElement(
  type: "diamond",
  x: number,
  y: number,
  width: number,
  height: number,
  overrides?: Partial<ExcalidrawDiamondElement>
): ExcalidrawDiamondElement;
export function createElement(
  type: "arrow",
  x: number,
  y: number,
  width: number,
  height: number,
  overrides?: Partial<ExcalidrawArrowElement>
): ExcalidrawArrowElement;
export function createElement(
  type: "line",
  x: number,
  y: number,
  width: number,
  height: number,
  overrides?: Partial<ExcalidrawLineElement>
): ExcalidrawLineElement;
export function createElement(
  type: "freedraw",
  x: number,
  y: number,
  width: number,
  height: number,
  overrides?: Partial<ExcalidrawFreeDrawElement>
): ExcalidrawFreeDrawElement;
export function createElement(
  type: "text",
  x: number,
  y: number,
  width: number,
  height: number,
  overrides?: Partial<ExcalidrawTextElement>
): ExcalidrawTextElement;
export function createElement(
  type: "image",
  x: number,
  y: number,
  width: number,
  height: number,
  overrides?: Partial<ExcalidrawImageElement>
): ExcalidrawImageElement;
export function createElement(
  type: "frame",
  x: number,
  y: number,
  width: number,
  height: number,
  overrides?: Partial<ExcalidrawFrameElement>
): ExcalidrawFrameElement;
export function createElement(
  type: ElementType,
  x: number,
  y: number,
  width: number,
  height: number,
  overrides: Partial<ExcalidrawElement> = {}
): ExcalidrawElement {
  const base = createBase(type, x, y, width, height, overrides as Partial<ExcalidrawBaseElement>);

  switch (type) {
    case "rectangle":
      return { ...base, type: "rectangle" } as ExcalidrawRectangleElement;
    case "ellipse":
      return { ...base, type: "ellipse" } as ExcalidrawEllipseElement;
    case "diamond":
      return { ...base, type: "diamond" } as ExcalidrawDiamondElement;
    case "arrow":
      return {
        ...base,
        type: "arrow",
        points: [[0, 0]],
        startArrowhead: DEFAULT_START_ARROWHEAD,
        endArrowhead: DEFAULT_END_ARROWHEAD,
        startBinding: null,
        endBinding: null,
        elbowed: false,
      } as ExcalidrawArrowElement;
    case "line":
      return {
        ...base,
        type: "line",
        points: [[0, 0]],
      } as ExcalidrawLineElement;
    case "freedraw":
      return {
        ...base,
        type: "freedraw",
        points: [[0, 0]],
        pressures: [0],
        simulatePressure: true,
      } as ExcalidrawFreeDrawElement;
    case "text":
      return {
        ...base,
        type: "text",
        text: "",
        fontSize: DEFAULT_FONT_SIZE,
        fontFamily: DEFAULT_FONT_FAMILY,
        textAlign: DEFAULT_TEXT_ALIGN,
        verticalAlign: "top",
        baseline: 0,
        lineHeight: 1.25,
        containerId: null,
      } as ExcalidrawTextElement;
    case "image":
      return {
        ...base,
        type: "image",
        fileId: "",
        status: "pending",
        scale: [1, 1],
      } as ExcalidrawImageElement;
    case "frame":
      return {
        ...base,
        type: "frame",
        name: "Frame",
      } as ExcalidrawFrameElement;
    default:
      return { ...base, type: "rectangle" } as ExcalidrawRectangleElement;
  }
}

export function duplicateElement<T extends ExcalidrawElement>(element: T): T {
  const newEl = {
    ...element,
    id: nanoid(),
    x: element.x + 10,
    y: element.y + 10,
    version: element.version + 1,
    versionNonce: Math.floor(Math.random() * 2000000000),
    seed: Math.floor(Math.random() * 2000000000),
    updated: Date.now(),
    boundElements: null,
  };

  if ("points" in element && Array.isArray((element as any).points)) {
    (newEl as any).points = [...(element as any).points.map((p: Point) => [...p] as Point)];
  }
  if ("pressures" in element && Array.isArray((element as any).pressures)) {
    (newEl as any).pressures = [...(element as any).pressures];
  }
  if ("groupIds" in element) {
    (newEl as any).groupIds = [...element.groupIds];
  }

  return newEl as T;
}
