import React, { useRef, useEffect, useCallback, useState } from "react";
import rough from "roughjs";
import { useStore } from "../store/appStore";
import { renderScene } from "../renderer/render";
import { SelectTool } from "../tools/SelectTool";
import { RectangleTool, EllipseTool, DiamondTool } from "../tools/ShapeTools";
import { ArrowTool } from "../tools/ArrowTool";
import { LineTool } from "../tools/LineTool";
import { PencilTool } from "../tools/PencilTool";
import { TextTool } from "../tools/TextTool";
import { EraserTool } from "../tools/EraserTool";
import { HandTool } from "../tools/HandTool";
import { ImageTool } from "../tools/ImageTool";
import type { ExcalidrawTextElement } from "../elements/types";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { FONT_FAMILIES } from "../constants";

const tools: Record<string, any> = {
  selection: SelectTool,
  hand: HandTool,
  rectangle: RectangleTool,
  diamond: DiamondTool,
  ellipse: EllipseTool,
  arrow: ArrowTool,
  line: LineTool,
  freedraw: PencilTool,
  text: TextTool,
  image: ImageTool,
  eraser: EraserTool,
};

function createScene(store: any): any {
  return {
    elements: store.elements,
    addElement: (el: any) => store.addElement(el),
    updateElement: (id: string, updates: any) => store.updateElement(id, updates),
    removeElements: (ids: string[]) => store.removeElements(ids),
    getElement: (id: string) => store.elements.find((e: any) => e.id === id),
    getElements: () => store.elements,
    setElements: (els: any[]) => store.setElements(els),
  };
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isPanningRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const spaceHeldRef = useRef(false);

  const elements = useStore((s) => s.elements);
  const appState = useStore((s) => s.appState);

  useKeyboardShortcuts();

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 1 || spaceHeldRef.current) {
      isPanningRef.current = true;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      return;
    }
    const toolType = useStore.getState().appState.activeTool.type;
    const tool = tools[toolType];
    if (!tool) return;
    const state = useStore.getState();
    const scene = createScene(state);
    tool.onPointerDown(e.nativeEvent, state.appState, scene);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - lastPanRef.current.x;
      const dy = e.clientY - lastPanRef.current.y;
      const store = useStore.getState();
      useStore.getState().setAppState({ scrollX: store.appState.scrollX + dx, scrollY: store.appState.scrollY + dy });
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      return;
    }
    const toolType = useStore.getState().appState.activeTool.type;
    const tool = tools[toolType];
    if (!tool) return;
    const state = useStore.getState();
    const scene = createScene(state);
    tool.onPointerMove(e.nativeEvent, state.appState, scene);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isPanningRef.current) { isPanningRef.current = false; return; }
    const toolType = useStore.getState().appState.activeTool.type;
    const tool = tools[toolType];
    if (!tool) return;
    const state = useStore.getState();
    const scene = createScene(state);
    tool.onPointerUp(e.nativeEvent, state.appState, scene);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const state = useStore.getState();
      const newZoom = Math.min(30, Math.max(0.1, state.appState.zoom.value * zoomFactor));
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const sceneX = (mouseX - state.appState.scrollX) / state.appState.zoom.value;
      const sceneY = (mouseY - state.appState.scrollY) / state.appState.zoom.value;
      useStore.getState().setAppState({
        zoom: { value: newZoom },
        scrollX: mouseX - sceneX * newZoom,
        scrollY: mouseY - sceneY * newZoom,
      });
    } else {
      const state = useStore.getState();
      useStore.getState().setAppState({
        scrollX: state.appState.scrollX - e.deltaX,
        scrollY: state.appState.scrollY - e.deltaY,
      });
    }
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const toolType = useStore.getState().appState.activeTool.type;
    const tool = tools[toolType];
    if (!tool || !tool.onDoubleClick) return;
    const state = useStore.getState();
    const scene = createScene(state);
    tool.onDoubleClick(e.nativeEvent, state.appState, scene);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const store = useStore.getState();
    store.setAppState({
      contextMenu: {
        x: e.clientX, y: e.clientY,
        items: [
          { label: "Cut", shortcut: "Ctrl+X", action: () => { store.deleteSelected(); store.pushHistory(); store.setAppState({ contextMenu: null }); } },
          { label: "Copy", shortcut: "Ctrl+C", action: () => { store.setAppState({ contextMenu: null }); } },
          { label: "Paste", shortcut: "Ctrl+V", action: () => { store.setAppState({ contextMenu: null }); } },
          { label: "", separator: true, action: () => {} },
          { label: "Duplicate", shortcut: "Ctrl+D", action: () => { store.duplicateSelected(); store.setAppState({ contextMenu: null }); } },
          { label: "Delete", shortcut: "Delete", action: () => { store.deleteSelected(); store.setAppState({ contextMenu: null }); } },
          { label: "", separator: true, action: () => {} },
          { label: "Group", shortcut: "Ctrl+G", action: () => { store.groupSelected(); store.setAppState({ contextMenu: null }); } },
          { label: "Ungroup", shortcut: "Ctrl+Shift+G", action: () => { store.ungroupSelected(); store.setAppState({ contextMenu: null }); } },
          { label: "", separator: true, action: () => {} },
          { label: "Bring to Front", action: () => { store.bringToFront(); store.setAppState({ contextMenu: null }); } },
          { label: "Send to Back", action: () => { store.sendToBack(); store.setAppState({ contextMenu: null }); } },
        ],
      },
    });
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rc = rough.canvas(canvas);

    const render = (time: number) => {
      try {
        const state = useStore.getState();
        const dpr = window.devicePixelRatio || 1;
        const w = state.appState.width;
        const h = state.appState.height;
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
        }
        renderScene(ctx, state.elements, state.appState, rc);
      } catch (err) {
        console.error("Render error at top-level:", err, "stack:", (err as Error)?.stack);
      }
      animFrameRef.current = requestAnimationFrame(render);
    };
    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  useEffect(() => {
    const handleResize = () => useStore.getState().setAppState({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClick = () => { if (useStore.getState().appState.contextMenu) useStore.getState().setAppState({ contextMenu: null }); };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const currentToolType = appState.activeTool.type;
  const tool = tools[currentToolType];
  const cursor = currentToolType === "hand" ? "grab" : tool?.cursor || "default";

  return (
    <div className="canvas-container" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", cursor, touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        tabIndex={0}
        role="application"
        aria-label="Drawing canvas"
      />
      {appState.editingElement && <TextEditOverlay element={appState.editingElement} />}
      {appState.showStats && <StatsOverlay />}
      <RenderDebug />
    </div>
  );
}

function RenderDebug() {
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const onError = (e: ErrorEvent) => setErr(e.message + "\n" + (e.error?.stack || ""));
    const onConsoleError = (...args: any[]) => setErr(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "));
    window.addEventListener("error", onError);
    const origConsoleError = console.error;
    console.error = (...args: any[]) => {
      onConsoleError(...args);
      origConsoleError(...args);
    };
    return () => {
      window.removeEventListener("error", onError);
      console.error = origConsoleError;
    };
  }, []);
  if (!err) return null;
  return (
    <div style={{ position: "absolute", top: 60, right: 8, background: "rgba(255,0,0,0.9)", color: "white", padding: 12, fontSize: 11, maxWidth: 500, maxHeight: 400, overflow: "auto", zIndex: 9999, fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
      {err}
    </div>
  );
}

function TextEditOverlay({ element }: { element: any }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const store = useStore();
  const appState = useStore((s) => s.appState);
  const textEl = element as ExcalidrawTextElement;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    // Delay focus so React has flushed the DOM node
    const id = requestAnimationFrame(() => {
      ta.focus();
      // place cursor at end
      ta.selectionStart = ta.value.length;
      ta.selectionEnd = ta.value.length;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <textarea
      ref={textareaRef}
      style={{
        position: "absolute",
        left: `${(textEl.x || 0) * appState.zoom.value + appState.scrollX}px`,
        top: `${(textEl.y || 0) * appState.zoom.value + appState.scrollY}px`,
        width: `${Math.max((textEl.width || 100) * appState.zoom.value, 40)}px`,
        minHeight: `${Math.max((textEl.height || 40) * appState.zoom.value, 24)}px`,
        fontSize: `${((textEl as any).fontSize || 20) * appState.zoom.value}px`,
        fontFamily: FONT_FAMILIES[(textEl as any).fontFamily as keyof typeof FONT_FAMILIES] || FONT_FAMILIES[1],
        color: textEl.strokeColor,
        background: "rgba(255,255,255,0.9)",
        border: "1px solid #6965db",
        outline: "none",
        resize: "none",
        overflow: "hidden",
        lineHeight: String((textEl as any).lineHeight || 1.25),
        textAlign: (textEl as any).textAlign || "left",
        padding: "4px",
        margin: 0,
        zIndex: 1000,
        boxSizing: "border-box",
      }}
      defaultValue={element.text || ""}
      onChange={(e) => {
        const text = e.target.value;
        const lines = text.split("\n");
        const fontSize = (textEl as any).fontSize || 20;
        const lineHeight = fontSize * ((textEl as any).lineHeight || 1.25);
        store.updateElement(element.id, {
          text,
          width: Math.max(textEl.width || 100, 100),
          height: Math.max(textEl.height || 40, lines.length * lineHeight),
        } as any);
      }}
      onBlur={() => {
        store.setEditingElement(null);
        store.setAppState({ editingElement: null });
        store.pushHistory();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          store.setEditingElement(null);
          store.setAppState({ editingElement: null });
          store.pushHistory();
        }
        e.stopPropagation();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    />
  );
}

function StatsOverlay() {
  const elements = useStore((s) => s.elements);
  const appState = useStore((s) => s.appState);
  const selectedCount = Object.keys(appState.selectedElementIds).length;

  return (
    <div style={{
      position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.7)",
      color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 11,
      fontFamily: "monospace", zIndex: 999, pointerEvents: "none",
    }}>
      <div>Elements: {elements.length}</div>
      <div>Selected: {selectedCount}</div>
      <div>Zoom: {Math.round(appState.zoom.value * 100)}%</div>
    </div>
  );
}
