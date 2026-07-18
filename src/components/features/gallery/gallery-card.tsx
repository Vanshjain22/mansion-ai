"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Trash2, Edit2, FolderOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatFileSize } from "@/lib/utils/format";
import type { DesignRecord, CollectionRecord } from "@/lib/db/design-repository";

/**
 * GalleryCard — Single visual design variation representation.
 *
 * DESIGN CONCEPTS:
 * 1. HOVER BEFORE/AFTER TOGGLE: Hovering over the card swaps the AI image
 *    with the original room photo, allowing instant comparison.
 * 2. MULTI-ACTION TOOLBAR: Smooth sliding action toolbar containing:
 *    - Favorite toggle (POSTs to /api/designs/variations/[varId]/favorite)
 *    - Collection assignment folder mapping (POSTs to collections API)
 *    - Inline title renaming input (PATCH to /api/designs/[id])
 *    - Hard delete (DELETE to /api/designs/[id])
 * 3. ACCESSIBLE DIALOGS: Handles inline state toggling (renaming mode,
 *    collection list dropdown) cleanly.
 */

interface GalleryCardProps {
  design: DesignRecord;
  collections: CollectionRecord[];
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onFavoriteToggle: (variationId: string) => void;
  onCollectionToggle: (collectionId: string, designId: string, isAdded: boolean) => void;
}

export function GalleryCard({
  design,
  collections,
  onDelete,
  onRename,
  onFavoriteToggle,
  onCollectionToggle,
}: GalleryCardProps) {
  // Take the first variation as the display target (fallback to original room if pending/failed)
  const variation = design.variations[0];
  const displayUrl = variation ? variation.generatedImageUrl : design.originalImageUrl;
  const isFavorite = variation ? variation.isFavorite : false;

  const [hoverImage, setHoverImage] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(design.title);
  const [showCollectionsList, setShowCollectionsList] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRenameSubmit = () => {
    if (newTitle.trim() && newTitle.trim() !== design.title) {
      onRename(design.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!variation) return;
    onFavoriteToggle(variation.id);
  };

  const handleToggleCollection = (colId: string, isAdded: boolean) => {
    onCollectionToggle(colId, design.id, isAdded);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${design.title}"?`)) {
      setIsDeleting(true);
      onDelete(design.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden bg-bg-secondary border border-border-subtle",
        "transition-all duration-300 hover:shadow-lg hover:border-border-strong animate-fade-in-up",
        isDeleting && "opacity-40 scale-95 pointer-events-none"
      )}
      onMouseEnter={() => setHoverImage(true)}
      onMouseLeave={() => {
        setHoverImage(false);
        setShowCollectionsList(false);
      }}
    >
      
      {/* Visual Canvas Panel */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-primary">
        <Image
          src={hoverImage && design.originalImageUrl ? design.originalImageUrl : displayUrl}
          alt={design.title}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            "group-hover:scale-105"
          )}
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />

        {/* Hover image context badge */}
        {hoverImage && design.originalImageUrl && (
          <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
            Original Room
          </span>
        )}

        {/* Action Sidebar Overlay (fades/slides in on hover) */}
        <div
          className={cn(
            "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-200",
            "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0"
          )}
        >
          {/* Favorite button */}
          {variation && (
            <button
              onClick={handleFavoriteClick}
              className={cn(
                "p-2 rounded-xl backdrop-blur-md border transition-all duration-150 focus-ring",
                isFavorite
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-black/40 hover:bg-black/60 text-white border-white/10"
              )}
              title={isFavorite ? "Unfavorite design" : "Favorite design"}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </button>
          )}

          {/* Collections Dropdown button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCollectionsList(!showCollectionsList);
            }}
            className={cn(
              "p-2 rounded-xl backdrop-blur-md border transition-all duration-150 focus-ring",
              showCollectionsList
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-black/40 hover:bg-black/60 text-white border-white/10"
            )}
            title="Manage collections"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-xl backdrop-blur-md border border-white/10 bg-black/40 hover:bg-error/80 text-white transition-all duration-150 focus-ring"
            title="Delete design"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Collections Dropdown List Panel */}
        {showCollectionsList && (
          <div className="absolute top-14 right-3 w-48 rounded-xl bg-bg-secondary border border-border-default shadow-lg p-2 z-10 animate-in fade-in slide-in-from-top-1 duration-150">
            <p className="text-[10px] text-text-tertiary font-bold px-2 py-1 uppercase tracking-wider">
              Add to Collection
            </p>
            <div className="max-h-36 overflow-y-auto space-y-0.5 mt-1">
              {collections.length === 0 ? (
                <p className="text-xs text-text-tertiary px-2 py-1">No collections built yet.</p>
              ) : (
                collections.map((col) => {
                  const isAdded = col.designIds.includes(design.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => handleToggleCollection(col.id, isAdded)}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left",
                        "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
                      )}
                    >
                      <span className="truncate pr-2">{col.name}</span>
                      {isAdded && <Check className="w-3.5 h-3.5 text-brand-primary shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {isRenaming ? (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
                autoFocus
                className="flex-1 text-sm bg-bg-tertiary border border-brand-primary px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary text-text-primary"
              />
              <button
                onClick={handleRenameSubmit}
                className="px-2 py-1 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs rounded transition-colors"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-text-primary truncate" title={design.title}>
                {design.title}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
                className="p-1 text-text-tertiary hover:text-brand-primary rounded transition-colors focus-ring shrink-0"
                title="Rename design"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}

          <p className="text-[11px] text-text-tertiary mt-1 capitalize">
            {design.roomType.replace("_", " ")} • {design.styleId}
          </p>
        </div>

        {/* Details Footer */}
        <div className="flex items-center justify-between text-[10px] text-text-tertiary border-t border-border-subtle/30 pt-2.5">
          <span>{new Date(design.createdAt).toLocaleDateString()}</span>
          {variation && (
            <span>
              AI: {variation.aiModel.split(":")[0].split("/").pop()} ({(variation.inferenceTimeMs / 1000).toFixed(1)}s)
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
