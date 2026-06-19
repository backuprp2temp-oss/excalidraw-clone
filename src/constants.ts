import type { StrokeWidth, StrokeStyle, FillStyle, FontFamily, Arrowhead, RoundnessType } from "./elements/types";

export const APP_VERSION = "1.0.0";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 30;
export const ZOOM_STEP = 1.1;

export const GRID_SIZE = 20;
export const DEFAULT_ROUGHNESS = 1;
export const DEFAULT_OPACITY = 100;
export const DEFAULT_STROKE_WIDTH: StrokeWidth = 2;
export const DEFAULT_STROKE_COLOR = "#1e1e1e";
export const DEFAULT_BACKGROUND_COLOR = "transparent";
export const DEFAULT_STROKE_STYLE: StrokeStyle = "solid";
export const DEFAULT_FILL_STYLE: FillStyle = "none";
export const DEFAULT_FONT_FAMILY: FontFamily = 1;
export const DEFAULT_FONT_SIZE = 20;
export const DEFAULT_TEXT_ALIGN = "left" as const;
export const DEFAULT_START_ARROWHEAD: Arrowhead = "none";
export const DEFAULT_END_ARROWHEAD: Arrowhead = "arrow";
export const DEFAULT_ROUNDNESS: RoundnessType = 2;
export const DEFAULT_ROUNDNESS_VALUE = 8;

export const CANVAS_RESOLUTION = window.devicePixelRatio || 1;

export const SELECTION_COLOR = "rgba(105, 101, 219, 0.2)";
export const SELECTION_BORDER_COLOR = "#6965db";
export const HANDLE_SIZE = 8;
export const BINDING_THRESHOLD = 10;
export const SNAP_THRESHOLD = 8;

export const MAX_ELEMENTS = 2000;
export const HISTORY_LIMIT = 100;

export const EXPORT_SCALE_OPTIONS = [1, 2, 3];

export const COLORS = [
  "#1e1e1e",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#e8590c",
  "#9c36b5",
  "#c92a2a",
  "#00743e",
  "#1864ab",
  "#d9480f",
  "#862e9c",
  "#2b8a3e",
  "#3b5bdb",
  "#e67700",
  "#ae3ec9",
  "#5c940d",
  "#4263eb",
  "#f08c00",
  "#be4bdb",
  "#66d9e8",
];

export const THEME = {
  light: {
    "--color-surface": "#ffffff",
    "--color-surface-low": "#f5f5f5",
    "--color-surface-high": "#eeeeee",
    "--color-text": "#1a1a1a",
    "--color-text-muted": "#6b7280",
    "--color-accent": "#6965db",
    "--color-grid": "rgba(0,0,0,0.08)",
    "--color-selection": "rgba(105, 101, 219, 0.2)",
    "--color-handle": "#ffffff",
    "--color-handle-border": "#6965db",
    "--color-canvas-background": "#ffffff",
  },
  dark: {
    "--color-surface": "#121212",
    "--color-surface-low": "#1a1a1a",
    "--color-surface-high": "#2a2a2a",
    "--color-text": "#e0e0e0",
    "--color-text-muted": "#9ca3af",
    "--color-accent": "#8b87f5",
    "--color-grid": "rgba(255,255,255,0.08)",
    "--color-selection": "rgba(139, 135, 245, 0.2)",
    "--color-handle": "#1a1a1a",
    "--color-handle-border": "#8b87f5",
    "--color-canvas-background": "#121212",
  },
} as const;

export const FONT_FAMILIES: Record<FontFamily, string> = {
  1: '"Virgil", "Segoe Print", cursive',
  2: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
  3: '"Cascadia Code", "Fira Code", "Consolas", monospace',
};

export const KEYBOARD_SHORTCUTS: Record<string, string> = {
  v: "Selection",
  "1": "Selection",
  h: "Hand",
  "2": "Hand",
  r: "Rectangle",
  "3": "Rectangle",
  d: "Diamond",
  "4": "Diamond",
  o: "Ellipse",
  "5": "Ellipse",
  a: "Arrow",
  "6": "Arrow",
  l: "Line",
  "7": "Line",
  p: "Freehand",
  "8": "Freehand",
  t: "Text",
  "9": "Text",
  e: "Eraser",
  i: "Image",
  "0": "Image",
};
