
"use client";
import Link from "next/link";

export default function CruiseShipSection() {
  const cruises = [
    { name: "Ocean Pearl", image: "https://media0.giphy.com/media/l4FGI8GoTL7N4DsyI/giphy.gif" },
    { name: "Caribbean Queen", image: "https://media4.giphy.com/media/26n6Gx9moCgsLVbbi/giphy.gif" },
    { name: "Sunset Voyager", image: "https://media3.giphy.com/media/5xtDarK9h0NDTdQ5oGk/giphy.gif" },
    { name: "Atlantic Dream", image: "https://media0.giphy.com/media/3oEjHMrQK4Q1q8pt5C/giphy.gif" },
    { name: "Tropical Breeze", image: "https://media1.giphy.com/media/3oEjHWbXcJd6jZ3l9u/giphy.gif" },
  ];

  return (
    <section className="relative bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Image Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
          {/* Large Feature */}
          <Link href="/ships/ocean-pearl" className="group relative overflow-hidden rounded-2xl ring-1 ring-black/5 md:col-span-2" aria-label={`${cruises[0].name} — view details`}>
            <div className="relative aspect-[16/9] w-full">
              <img src={cruises[0].image} alt={cruises[0].name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute left-4 right-4 bottom-4">
                <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow">Flagship</span>
                <h3 className="mt-2 text-2xl font-bold text-white drop-shadow">{cruises[0].name}</h3>
                <p className="text-white/80 text-sm">Spacious decks, panoramic lounges, and ocean-view suites.</p>
              </div>
            </div>
          </Link>

          {/* Small Tiles */}
          <div className="grid grid-cols-2 gap-4">
            {cruises.slice(1).map((c) => (
              <Link key={c.name} href={`/ships/${slugify(c.name)}`} className="group relative overflow-hidden rounded-2xl ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`${c.name} — view details`}>
                <div className="relative aspect-[4/3] w-full">
                  <img src={c.image} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="truncate text-white text-sm font-semibold drop-shadow">{c.name}</h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Heading + CTA */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Your cruise starts with your ship</h2>
          <p className="mx-auto mt-2 max-w-2xl text-gray-600">Pick from elegant liners to expedition vessels—each with its own vibe.</p>
          <Link href="/ships" className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">Explore our ships</Link>
        </div>
      </div>
    </section>
  );
}

function slugify(s) { return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }
