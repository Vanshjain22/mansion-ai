/*
 * Trust logos section — rendered as styled text to avoid external SVG dependencies.
 * Each "logo" uses a distinct font styling to mimic brand marks.
 */

const BRANDS = [
  { name: "houzz", display: "houzz", style: "font-bold lowercase tracking-tight" },
  { name: "archdaily", display: "ArchDaily", style: "font-semibold tracking-tight" },
  { name: "dezeen", display: "dezeen", style: "font-bold lowercase tracking-widest" },
  { name: "interior-design", display: "Interior Design", style: "font-medium italic" },
  { name: "home-garden", display: "Home & Garden", style: "font-serif font-bold" },
  { name: "livingetc", display: "Livingetc", style: "font-medium tracking-tight" },
  { name: "design-milk", display: "design milk", style: "font-light lowercase tracking-widest" },
];

export function TrustLogos() {
  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Label */}
        <p className="text-center text-[10px] font-medium font-[family-name:var(--font-manrope)] text-text-tertiary tracking-[0.25em] uppercase mb-8">
          Trusted by Professionals & Leading Brands
        </p>

        {/* Logo Row */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {BRANDS.map((brand) => (
            <div
              key={brand.name}
              className={`text-text-tertiary/60 hover:text-text-secondary/80 transition-colors duration-300 text-base sm:text-lg select-none cursor-default ${brand.style}`}
            >
              {brand.display}
            </div>
          ))}
        </div>

        {/* Bottom Divider */}
        <div className="section-divider mt-12" />
      </div>
    </section>
  );
}
