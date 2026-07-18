import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const GALLERY_IMAGES = [
  { src: "/images/landing/gallery-1.png", alt: "Luxury kitchen design" },
  { src: "/images/landing/gallery-2.png", alt: "Premium bedroom design" },
  { src: "/images/landing/gallery-3.png", alt: "Spa-like bathroom design" },
  { src: "/images/landing/gallery-4.png", alt: "Executive home office" },
  { src: "/images/landing/gallery-5.png", alt: "Elegant dining room" },
  { src: "/images/landing/gallery-6.png", alt: "Rooftop terrace lounge" },
];

export function GalleryShowcase() {
  return (
    <section id="gallery" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-bg-secondary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/20 bg-brand-primary/5 mb-6">
              <Sparkles className="w-3 h-3 text-brand-primary" />
              <span className="text-[10px] font-medium font-[family-name:var(--font-manrope)] text-brand-primary tracking-widest uppercase">
                AI-Generated Spaces
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] mb-4 leading-tight">
              Stunning Spaces,
              <br />
              <span className="text-gradient italic">Endless Possibilities</span>
            </h2>

            <p className="text-text-secondary mb-8 leading-relaxed max-w-md">
              From cozy corners to grand living rooms, our AI brings your
              imagination to life. Explore our gallery of AI-generated
              transformations.
            </p>

            <Link
              href="/generation-demo"
              className="inline-flex items-center gap-2 px-6 py-3 border border-brand-primary/40 text-brand-primary font-semibold font-[family-name:var(--font-manrope)] text-sm rounded-xl hover:bg-brand-primary/10 hover:border-brand-primary/60 transition-all duration-300"
            >
              View Full Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right — Image Grid */}
          <div className="grid grid-cols-3 gap-3">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden border border-border-subtle group cursor-pointer"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 33vw, 200px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
