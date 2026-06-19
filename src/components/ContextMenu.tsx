import React from "react";
import { useStore } from "../store/appStore";

export default function ContextMenu() {
  const contextMenu = useStore((s) => s.appState.contextMenu);

  if (!contextMenu) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: contextMenu.x,
        top: contextMenu.y,
        background: "var(--color-surface)",
        border: "1px solid var(--color-surface-high)",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        minWidth: 180,
        padding: 4,
        zIndex: 300,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {contextMenu.items.map((item, i) => {
        if (item.separator) {
          return <div key={i} style={{ height: 1, background: "var(--color-surface-high)", margin: "4px 0" }} />;
        }
        return (
          <button
            key={i}
            onClick={item.action}
            disabled={item.disabled}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "8px 12px",
              border: "none",
              background: "transparent",
              cursor: item.disabled ? "not-allowed" : "pointer",
              borderRadius: 4,
              fontSize: 13,
              color: item.disabled ? "var(--color-text-muted)" : "var(--color-text)",
              textAlign: "left",
              opacity: item.disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) e.currentTarget.style.background = "var(--color-surface-high)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span style={{ color: "var(--color-text-muted)", fontSize: 12, marginLeft: 20 }}>
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
