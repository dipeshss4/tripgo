"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { cruiseApi } from "../../lib/api";
import { useApi } from "./hooks/useApi";

export default function PopularCruises() {
    const { data: cruisesData, loading, error, refetch } = useApi(() => cruiseApi.getAll({ limit: 8 }));
    const cruises = cruisesData?.data || [];

    const scrollerRef = useRef(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    const updateArrows = () => {
        const el = scrollerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanLeft(scrollLeft > 0);
        setCanRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        updateArrows();
        const onScroll = () => updateArrows();
        const onResize = () => updateArrows();
        el.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        return () => {
            el.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    const scrollByCards = (dir = 1) => {
        const el = scrollerRef.current;
        if (!el) return;
        // scroll roughly one card (including gap)
        const card = el.querySelector("[data-card]");
        const delta = card ? (card.clientWidth + 24) * dir : el.clientWidth * 0.9 * dir;
        el.scrollBy({ left: delta, behavior: "smooth" });
    };

    if (loading) {
        return (
            <section className="relative py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <header className="mb-8 text-center">
                        <p className="text-sm uppercase tracking-widest text-gray-500">Top Picks</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Popular Cruises
                        </h2>
                        <p className="mt-3 text-gray-600">Curated routes with great reviews and flexible dates.</p>
                    </header>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-gray-600">Loading cruises...</span>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="relative py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <header className="mb-8 text-center">
                        <p className="text-sm uppercase tracking-widest text-gray-500">Top Picks</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Popular Cruises
                        </h2>
                        <p className="mt-3 text-gray-600">Curated routes with great reviews and flexible dates.</p>
                    </header>
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load cruises</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={refetch}
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative py-16 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-8 text-center">
                    <p className="text-sm uppercase tracking-widest text-gray-500">
                        Top Picks
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Popular Cruises
                    </h2>
                    <p className="mt-3 text-gray-600">
                        Curated routes with great reviews and flexible dates.
                    </p>
                </header>

                {cruises.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No cruises available at the moment.</p>
                    </div>
                ) : (
                    <>
                        {/* Carousel wrapper */}
                        <div className="relative">
                    {/* Left button */}
                    <button
                        aria-label="Previous"
                        onClick={() => scrollByCards(-1)}
                        disabled={!canLeft}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5 transition
              ${canLeft ? "opacity-100" : "opacity-40 cursor-not-allowed"}`}
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-900" />
                    </button>

                    {/* Right button */}
                    <button
                        aria-label="Next"
                        onClick={() => scrollByCards(1)}
                        disabled={!canRight}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5 transition
              ${canRight ? "opacity-100" : "opacity-40 cursor-not-allowed"}`}
                    >
                        <ChevronRight className="h-5 w-5 text-gray-900" />
                    </button>

                    {/* Scroller */}
                    <div
                        ref={scrollerRef}
                        className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 scroll-smooth"
                    >
                        {cruises.map((c) => (
                            <article
                                key={c.id}
                                data-card
                                className="snap-start shrink-0 w-[88%] sm:w-[60%] lg:w-[32%] rounded-2xl bg-white shadow ring-1 ring-black/5 overflow-hidden"
                            >
                                <div className="relative h-56 w-full">
                                    <img
                                        src={c.images?.[0] || c.image || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80"}
                                        alt={c.name || c.title}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                                    {c.badge && (
                                        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900 shadow">
                      {c.badge}
                    </span>
                                    )}
                                </div>

                                <div className="relative -mt-6 px-4 pb-5">
                                    <div className="rounded-2xl bg-white/90 p-5 backdrop-blur-md ring-1 ring-black/5">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {c.name || c.title}
                                            </h3>
                                            <div
                                                className="shrink-0 text-sm font-medium text-yellow-600"
                                                aria-label={`${c.rating} out of 5`}
                                            >
                                                <span className="mr-1">{c.rating || '4.5'}</span>★
                                            </div>
                                        </div>

                                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                                            {c.description}
                                        </p>

                                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                        ⏱ {c.duration || '7 days'}
                      </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                        🚢 {c.type || 'Cruise'}
                      </span>
                                        </div>

                                        <div className="mt-5 flex items-end justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-gray-500">
                                                    From
                                                </p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    ${Number(c.price || 0).toLocaleString()}
                                                    <span className="ml-1 text-sm font-medium text-gray-500">
                            /person
                          </span>
                                                </p>
                                            </div>

                                            <Link
                                                href={`/cruises/${c.id}`}
                                                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                        {/* View all */}
                        <div className="mt-10 text-center">
                            <Link
                                href="/cruises"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                            >
                                Browse all cruises
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}