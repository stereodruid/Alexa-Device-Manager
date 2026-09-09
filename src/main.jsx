import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (!document.getElementById("aura-root")) {
  const rootEl = document.createElement("div");
  rootEl.id = "aura-root";
  document.body.appendChild(rootEl);
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const root = createRoot(rootEl);
  const close = () => {
    root.unmount();
    rootEl.remove();
    document.body.style.overflow = previousOverflow;
    window.removeEventListener("aura-close", close);
  };
  window.addEventListener("aura-close", close);
  root.render(<App />);
}
