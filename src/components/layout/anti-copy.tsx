"use client";

import { useEffect } from "react";

function isAllowedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  // Allow interactions inside inputs, textareas, contenteditable, or explicitly opt-in
  return !!target.closest("input, textarea, [contenteditable='true'], .allow-select, .allow-copy");
}

export function AntiCopy() {
  useEffect(() => {
    const onCopy = (e: ClipboardEvent) => { if (!isAllowedTarget(e.target)) e.preventDefault(); };
    const onCut = (e: ClipboardEvent) => { if (!isAllowedTarget(e.target)) e.preventDefault(); };
    const onPaste = (e: ClipboardEvent) => { if (!isAllowedTarget(e.target)) e.preventDefault(); };
    const onContextMenu = (e: MouseEvent) => { if (!isAllowedTarget(e.target)) e.preventDefault(); };
    const onDragStart = (e: DragEvent) => { if (!isAllowedTarget(e.target)) e.preventDefault(); };
    const onKeyDown = (e: KeyboardEvent) => {
      // Guard against undefined keys (rare in some synthetic events)
      const key = (e.key || '').toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      if (ctrlOrMeta && ["c", "x", "a", "s", "u", "p"].includes(key)) {
        if (!isAllowedTarget(e.target)) e.preventDefault();
      }
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return null;
}
