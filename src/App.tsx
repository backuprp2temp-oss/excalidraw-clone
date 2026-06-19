import React from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import TopBar from "./components/TopBar";
import PropertiesPanel from "./components/PropertiesPanel";
import ContextMenu from "./components/ContextMenu";
import { useTheme } from "./hooks/useTheme";

function App() {
  useTheme();

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <Canvas />
      <Toolbar />
      <TopBar />
      <PropertiesPanel />
      <ContextMenu />
    </div>
  );
}

export default App;
