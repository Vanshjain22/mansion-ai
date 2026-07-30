"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Images, Trash2, Download, Heart, Clock, Sparkles, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * My Designs — Gallery of all AI-generated room designs.
 */

interface DesignVariation {
  id: string;
  generatedImageUrl: string;
  aiProvider: string;
  aiModel: string;
  isFavorite: boolean;
  createdAt: number;
}

interface Design {
  id: string;
  title: string;
  originalImageUrl: string;
  roomType: string;
  styleId: string;
  status: string;
  createdAt: number;
  variations: DesignVariation[];
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/designs")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setDesigns(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredDesigns = designs.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.styleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.roomType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this design?")) return;

    try {
      const res = await fetch(`/api/designs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDesigns((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleToggleFavorite = async (variationId: string) => {
    try {
      const res = await fetch(`/api/designs/variations/${variationId}/favorite`, {
        method: "POST",
      });
      if (res.ok) {
        setDesigns((prev) =>
          prev.map((d) => ({
            ...d,
            variations: d.variations.map((v) =>
              v.id === variationId ? { ...v, isFavorite: !v.isFavorite } : v
            ),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
            My Designs
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {designs.length} design{designs.length !== 1 ? "s" : ""} generated
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-primary/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && designs.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto mb-4">
            <Images className="w-8 h-8 text-brand-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No designs yet</h2>
          <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
            Start by uploading a room photo and choosing a design style.
          </p>
          <a
            href="/generation-demo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-cta text-bg-primary font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            Create First Design
          </a>
        </div>
      )}

      {/* Designs Grid */}
      {!loading && filteredDesigns.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDesigns.map((design, i) => {
              const mainImage = design.variations[0]?.generatedImageUrl || design.originalImageUrl;
              const hasGeneration = design.variations.length > 0;

              return (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-2xl bg-bg-secondary border border-border-subtle overflow-hidden hover:border-brand-primary/30 transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {mainImage && mainImage.length > 1 ? (
                      <Image
                        src={mainImage}
                        alt={design.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                        <Images className="w-8 h-8 text-text-tertiary" />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      {hasGeneration && (
                        <>
                          <button
                            onClick={() => handleToggleFavorite(design.variations[0].id)}
                            className={cn(
                              "p-2.5 rounded-xl backdrop-blur-sm transition-colors",
                              design.variations[0].isFavorite
                                ? "bg-red-500/30 text-red-400"
                                : "bg-white/20 text-white hover:bg-white/30"
                            )}
                          >
                            <Heart className="w-4 h-4" fill={design.variations[0].isFavorite ? "currentColor" : "none"} />
                          </button>
                          <a
                            href={design.variations[0].generatedImageUrl}
                            download
                            target="_blank"
                            className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(design.id)}
                        className="p-2.5 rounded-xl bg-white/20 text-white hover:bg-red-500/40 hover:text-red-300 backdrop-blur-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Status Badge */}
                    {design.status !== "completed" && (
                      <div className="absolute top-3 right-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm",
                          design.status === "processing" && "bg-blue-500/30 text-blue-300",
                          design.status === "pending" && "bg-amber-500/30 text-amber-300",
                          design.status === "failed" && "bg-red-500/30 text-red-300"
                        )}>
                          {design.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm truncate">{design.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
                        <Clock className="w-3 h-3" />
                        {formatDate(design.createdAt)}
                      </div>
                      {design.variations.length > 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-medium">
                          {design.variations.length} variations
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* No search results */}
      {!loading && designs.length > 0 && filteredDesigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-text-secondary">
            No designs match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
