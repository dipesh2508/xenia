"use client"

import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  () => import("./components/ExcalidrawWrapper"),
  { ssr: false }
);

export default function DrawPage() {
  return (
    <main>
      <h1>Excalidraw Canvas</h1>
      <ExcalidrawWrapper />
    </main>
  );
}
