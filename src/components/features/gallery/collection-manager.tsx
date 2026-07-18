"use client";

import { useState } from "react";
import { Plus, Folder, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { CollectionRecord } from "@/lib/db/design-repository";

/**
 * CollectionManager — Visual sidebar or widget to build & view folders.
 *
 * Allows users to classify their design variants into custom collections (e.g. "Kitchen Remodels").
 * Houses a text input to submit POST creation requests, and list existing folders.
 */

interface CollectionManagerProps {
  collections: CollectionRecord[];
  selectedCollection: string;
  onSelectCollection: (id: string) => void;
  onCreateCollection: (name: string) => void;
  className?: string;
}

export function CollectionManager({
  collections,
  selectedCollection,
  onSelectCollection,
  onCreateCollection,
  className,
}: CollectionManagerProps) {
  const [newColName, setNewColName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColName.trim()) {
      onCreateCollection(newColName.trim());
      setNewColName("");
    }
  };

  return (
    <div className={cn("space-y-4 p-5 rounded-2xl bg-bg-secondary border border-border-subtle", className)}>
      <div>
        <h3 className="text-sm font-semibold font-[family-name:var(--font-outfit)] text-text-primary">
          Collections
        </h3>
        <p className="text-xs text-text-tertiary mt-0.5">
          Group your room designs into albums
        </p>
      </div>

      {/* New Collection Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
          placeholder="New collection name..."
          className="h-[36px] bg-bg-tertiary/50 border-border-default text-xs text-text-primary focus:border-brand-primary"
        />
        <button
          type="submit"
          disabled={!newColName.trim()}
          className={cn(
            "p-2 rounded-lg text-white font-medium shrink-0 transition-all focus-ring",
            newColName.trim()
              ? "bg-brand-primary hover:bg-brand-primary-hover"
              : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
          )}
          title="Create collection"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Collections Folders List */}
      <div className="space-y-1 max-h-[250px] overflow-y-auto" role="list">
        {/* 'All Designs' virtual folder */}
        <button
          onClick={() => onSelectCollection("")}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors focus-ring",
            selectedCollection === ""
              ? "bg-brand-primary/10 text-brand-primary"
              : "text-text-secondary hover:bg-bg-tertiary"
          )}
          role="listitem"
        >
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 shrink-0" />
            <span>All Designs</span>
          </div>
        </button>

        {collections.map((col) => {
          const isSelected = selectedCollection === col.id;
          return (
            <button
              key={col.id}
              onClick={() => onSelectCollection(col.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors focus-ring",
                isSelected
                  ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                  : "text-text-secondary hover:bg-bg-tertiary border border-transparent"
              )}
              role="listitem"
            >
              <div className="flex items-center gap-2 truncate">
                <Folder className="w-4 h-4 shrink-0 text-text-tertiary" />
                <span className="truncate">{col.name}</span>
              </div>
              <span className="text-[10px] bg-bg-tertiary px-1.5 py-0.5 rounded-full text-text-tertiary font-bold shrink-0 ml-2">
                {col.designIds.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
