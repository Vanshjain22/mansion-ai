"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MasonryGrid } from "@/components/features/gallery/masonry-grid";
import { GalleryFilters, type GalleryFilterState } from "@/components/features/gallery/gallery-filters";
import { GalleryCard } from "@/components/features/gallery/gallery-card";
import { CollectionManager } from "@/components/features/gallery/collection-manager";
import type { DesignRecord, CollectionRecord } from "@/lib/db/design-repository";
import { cn } from "@/lib/utils/cn";

/**
 * GalleryDemoPage — Testing playground for visual designs.
 *
 * Houses:
 * 1. Filtering Catalog: search prompts, style matching, room category filter.
 * 2. Infinite Scroll: observer trigger at bottom.
 * 3. CRUD API bindings.
 */

const ITEMS_PER_PAGE = 8;

export default function GalleryDemoPage() {
  const [designs, setDesigns] = useState<DesignRecord[]>([]);
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pagination states for Infinite Scroll
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [filters, setFilters] = useState<GalleryFilterState>({
    search: "",
    style: "",
    roomType: "",
    onlyFavorites: false,
    sortBy: "newest",
  });

  // ── Fetch Operations ──
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      // Load Designs
      const dResponse = await fetch("/api/designs");
      if (!dResponse.ok) throw new Error("Failed to fetch designs list.");
      const dJson = await dResponse.json();
      setDesigns(dJson.data || []);

      // Load Collections
      const cResponse = await fetch("/api/collections");
      if (!cResponse.ok) throw new Error("Failed to fetch collections list.");
      const cJson = await cResponse.json();
      setCollections(cJson.data || []);

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "An unexpected error occurred loading gallery.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ── Mutators ──
  const handleDeleteDesign = async (id: string) => {
    try {
      const res = await fetch(`/api/designs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      // Refresh collections counts
      setCollections((prev) =>
        prev.map((col) => ({
          ...col,
          designIds: col.designIds.filter((dId) => dId !== id),
        }))
      );
    } catch (e: any) {
      alert(e.message || "Failed to delete design.");
    }
  };

  const handleRenameDesign = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/designs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Rename failed.");

      setDesigns((prev) =>
        prev.map((d) => (d.id === id ? { ...d, title } : d))
      );
    } catch (e: any) {
      alert(e.message || "Failed to rename.");
    }
  };

  const handleFavoriteToggle = async (variationId: string) => {
    try {
      const res = await fetch(`/api/designs/variations/${variationId}/favorite`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Favorite update failed.");
      const json = await res.json();
      const nextFavorite = json.isFavorite;

      setDesigns((prev) =>
        prev.map((d) => {
          const varIndex = d.variations.findIndex((v) => v.id === variationId);
          if (varIndex !== -1) {
            const updatedVars = [...d.variations];
            updatedVars[varIndex] = {
              ...updatedVars[varIndex],
              isFavorite: nextFavorite,
            };
            return { ...d, variations: updatedVars };
          }
          return d;
        })
      );
    } catch (e: any) {
      alert(e.message || "Failed to favorite.");
    }
  };

  const handleCreateCollection = async (name: string) => {
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create collection folder.");
      const json = await res.json();
      
      setCollections((prev) => [...prev, json.data]);
    } catch (e: any) {
      alert(e.message || "Failed to create collection.");
    }
  };

  const handleCollectionToggle = async (collectionId: string, designId: string, isAdded: boolean) => {
    try {
      const action = isAdded ? "remove" : "add";
      const res = await fetch(`/api/collections/${collectionId}/designs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId, action }),
      });

      if (!res.ok) throw new Error("Failed to update collection listing.");

      setCollections((prev) =>
        prev.map((col) => {
          if (col.id === collectionId) {
            return {
              ...col,
              designIds: isAdded
                ? col.designIds.filter((id) => id !== designId)
                : [...col.designIds, designId],
            };
          }
          return col;
        })
      );
    } catch (e: any) {
      alert(e.message || "Failed to alter collection.");
    }
  };

  // ── Client Filtering Engine ──
  const filteredDesigns = useMemo(() => {
    let result = [...designs];

    // Filter by Collection
    if (selectedCollection) {
      const targetCol = collections.find((c) => c.id === selectedCollection);
      if (targetCol) {
        result = result.filter((d) => targetCol.designIds.includes(d.id));
      }
    }

    // Filter by Style
    if (filters.style) {
      result = result.filter((d) => d.styleId === filters.style);
    }

    // Filter by Room Type
    if (filters.roomType) {
      result = result.filter((d) => d.roomType === filters.roomType);
    }

    // Filter by Favorites (only variations marked favorite)
    if (filters.onlyFavorites) {
      result = result.filter((d) => d.variations.some((v) => v.isFavorite));
    }

    // Search Query (title or prompts)
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.customPrompt?.toLowerCase().includes(query) ||
          d.styleId.toLowerCase().includes(query) ||
          d.roomType.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === "newest") return b.createdAt - a.createdAt;
      if (filters.sortBy === "oldest") return a.createdAt - b.createdAt;
      if (filters.sortBy === "title_asc") return a.title.localeCompare(b.title);
      if (filters.sortBy === "title_desc") return b.title.localeCompare(a.title);
      return 0;
    });

    return result;
  }, [designs, collections, selectedCollection, filters]);

  // ── Infinite Scroll observer effect ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && filteredDesigns.length > visibleCount) {
          // Load next page
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [filteredDesigns, visibleCount]);

  // Reset page position when filters are modified
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filters, selectedCollection]);

  // Paginated items
  const paginatedDesigns = useMemo(() => {
    return filteredDesigns.slice(0, visibleCount);
  }, [filteredDesigns, visibleCount]);

  return (
    <main className="min-h-screen pb-16">
      
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-secondary/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">
            <span className="text-gradient">Design Gallery</span>
          </h1>
          <p className="text-text-secondary mt-1">
            Browse, sort, search, and manage your past AI interior designs.
          </p>
        </div>
      </header>

      {/* Main Grid content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left panel: Collections manager */}
          <section className="w-full lg:w-[280px] shrink-0">
            <CollectionManager
              collections={collections}
              selectedCollection={selectedCollection}
              onSelectCollection={setSelectedCollection}
              onCreateCollection={handleCreateCollection}
            />
          </section>

          {/* Right panel: Gallery grid & filters */}
          <section className="flex-1 min-w-0 space-y-6">
            
            <GalleryFilters
              filters={filters}
              onChange={setFilters}
              collectionOptions={collections.map(c => ({ id: c.id, name: c.name }))}
              selectedCollection={selectedCollection}
              onCollectionChange={setSelectedCollection}
            />

            {isLoading ? (
              // Skeletons
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] w-full rounded-2xl skeleton" />
                ))}
              </div>
            ) : errorMsg ? (
              <div className="p-4 rounded-xl bg-error/5 border border-error/20 text-error text-sm">
                <strong>Error: </strong> {errorMsg}
              </div>
            ) : paginatedDesigns.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-bg-secondary border border-dashed border-border-default">
                <p className="text-text-secondary text-sm">No designs match your filters.</p>
                <button
                  onClick={handleResetAllFilters}
                  className="mt-3 text-xs text-brand-primary hover:underline font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <MasonryGrid>
                  {paginatedDesigns.map((design) => (
                    <GalleryCard
                      key={design.id}
                      design={design}
                      collections={collections}
                      onDelete={handleDeleteDesign}
                      onRename={handleRenameDesign}
                      onFavoriteToggle={handleFavoriteToggle}
                      onCollectionToggle={handleCollectionToggle}
                    />
                  ))}
                </MasonryGrid>

                {/* Infinite Scroll loading trigger */}
                {filteredDesigns.length > visibleCount && (
                  <div
                    ref={loaderRef}
                    className="flex justify-center py-8"
                    role="status"
                    aria-label="Loading more designs..."
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                  </div>
                )}
              </>
            )}

          </section>

        </div>
      </div>
    </main>
  );

  function handleResetAllFilters() {
    setFilters({
      search: "",
      style: "",
      roomType: "",
      onlyFavorites: false,
      sortBy: "newest",
    });
    setSelectedCollection("");
  }
}
