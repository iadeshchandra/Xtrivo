/**
 * Preload: the ONLY bridge between renderer and main. Minimal by design —
 * every API added here is a security decision (reviewed in Stage 6/10).
 */
import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("xtrivo", {
  version: "0.1.0",
  platform: process.platform,
});
