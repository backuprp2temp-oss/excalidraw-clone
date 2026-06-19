import type { ExcalidrawElement, ActiveTool, StrokeWidth, StrokeStyle, FillStyle, FontFamily, Arrowhead } from "../elements/types";
import { GRID_SIZE, DEFAULT_STROKE_COLOR, DEFAULT_BACKGROUND_COLOR, DEFAULT_STROKE_WIDTH, DEFAULT_STROKE_STYLE, DEFAULT_FILL_STYLE, DEFAULT_ROUGHNESS, DEFAULT_OPACITY, DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_TEXT_ALIGN, DEFAULT_START_ARROWHEAD, DEFAULT_END_ARROWHEAD, DEFAULT_ROUNDNESS } from "../constants";
import type { ContextMenuItem, SelectionElement } from "../elements/types";

export type AppState = {
  activeTool: ActiveTool;
  scrollX: number;
  scrollY: number;
  zoom: { value: number };
  width: number;
  height: number;
  selectedElementIds: Record<string, true>;
  selectionElement: SelectionElement | null;
  editingElement: ExcalidrawElement | null;
  draggingElement: ExcalidrawElement | null;
  resizingElement: ExcalidrawElement | null;
  isRotating: boolean;
  theme: "light" | "dark";
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  viewModeEnabled: boolean;
  zenModeEnabled: boolean;
  showStats: boolean;
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;
  pendingImageElement: ExcalidrawElement | null;
  currentItemStrokeColor: string;
  currentItemBackgroundColor: string;
  currentItemFillStyle: FillStyle;
  currentItemStrokeWidth: StrokeWidth;
  currentItemStrokeStyle: StrokeStyle;
  currentItemRoughness: number;
  currentItemOpacity: number;
  currentItemFontFamily: FontFamily;
  currentItemFontSize: number;
  currentItemTextAlign: string;
  currentItemStartArrowhead: Arrowhead;
  currentItemEndArrowhead: Arrowhead;
  currentItemRoundness: RoundnessType;
  name: string;
  isDirty: boolean;
  resizingPoint: number | null;
};

export type RoundnessType = 1 | 2;

export const initialAppState: AppState = {
  activeTool: { type: "selection" },
  scrollX: 0,
  scrollY: 0,
  zoom: { value: 1 },
  width: window.innerWidth,
  height: window.innerHeight,
  selectedElementIds: {},
  selectionElement: null,
  editingElement: null,
  draggingElement: null,
  resizingElement: null,
  isRotating: false,
  theme: "light",
  showGrid: false,
  gridSize: GRID_SIZE,
  snapToGrid: false,
  viewModeEnabled: false,
  zenModeEnabled: false,
  showStats: false,
  contextMenu: null,
  pendingImageElement: null,
  currentItemStrokeColor: DEFAULT_STROKE_COLOR,
  currentItemBackgroundColor: DEFAULT_BACKGROUND_COLOR,
  currentItemFillStyle: DEFAULT_FILL_STYLE,
  currentItemStrokeWidth: DEFAULT_STROKE_WIDTH,
  currentItemStrokeStyle: DEFAULT_STROKE_STYLE,
  currentItemRoughness: DEFAULT_ROUGHNESS,
  currentItemOpacity: DEFAULT_OPACITY,
  currentItemFontFamily: DEFAULT_FONT_FAMILY,
  currentItemFontSize: DEFAULT_FONT_SIZE,
  currentItemTextAlign: DEFAULT_TEXT_ALIGN,
  currentItemStartArrowhead: DEFAULT_START_ARROWHEAD,
  currentItemEndArrowhead: DEFAULT_END_ARROWHEAD,
  currentItemRoundness: DEFAULT_ROUNDNESS,
  name: "Untitled",
  isDirty: false,
  resizingPoint: null,
};
