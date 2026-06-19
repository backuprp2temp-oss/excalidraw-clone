export type ElementType =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "arrow"
  | "line"
  | "freedraw"
  | "text"
  | "image"
  | "frame";

export type Point = [number, number];

export type StrokeWidth = 1 | 2 | 4;
export type StrokeStyle = "solid" | "dashed" | "dotted";
export type FillStyle = "none" | "hatch" | "cross-hatch" | "solid" | "zigzag";
export type FontFamily = 1 | 2 | 3;
export type TextAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";
export type Arrowhead =
  | "none"
  | "arrow"
  | "bar"
  | "dot"
  | "triangle"
  | "triangle_outline"
  | "circle"
  | "circle_outline";

export type Roundness = { type: 1 } | { type: 2; value: number };

export type PointBinding = {
  elementId: string;
  focus: number;
  gap: number;
};

export type BoundElement = {
  id: string;
  type: "arrow" | "text";
};

export type ExcalidrawBaseElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  strokeColor: string;
  strokeWidth: StrokeWidth;
  strokeStyle: StrokeStyle;
  backgroundColor: string;
  fillStyle: FillStyle;
  roughness: number;
  roundness: Roundness | null;
  groupIds: string[];
  locked: boolean;
  version: number;
  seed: number;
  versionNonce: number;
  boundElements: BoundElement[] | null;
  updated: number;
};

export type ExcalidrawRectangleElement = ExcalidrawBaseElement & {
  type: "rectangle";
};

export type ExcalidrawEllipseElement = ExcalidrawBaseElement & {
  type: "ellipse";
};

export type ExcalidrawDiamondElement = ExcalidrawBaseElement & {
  type: "diamond";
};

export type ExcalidrawArrowElement = ExcalidrawBaseElement & {
  type: "arrow";
  points: Point[];
  startArrowhead: Arrowhead;
  endArrowhead: Arrowhead;
  startBinding: PointBinding | null;
  endBinding: PointBinding | null;
  elbowed: boolean;
};

export type ExcalidrawLineElement = ExcalidrawBaseElement & {
  type: "line";
  points: Point[];
};

export type ExcalidrawFreeDrawElement = ExcalidrawBaseElement & {
  type: "freedraw";
  points: Point[];
  pressures: number[];
  simulatePressure: boolean;
};

export type ExcalidrawTextElement = ExcalidrawBaseElement & {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: FontFamily;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  baseline: number;
  lineHeight: number;
  containerId: string | null;
};

export type ExcalidrawImageElement = ExcalidrawBaseElement & {
  type: "image";
  fileId: string;
  status: "pending" | "saved" | "error";
  scale: [number, number];
};

export type ExcalidrawFrameElement = ExcalidrawBaseElement & {
  type: "frame";
  name: string;
};

export type ExcalidrawElement =
  | ExcalidrawRectangleElement
  | ExcalidrawEllipseElement
  | ExcalidrawDiamondElement
  | ExcalidrawArrowElement
  | ExcalidrawLineElement
  | ExcalidrawFreeDrawElement
  | ExcalidrawTextElement
  | ExcalidrawImageElement
  | ExcalidrawFrameElement;

export type ActiveTool =
  | { type: "selection" }
  | { type: "rectangle" }
  | { type: "ellipse" }
  | { type: "diamond" }
  | { type: "arrow" }
  | { type: "line" }
  | { type: "freedraw" }
  | { type: "text" }
  | { type: "image" }
  | { type: "eraser" }
  | { type: "hand" };

export type ContextMenuItem = {
  label: string;
  shortcut?: string;
  action: () => void;
  separator?: boolean;
  disabled?: boolean;
};

export type SelectionElement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RoundnessType = 1 | 2;

export type FileData = {
  mimeType: string;
  dataURL: string;
};

export type LibraryItem = {
  id: string;
  status: "published" | "unpublished";
  elements: ExcalidrawElement[];
  created: number;
};
