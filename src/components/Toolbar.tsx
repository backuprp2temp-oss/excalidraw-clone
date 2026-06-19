import React from "react";
import { useStore } from "../store/appStore";
import type { ActiveTool } from "../elements/types";

const toolItems: { type: ActiveTool["type"]; label: string; shortcut: string; icon: string }[] = [
  { type: "selection", label: "Selection", shortcut: "V", icon: "cursor" },
  { type: "hand", label: "Hand", shortcut: "H", icon: "hand" },
  { type: "rectangle", label: "Rectangle", shortcut: "R", icon: "rect" },
  { type: "diamond", label: "Diamond", shortcut: "D", icon: "diamond" },
  { type: "ellipse", label: "Ellipse", shortcut: "O", icon: "circle" },
  { type: "arrow", label: "Arrow", shortcut: "A", icon: "arrow" },
  { type: "line", label: "Line", shortcut: "L", icon: "line" },
  { type: "freedraw", label: "Pencil", shortcut: "P", icon: "pencil" },
  { type: "text", label: "Text", shortcut: "T", icon: "text" },
  { type: "image", label: "Image", shortcut: "I", icon: "image" },
  { type: "eraser", label: "Eraser", shortcut: "E", icon: "eraser" },
];

function ToolIcon({ icon }: { icon: string }) {
  const size = 20;
  switch (icon) {
    case "cursor":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        </svg>
      );
    case "hand":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v6M10 10V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-2a2 2 0 0 0-4 0" />
        </svg>
      );
    case "rect":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
    case "diamond":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l10 10-10 10L2 12z" />
        </svg>
      );
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "arrow":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case "line":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="19" x2="19" y2="5" />
        </svg>
      );
    case "pencil":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      );
    case "text":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      );
    case "image":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    case "eraser":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 20H7L3 16l9-9 8 8-4 4" />
          <path d="M6 11l8 8" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Toolbar() {
  const activeTool = useStore((s) => s.appState.activeTool);
  const setActiveTool = useStore((s) => s.setActiveTool);

  return (
    <div
      style={{
        position: "absolute",
        left: 8,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 4,
        background: "var(--color-surface)",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        zIndex: 100,
      }}
    >
      {toolItems.map((item) => {
        const isActive = activeTool.type === item.type;
        return (
          <button
            key={item.type}
            onClick={() => setActiveTool({ type: item.type as any })}
            title={`${item.label} (${item.shortcut})`}
            aria-label={`${item.label} tool`}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: isActive ? "var(--color-accent)" : "transparent",
              color: isActive ? "#fff" : "var(--color-text)",
              borderRadius: 6,
              cursor: "pointer",
              transition: "background 0.1s",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = "var(--color-surface-high)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            <ToolIcon icon={item.icon} />
          </button>
        );
      })}
    </div>
  );
}
