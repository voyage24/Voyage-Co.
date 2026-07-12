"use client";

import { useEffect } from "react";

// Registers the service worker for installable / offline support, and — crucially
// — reloads the page once when a NEW service worker takes control, so users never
// get stuck on a stale cached version after a deploy.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // If a controller already exists, a later controllerchange means an updated
    // SW has activated + claimed this page → reload for fresh content. Skipped on
    // the very first install (no prior controller) to avoid a needless reload.
    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").then(reg => { reg.update?.(); }).catch(() => {});
    };
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);
  return null;
}
