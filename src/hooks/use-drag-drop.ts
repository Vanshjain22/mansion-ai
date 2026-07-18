"use client";

import { useCallback, useRef, useState } from "react";

/**
 * useDragDrop — Encapsulates drag & drop event handling.
 *
 * WHY A SEPARATE HOOK?
 *
 * Drag & drop handling has a subtle bug that trips up most developers:
 * the "flickering isDragging" problem.
 *
 * THE BUG:
 * When you drag a file over a <div> that contains child elements:
 *   dragenter fires on the <div>         → isDragging = true  ✅
 *   dragenter fires on a <span> child    → isDragging = true  (redundant)
 *   dragleave fires on the <div>         → isDragging = false ❌ WRONG!
 *   (user is still dragging over the <span>)
 *
 * THE FIX: Reference counting.
 * Every dragenter increments a counter, every dragleave decrements it.
 * isDragging is true when counter > 0.
 *
 * This is extracted into a hook because:
 * 1. The fix is non-obvious — hiding it in a component risks someone
 *    "simplifying" it away during refactoring.
 * 2. It's reusable — any drag target (dropzone, gallery, kanban) can use it.
 */

interface UseDragDropOptions {
  onFileDrop: (files: File[]) => void;
  disabled?: boolean;
}

interface UseDragDropReturn {
  isDragging: boolean;
  dragProps: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

export function useDragDrop({
  onFileDrop,
  disabled = false,
}: UseDragDropOptions): UseDragDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      dragCounterRef.current++;
      if (dragCounterRef.current === 1) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      // preventDefault is REQUIRED here. Without it, the browser
      // handles the drop itself (opens the file in a new tab).
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Reset counter on drop — the drag sequence is over
      dragCounterRef.current = 0;
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFileDrop(files);
      }
    },
    [onFileDrop, disabled]
  );

  return {
    isDragging,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}
