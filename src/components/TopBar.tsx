import React, { useState } from "react";
import { useStore } from "../store/appStore";
import { useLibraryStore } from "../store/libraryStore";
import { exportToPNG, downloadBlob } from "../export/exportToPNG";
import { exportToSVG, downloadSVG } from "../export/exportToSVG";
import { exportToJSON, downloadJSON } from "../export/exportToJSON";

export default function TopBar() {
  const appState = useStore((s) => s.appState);
  const setAppState = useStore((s) => s.setAppState);
  const elements = useStore((s) => s.elements);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s.canUndo);
  const canRedo = useStore((s) => s.canRedo);
  const saveToFile = useStore((s) => s.saveToFile);
  const [showMenu, setShowMenu] = useState(false);

  const handleZoomIn = () => {
    const newZoom = Math.min(30, appState.zoom.value * 1.2);
    setAppState({ zoom: { value: newZoom } });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, appState.zoom.value / 1.2);
    setAppState({ zoom: { value: newZoom } });
  };

  const handleResetZoom = () => {
    setAppState({ zoom: { value: 1 } });
  };

  const handleExportPNG = async () => {
    const blob = await exportToPNG(elements, appState, {
      exportBackground: true,
      exportWithDarkMode: appState.theme === "dark",
      exportScale: 2,
      exportPadding: 10,
    });
    downloadBlob(blob, `${appState.name || "Untitled"}.png`);
    setShowMenu(false);
  };

  const handleExportSVG = () => {
    const svg = exportToSVG(elements, appState);
    downloadSVG(svg, `${appState.name || "Untitled"}.svg`);
    setShowMenu(false);
  };

  const handleExportJSON = () => {
    const json = exportToJSON(elements, appState, useStore.getState().fileStore);
    downloadJSON(json, `${appState.name || "Untitled"}.excalidraw`);
    setShowMenu(false);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept=".excalidraw,.json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        useStore.getState().loadFromFile(text);
      };
      reader.readAsText(file);
    };
    input.click();
    setShowMenu(false);
  };

  const handleNew = () => {
    if (confirm("Create a new canvas? Unsaved changes will be lost.")) {
      useStore.getState().resetStore();
    }
    setShowMenu(false);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-surface-high)",
        zIndex: 100,
        userSelect: "none",
      }}
    >
      {/* Left section */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Hamburger menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: 32,
              height: 32,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              color: "var(--color-text)",
            }}
            aria-label="File menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: 40,
                left: 0,
                background: "var(--color-surface)",
                border: "1px solid var(--color-surface-high)",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: 200,
                padding: 4,
                zIndex: 200,
              }}
            >
              <MenuItem label="New" shortcut="" onClick={handleNew} />
              <MenuItem label="Open..." shortcut="" onClick={handleImport} />
              <MenuItem label="Save as .excalidraw" shortcut="Ctrl+S" onClick={() => { saveToFile(); setShowMenu(false); }} />
              <MenuSeparator />
              <MenuItem label="Export as PNG" shortcut="" onClick={handleExportPNG} />
              <MenuItem label="Export as SVG" shortcut="" onClick={handleExportSVG} />
              <MenuItem label="Export as JSON" shortcut="" onClick={handleExportJSON} />
            </div>
          )}
        </div>

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          style={{
            width: 32,
            height: 32,
            border: "none",
            background: "transparent",
            cursor: canUndo() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            color: canUndo() ? "var(--color-text)" : "var(--color-text-muted)",
            opacity: canUndo() ? 1 : 0.5,
          }}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          style={{
            width: 32,
            height: 32,
            border: "none",
            background: "transparent",
            cursor: canRedo() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            color: canRedo() ? "var(--color-text)" : "var(--color-text-muted)",
            opacity: canRedo() ? 1 : 0.5,
          }}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
          </svg>
        </button>

        {/* Title */}
        <input
          type="text"
          value={appState.name}
          onChange={(e) => setAppState({ name: e.target.value })}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text)",
            outline: "none",
            padding: "4px 8px",
            borderRadius: 4,
            width: 150,
          }}
          aria-label="Canvas title"
        />
      </div>

      {/* Right section */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Zoom controls */}
        <button
          onClick={handleZoomOut}
          style={zoomButtonStyle}
          title="Zoom out"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={handleResetZoom}
          style={{ ...zoomButtonStyle, minWidth: 50 }}
          title="Reset zoom"
          aria-label="Zoom level"
        >
          {Math.round(appState.zoom.value * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          style={zoomButtonStyle}
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setAppState({ theme: appState.theme === "dark" ? "light" : "dark" })}
          style={iconButtonStyle}
          title={`Switch to ${appState.theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {appState.theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Grid toggle */}
        <button
          onClick={() => setAppState({ showGrid: !appState.showGrid })}
          style={{
            ...iconButtonStyle,
            background: appState.showGrid ? "var(--color-accent)" : "transparent",
            color: appState.showGrid ? "#fff" : "var(--color-text)",
          }}
          title="Toggle grid"
          aria-label="Toggle grid"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </button>

        {/* Stats toggle */}
        <button
          onClick={() => setAppState({ showStats: !appState.showStats })}
          style={{
            ...iconButtonStyle,
            background: appState.showStats ? "var(--color-accent)" : "transparent",
            color: appState.showStats ? "#fff" : "var(--color-text)",
          }}
          title="Toggle stats"
          aria-label="Toggle stats"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function MenuItem({ label, shortcut, onClick }: { label: string; shortcut: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "8px 12px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        borderRadius: 4,
        fontSize: 13,
        color: "var(--color-text)",
        textAlign: "left",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-high)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span>{label}</span>
      {shortcut && <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{shortcut}</span>}
    </button>
  );
}

function MenuSeparator() {
  return <div style={{ height: 1, background: "var(--color-surface-high)", margin: "4px 0" }} />;
}

const zoomButtonStyle: React.CSSProperties = {
  height: 28,
  minWidth: 28,
  padding: "0 8px",
  border: "none",
  background: "var(--color-surface-high)",
  borderRadius: 6,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  color: "var(--color-text)",
};

const iconButtonStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  color: "var(--color-text)",
};
