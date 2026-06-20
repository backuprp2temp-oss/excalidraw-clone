import React from "react";
import { useStore } from "../store/appStore";
import { COLORS } from "../constants";
import type {
  ExcalidrawElement,
  StrokeWidth,
  StrokeStyle,
  FillStyle,
  FontFamily,
  Arrowhead,
  RoundnessType,
} from "../elements/types";

export default function PropertiesPanel() {
  const appState = useStore((s) => s.appState);
  const elements = useStore((s) => s.elements);
  const updateElement = useStore((s) => s.updateElement);
  const selectedIds = Object.keys(appState.selectedElementIds);

  if (selectedIds.length === 0) return null;

  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
  const first = selectedElements[0];

  const update = (updates: Partial<ExcalidrawElement>) => {
    for (const id of selectedIds) {
      updateElement(id, updates);
    }
    if ("strokeColor" in updates) {
      useStore.getState().setAppState({ currentItemStrokeColor: updates.strokeColor as string });
    }
  };

  const isShape = first.type === "rectangle" || first.type === "ellipse" || first.type === "diamond";
  const isArrow = first.type === "arrow";
  const isText = first.type === "text";
  const isFreDraw = first.type === "freedraw";

  return (
    <div
      style={{
        position: "absolute",
        right: 8,
        top: 56,
        width: 240,
        background: "var(--color-surface)",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: 12,
        zIndex: 100,
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto",
      }}
    >
      {/* Stroke Color */}
      <Section title="Stroke">
        <ColorPicker
          value={first.strokeColor}
          onChange={(color) => update({ strokeColor: color })}
        />
        <div style={{ marginTop: 8 }}>
          <Label>Width</Label>
          <div style={{ display: "flex", gap: 4 }}>
            {([1, 2, 4] as StrokeWidth[]).map((w) => (
              <button
                key={w}
                onClick={() => update({ strokeWidth: w })}
                style={{
                  ...buttonStyle,
                  background: first.strokeWidth === w ? "var(--color-accent)" : "var(--color-surface-high)",
                  color: first.strokeWidth === w ? "#fff" : "var(--color-text)",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: w,
                    background: first.strokeWidth === w ? "#fff" : "var(--color-text)",
                    borderRadius: 1,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <Label>Style</Label>
          <div style={{ display: "flex", gap: 4 }}>
            {(["solid", "dashed", "dotted"] as StrokeStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => update({ strokeStyle: s })}
                style={{
                  ...buttonStyle,
                  background: first.strokeStyle === s ? "var(--color-accent)" : "var(--color-surface-high)",
                  color: first.strokeStyle === s ? "#fff" : "var(--color-text)",
                  fontSize: 11,
                }}
              >
                {s === "solid" ? "━" : s === "dashed" ? "┅" : "┈"}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Background */}
      <Section title="Background">
        <ColorPicker
          value={first.backgroundColor}
          onChange={(color) => update({ backgroundColor: color })}
          showTransparent
        />
        <div style={{ marginTop: 8 }}>
          <Label>Fill</Label>
          <div style={{ display: "flex", gap: 4 }}>
            {(["none", "hatch", "cross-hatch", "solid", "zigzag"] as FillStyle[]).map((f) => (
              <button
                key={f}
                onClick={() => update({ fillStyle: f })}
                style={{
                  ...buttonStyle,
                  background: first.fillStyle === f ? "var(--color-accent)" : "var(--color-surface-high)",
                  color: first.fillStyle === f ? "#fff" : "var(--color-text)",
                  fontSize: 10,
                }}
                title={f}
              >
                {f === "none" ? "✕" : f === "hatch" ? "╱" : f === "cross-hatch" ? "╳" : f === "solid" ? "█" : "⌇"}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Opacity */}
      <Section title="Opacity">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range"
            min={0}
            max={100}
            value={first.opacity}
            onChange={(e) => update({ opacity: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 12, color: "var(--color-text-muted)", minWidth: 30 }}>
            {first.opacity}%
          </span>
        </div>
      </Section>

      {/* Corners (shapes only) */}
      {isShape && (
        <Section title="Corners">
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => update({ roundness: null })}
              style={{
                ...buttonStyle,
                background: !first.roundness ? "var(--color-accent)" : "var(--color-surface-high)",
                color: !first.roundness ? "#fff" : "var(--color-text)",
              }}
              title="Sharp corners"
            >
              □
            </button>
            <button
              onClick={() => update({ roundness: { type: 2, value: 8 } })}
              style={{
                ...buttonStyle,
                background: first.roundness ? "var(--color-accent)" : "var(--color-surface-high)",
                color: first.roundness ? "#fff" : "var(--color-text)",
              }}
              title="Rounded corners"
            >
              ▭
            </button>
          </div>
        </Section>
      )}

      {/* Roughness */}
      <Section title="Roughness">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range"
            min={0}
            max={2}
            step={0.5}
            value={first.roughness}
            onChange={(e) => update({ roughness: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 12, color: "var(--color-text-muted)", minWidth: 40 }}>
            {first.roughness === 0 ? "Architect" : first.roughness === 0.5 ? "Artist" : first.roughness === 1 ? "Cartoonist" : "Very Rough"}
          </span>
        </div>
      </Section>

      {/* Arrowheads (arrows only) */}
      {isArrow && (
        <Section title="Arrowheads">
          <div style={{ marginBottom: 4 }}>
            <Label>Start</Label>
            <select
              value={(first as any).startArrowhead || "none"}
              onChange={(e) => update({ startArrowhead: e.target.value as Arrowhead } as any)}
              style={selectStyle}
            >
              {["none", "arrow", "bar", "dot", "triangle", "circle"].map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>End</Label>
            <select
              value={(first as any).endArrowhead || "arrow"}
              onChange={(e) => update({ endArrowhead: e.target.value as Arrowhead } as any)}
              style={selectStyle}
            >
              {["none", "arrow", "bar", "dot", "triangle", "circle"].map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </Section>
      )}

      {/* Font (text only) */}
      {isText && (
        <Section title="Font">
          <div style={{ marginBottom: 8 }}>
            <Label>Family</Label>
            <div style={{ display: "flex", gap: 4 }}>
              {([
                { id: 1, name: "Hand-drawn" },
                { id: 2, name: "Normal" },
                { id: 3, name: "Code" },
              ] as { id: FontFamily; name: string }[]).map((f) => (
                <button
                  key={f.id}
                  onClick={() => update({ fontFamily: f.id } as any)}
                  style={{
                    ...buttonStyle,
                    background: (first as any).fontFamily === f.id ? "var(--color-accent)" : "var(--color-surface-high)",
                    color: (first as any).fontFamily === f.id ? "#fff" : "var(--color-text)",
                    fontSize: 10,
                    flex: 1,
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Label>Size</Label>
            <input
              type="number"
              value={(first as any).fontSize || 20}
              onChange={(e) => update({ fontSize: Number(e.target.value) } as any)}
              min={8}
              max={288}
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>
          <div>
            <Label>Align</Label>
            <div style={{ display: "flex", gap: 4 }}>
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => update({ textAlign: a } as any)}
                  style={{
                    ...buttonStyle,
                    background: (first as any).textAlign === a ? "var(--color-accent)" : "var(--color-surface-high)",
                    color: (first as any).textAlign === a ? "#fff" : "var(--color-text)",
                    fontSize: 10,
                    flex: 1,
                  }}
                >
                  {a === "left" ? "⫷" : a === "center" ? "⫿" : "⫸"}
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Actions */}
      <Section title="Actions">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <ActionButton label="Duplicate" onClick={() => useStore.getState().duplicateSelected()} />
          <ActionButton label="Delete" onClick={() => useStore.getState().deleteSelected()} />
          <ActionButton label="Bring Forward" onClick={() => useStore.getState().bringForward()} />
          <ActionButton label="Send Backward" onClick={() => useStore.getState().sendBackward()} />
          <ActionButton label="Bring to Front" onClick={() => useStore.getState().bringToFront()} />
          <ActionButton label="Send to Back" onClick={() => useStore.getState().sendToBack()} />
          {selectedIds.length > 1 && (
            <>
              <ActionButton label="Group" onClick={() => useStore.getState().groupSelected()} />
              <ActionButton label="Ungroup" onClick={() => useStore.getState().ungroupSelected()} />
            </>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>{children}</div>
  );
}

function ColorPicker({
  value,
  onChange,
  showTransparent,
}: {
  value: string;
  onChange: (color: string) => void;
  showTransparent?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {showTransparent && (
        <button
          onClick={() => onChange("transparent")}
          style={{
            width: 24,
            height: 24,
            border: value === "transparent" ? "2px solid var(--color-accent)" : "1px solid var(--color-surface-high)",
            borderRadius: 4,
            cursor: "pointer",
            background: "linear-gradient(45deg, #fff 45%, #e00 45%, #e00 55%, #fff 55%)",
          }}
        />
      )}
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          style={{
            width: 24,
            height: 24,
            background: color,
            border: value === color ? "2px solid var(--color-accent)" : "1px solid var(--color-surface-high)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        />
      ))}
      <input
        type="color"
        value={value === "transparent" ? "#000000" : value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 24,
          height: 24,
          border: "1px solid var(--color-surface-high)",
          borderRadius: 4,
          cursor: "pointer",
          padding: 0,
        }}
      />
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 8px",
        border: "1px solid var(--color-surface-high)",
        background: "transparent",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 11,
        color: "var(--color-text)",
        textAlign: "center",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-high)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </button>
  );
}

const buttonStyle: React.CSSProperties = {
  width: 32,
  height: 28,
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid var(--color-surface-high)",
  borderRadius: 4,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  border: "1px solid var(--color-surface-high)",
  borderRadius: 4,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  fontSize: 12,
};
