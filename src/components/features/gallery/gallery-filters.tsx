"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROOM_TYPES, STYLE_PRESETS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

/**
 * GalleryFilters — Filtering, search, and sorting controls.
 *
 * Provides users with the ability to narrow down their past designs.
 * Connects directly to the parent local state using standard callbacks.
 *
 * LAYOUT:
 * Multi-column grid on desktop, stacks responsively on mobile.
 */

export interface GalleryFilterState {
  search: string;
  style: string;
  roomType: string;
  onlyFavorites: boolean;
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
}

interface GalleryFiltersProps {
  filters: GalleryFilterState;
  onChange: (filters: GalleryFilterState) => void;
  collectionOptions: Array<{ id: string; name: string }>;
  selectedCollection: string;
  onCollectionChange: (id: string) => void;
}

export function GalleryFilters({
  filters,
  onChange,
  collectionOptions,
  selectedCollection,
  onCollectionChange,
}: GalleryFiltersProps) {
  const updateFilter = (key: keyof GalleryFilterState, value: any) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl glass border border-border-subtle">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search Input (4 cols) */}
        <div className="md:col-span-4">
          <Label htmlFor="search" className="text-xs text-text-secondary">Search Designs</Label>
          <div className="relative mt-1.5">
            <Input
              id="search"
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search by title or prompt details..."
              className="bg-bg-tertiary/50 border-border-default text-text-primary text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Style Filter (2 cols) */}
        <div className="md:col-span-2">
          <Label htmlFor="style-filter" className="text-xs text-text-secondary">Style</Label>
          <select
            id="style-filter"
            value={filters.style}
            onChange={(e) => updateFilter("style", e.target.value)}
            className="w-full mt-1.5 h-[40px] px-3 rounded-md bg-bg-tertiary/50 border border-border-default text-text-primary text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          >
            <option value="">All Styles</option>
            {STYLE_PRESETS.map((style) => (
              <option key={style.slug} value={style.slug}>{style.name}</option>
            ))}
          </select>
        </div>

        {/* Room Type Filter (2 cols) */}
        <div className="md:col-span-2">
          <Label htmlFor="room-filter" className="text-xs text-text-secondary">Room Type</Label>
          <select
            id="room-filter"
            value={filters.roomType}
            onChange={(e) => updateFilter("roomType", e.target.value)}
            className="w-full mt-1.5 h-[40px] px-3 rounded-md bg-bg-tertiary/50 border border-border-default text-text-primary text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          >
            <option value="">All Rooms</option>
            {ROOM_TYPES.map((room) => (
              <option key={room} value={room}>{room.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {/* Collections Filter (2 cols) */}
        <div className="md:col-span-2">
          <Label htmlFor="collection-filter" className="text-xs text-text-secondary">Collection</Label>
          <select
            id="collection-filter"
            value={selectedCollection}
            onChange={(e) => onCollectionChange(e.target.value)}
            className="w-full mt-1.5 h-[40px] px-3 rounded-md bg-bg-tertiary/50 border border-border-default text-text-primary text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          >
            <option value="">All Designs</option>
            {collectionOptions.map((col) => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
        </div>

        {/* Sorting Selection (2 cols) */}
        <div className="md:col-span-2">
          <Label htmlFor="sort-by" className="text-xs text-text-secondary">Sort By</Label>
          <select
            id="sort-by"
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            className="w-full mt-1.5 h-[40px] px-3 rounded-md bg-bg-tertiary/50 border border-border-default text-text-primary text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Name A-Z</option>
            <option value="title_desc">Name Z-A</option>
          </select>
        </div>

      </div>

      {/* Favorite filter row */}
      <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.onlyFavorites}
            onChange={(e) => updateFilter("onlyFavorites", e.target.checked)}
            className="w-4 h-4 rounded text-brand-primary border-border-default bg-bg-tertiary focus:ring-brand-primary focus:ring-offset-bg-primary"
          />
          <span className="text-xs text-text-secondary font-medium">Show only favorited variations</span>
        </label>
        
        {/* Reset Filters */}
        {(filters.search || filters.style || filters.roomType || filters.onlyFavorites || selectedCollection) && (
          <button
            onClick={() => {
              onChange({
                search: "",
                style: "",
                roomType: "",
                onlyFavorites: false,
                sortBy: "newest",
              });
              onCollectionChange("");
            }}
            className="text-xs text-text-tertiary hover:text-brand-primary transition-colors focus-ring"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
