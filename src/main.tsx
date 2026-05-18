import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import ErrorBoundary from "./app/components/ErrorBoundary.tsx";

/**
 * FBEconnect – Application Entry Point
 *
 * SECURITY & QUALITY LAYERS:
 *   1. StrictMode     – Highlights unsafe patterns in development
 *   2. ErrorBoundary  – Catches all unhandled render errors; shows a friendly
 *                       fallback instead of a blank screen or stack trace
 */
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);