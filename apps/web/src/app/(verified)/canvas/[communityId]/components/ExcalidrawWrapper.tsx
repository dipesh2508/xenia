// components/ExcalidrawWrapper.js
import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

const ExcalidrawWrapper = () => (
  <div style={{ height: "95dvh", width: "100%" }}>
    <Excalidraw />
  </div>
);

export default ExcalidrawWrapper;
