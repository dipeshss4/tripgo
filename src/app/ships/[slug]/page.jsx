"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle, Star, Calendar, MapPin, Users, Ship, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { shipApi } from "../../../lib/api";
import { useApi } from "../../components/hooks/useApi";
import { getShipsByCategory } from "../../../lib/shipApi";

// Client-only map (uses requestAnimationFrame etc.)
const AnimatedRouteMap = dynamic(() => import("../../components/AnimatedRouteMap"), {
  ssr: false,
});

export default function ShipDetail({ params }) {
  const [relatedShips, setRelatedShips] = useState([]);
  const [recommendedShips, setRecommendedShips] = useState([]);

  // Fetch ship by slug
  const {
    data: ship,
    loading,
    error,
    refetch
  } = useApi(() => shipApi.getBySlug(params.slug), [params.slug]);

  // Fetch related and recommended ships
  useEffect(() => {
    const fetchRelatedShips = async () => {
      try {
        // If ship has a category, fetch ships from that category
        if (ship?.data?.category) {
          const categoryData = await getShipsByCategory(ship.data.category.slug);
          // Filter out current ship and limit to 4
          const filtered = (categoryData.ships || [])
            .filter(s => s.id !== ship.data.id)
            .slice(0, 4);
          setRelatedShips(filtered);
        } else {
          // Fallback: fetch all ships
          const allShips = await shipApi.getAll({ limit: 5 });
          const filtered = (allShips.data || [])
            .filter(s => s.id !== ship?.data?.id)
            .slice(0, 4);
          setRelatedShips(filtered);
        }
      } catch (err) {
        console.error('Error fetching related ships:', err);
      }
    };

    const fetchRecommendedShips = async () => {
      try {
        // Fetch popular/top-rated ships
        const response = await shipApi.getAll({ limit: 5 });
        // Filter out current ship and limit to 3
        const filtered = (response.data || [])
          .filter(s => s.id !== ship?.data?.id)
          .slice(0, 3);
        setRecommendedShips(filtered);
      } catch (err) {
        console.error('Error fetching recommended ships:', err);
      }
    };

    if (ship?.data) {
      fetchRelatedShips();
      fetchRecommendedShips();
    }
  }, [ship]);

  if (loading) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading ship details...</span>
        </div>
      </main>
    );
  }

  if (error || !ship?.data) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ship not found</h1>
          <p className="text-gray-600 mb-4">{error || "The requested ship could not be found."}</p>
          <div className="flex gap-4">
            <button
              onClick={refetch}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
            >
              Try Again
            </button>
            <Link
              href="/ships"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              Back to all ships
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Get ship data from API
  const shipData = ship.data;
  const shipRating = shipData.rating || 0;
  const shipDuration = shipData.duration || 7;
  const shipPrice = shipData.price || 0;
  const shipImage = shipData.posterImage || shipData.image || shipData.images?.[0] || "https://images.unsplash.com/photo-1564654181-27f1dde3a38d?w=1600&q=60&auto=format&fit=crop";

  // Route data
  const routeGeo = shipData.routeGeo || [
    { name: "Embark", lat: 25.7617, lng: -80.1918 },
    { name: "At Sea", lat: 24.0, lng: -78.0 },
    { name: "Port", lat: 23.1, lng: -81.2 },
    { name: "Return", lat: 25.7617, lng: -80.1918 },
  ];
  const routeNames = shipData.routeNames || ["Embark", "At Sea", "Port", "Return"];

  // Other data with fallbacks
  const highlights = shipData.highlights || ["Luxury accommodations", "World-class dining", "Entertainment"];
  const amenities = shipData.amenities || ["Pool", "Spa", "Theater", "Dining"];
  const inclusions = shipData.inclusions || ["All meals", "Entertainment", "Port taxes"];
  const cabins = shipData.cabins || [
    { name: "Interior", size: "16–18 m²", perks: ["Queen/Twin", "Smart TV"] },
    { name: "Oceanview", size: "18–20 m²", perks: ["Sea window", "Mini bar"] },
    { name: "Balcony", size: "20–24 m²", perks: ["Private balcony", "Sofa"] },
    { name: "Suite", size: "30–45 m²", perks: ["Concierge", "Lounge access"] },
  ];
  const faq = shipData.faq || [
    { q: "Do I need a passport?", a: "International ports typically require a passport. Check your local requirements." },
    { q: "What dining is included?", a: "Main dining room and buffet are included. Specialty venues have a surcharge." },
  ];

  // Video data - fully dynamic from backend
  const videos = shipData.videos || {};
  const teasers = videos.teasers || [];
  const galleryVideos = videos.gallery || [];

  return (
    <main className="bg-gray-50">
      {/* ——— HERO: Enhanced image banner with dynamic content ——— */}
      <section className="relative h-[50vh] sm:h-[45vh] md:h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={shipImage}
            alt={shipData.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl text-white">
            {shipData.badge && (
              <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow mb-4">
                {shipData.badge}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight drop-shadow mb-4">
              {shipData.name}
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              {shipData.summary || shipData.description || "Experience an unforgettable ship voyage."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
              {shipRating > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                  <Star className="w-4 h-4" />
                  {shipRating.toFixed(1)} Rating
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                <Calendar className="w-4 h-4" />
                {shipDuration} Days
              </span>
              {shipData.type && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                  <Ship className="w-4 h-4" />
                  {shipData.type}
                </span>
              )}
              {shipData.destination && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                  <MapPin className="w-4 h-4" />
                  {shipData.destination}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ——— QUICK FACTS + ENHANCED BOOKING SECTION ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 pb-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
            <StatCard label="From" value={`$${shipPrice.toLocaleString()}`} subtext="per person" />
            <StatCard label="Duration" value={`${shipDuration} days`} subtext={`${shipDuration - 1} nights`} />
            <StatCard label="Rating" value={shipRating > 0 ? shipRating.toFixed(1) : 'New'} subtext={shipRating > 0 ? '★★★★★' : 'Not rated yet'} />
          </div>

          {/* Enhanced Booking Card */}
          <aside className="sticky top-20 self-start">
            <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Starting price</p>
                  <p className="text-3xl font-extrabold text-gray-900">
                    ${shipPrice.toLocaleString()}
                    <span className="ml-1 text-sm font-medium text-gray-500">/person</span>
                  </p>
                </div>
                {shipRating > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{shipRating.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{shipDuration} days</span>
                </div>
                {shipData.type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ship Type:</span>
                    <span className="font-medium">{shipData.type}</span>
                  </div>
                )}
                {shipData.destination && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-medium">{shipData.destination}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Link
                  href={`/checkout/ships/${shipData.slug || shipData.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-xl"
                >
                  Book This Ship
                </Link>

                <button className="inline-flex w-full items-center justify-center rounded-xl border-2 border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                  Check Availability
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Free cancellation within 24 hours
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  All taxes and port charges included
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ——— ENHANCED ROUTE MAP SECTION ——— */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interactive Route Map
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Follow your ship's journey in real-time across stunning destinations
            </p>
          </div>

          <div className="mt-8">
            <AnimatedRouteMap points={routeGeo} height="500px" />
          </div>

          {/* Enhanced route timeline */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Journey Stops</h3>
            <div className="relative">
              {/* Connection line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 hidden lg:block"
                   style={{marginLeft: '2rem', marginRight: '2rem'}} />

              <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {routeNames.map((name, i) => (
                  <li key={`${name}-${i}`} className="group relative">
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                      {/* Step indicator */}
                      <div className="absolute -top-3 left-6 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {i + 1}
                      </div>

                      {/* Port icon */}
                      <div className="mb-3 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mx-auto">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>

                      {/* Port details */}
                      <div className="text-center">
                        <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wider">
                          {i === 0 ? 'Departure' : i === routeNames.length - 1 ? 'Return' : 'Stop'}
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">{name}</div>
                        {routeGeo[i] && (
                          <div className="text-xs text-gray-500 mt-1">
                            {routeGeo[i].lat.toFixed(2)}°, {routeGeo[i].lng.toFixed(2)}°
                          </div>
                        )}
                      </div>

                      {/* Hover effect */}
                      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-300" />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Route statistics */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">{routeNames.length}</div>
              <div className="text-sm text-gray-600">Total Stops</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-100">
              <div className="text-2xl font-bold text-purple-600">{shipDuration}</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-100">
              <div className="text-2xl font-bold text-indigo-600">
                {routeGeo.length > 1 ?
                  Math.round(
                    routeGeo.reduce((total, point, i) => {
                      if (i === 0) return 0;
                      const prev = routeGeo[i - 1];
                      const distance = Math.sqrt(
                        Math.pow(point.lat - prev.lat, 2) + Math.pow(point.lng - prev.lng, 2)
                      );
                      return total + distance;
                    }, 0) * 111 // Rough km conversion
                  ) : 0
                }km
              </div>
              <div className="text-sm text-gray-600">Distance</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-100">
              <div className="text-2xl font-bold text-emerald-600">24/7</div>
              <div className="text-sm text-gray-600">Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— HIGHLIGHTS (chips) ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="text-2xl font-bold text-gray-900">Highlights</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {highlights.map((h, i) => (
            <span
              key={`${h}-${i}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow ring-1 ring-black/5"
            >
              ✅ {h}
            </span>
          ))}
        </div>
      </section>

      {/* ——— TEASER REELS (all video) - Only show if videos exist ——— */}
      {teasers && teasers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-gray-900">Ship teaser reels</h2>
          <p className="mt-1 text-gray-600">Short loops to feel the vibe onboard.</p>
          <div className="mt-4 no-scrollbar flex gap-4 overflow-x-auto">
            {teasers.map((t, i) => {
              const isYouTube = t.src && (t.src.includes('youtube.com/embed') || t.src.includes('youtu.be'));
              return (
                <div key={`${t.title}-${i}`} className="shrink-0 w-72 overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5">
                  {isYouTube ? (
                    <div className="relative w-full h-44">
                      <iframe
                        src={t.src}
                        title={t.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      className="h-44 w-full object-cover"
                      muted playsInline loop autoPlay preload="metadata"
                    >
                      <source src={t.src} type="video/mp4" />
                    </video>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ——— CABINS ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Cabins & Suites</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cabins.map((cabin, i) => (
            <div key={`${cabin.name}-${i}`} className="rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
              <p className="text-sm uppercase tracking-wide text-gray-500">{cabin.name}</p>
              <p className="mt-1 font-semibold text-gray-900">{cabin.size}</p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                {(cabin.perks || []).map((p, j) => (
                  <li key={`${p}-${j}`}>• {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ——— VIDEO GALLERY GRID - Only show if videos exist ——— */}
      {galleryVideos && galleryVideos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-gray-900">Video Gallery</h2>
          <p className="mt-1 text-gray-600">A moving look at decks, shores, and sunsets.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {galleryVideos.map((src, i) => {
              const isYouTube = src && (src.includes('youtube.com/embed') || src.includes('youtu.be'));
              return (
                <figure key={`${src}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/5">
                  {isYouTube ? (
                    <iframe
                      src={src}
                      title={`Gallery video ${i + 1}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video className="h-full w-full object-cover" muted loop playsInline autoPlay preload="metadata">
                      <source src={src} type="video/mp4" />
                    </video>
                  )}
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* ——— INCLUDES + FAQ ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">What's included</h2>
            <ul className="mt-4 space-y-2">
              {inclusions.map((inc, i) => (
                <li key={`${inc}-${i}`} className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5">
                  ✅ {inc}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
            <div className="mt-4 divide-y divide-gray-200 rounded-2xl bg-white ring-1 ring-black/5">
              {faq.map((f, i) => (
                <details key={`${f.q}-${i}`} className="group p-4">
                  <summary className="cursor-pointer list-none select-none font-semibold text-gray-900">
                    <span className="mr-2 text-primary">?</span>
                    {f.q}
                  </summary>
                  <p className="mt-2 text-gray-700">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ——— RELATED SHIPS ——— */}
      {relatedShips.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {ship?.data?.category ? `More ${ship.data.category.name} Ships` : 'Related Ships'}
                </h2>
                <p className="text-gray-600 mt-1">Explore similar ship experiences</p>
              </div>
            </div>
            {ship?.data?.category && (
              <a
                href={`/ships?category=${ship.data.category.slug}`}
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm hover:shadow-md"
              >
                View All
                <ChevronRight className="w-5 h-5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedShips.map((ship) => (
              <a
                key={ship.id}
                href={`/ships/${ship.slug || ship.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={ship.images?.[0] || "https://images.unsplash.com/photo-1564654181-27f1dde3a38d?w=800&h=600&fit=crop&crop=center"}
                    alt={ship.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      if (!e.target.src.includes('placeholder')) {
                        e.target.src = "https://images.unsplash.com/photo-1564654181-27f1dde3a38d?w=800&h=600&fit=crop&crop=center";
                      }
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <p className="text-sm font-bold text-primary">
                      ${ship.price || '899'}
                    </p>
                  </div>
                  {ship.rating && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white text-sm font-semibold">{ship.rating}</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {ship.name}
                  </h3>

                  <div className="space-y-1.5 mb-3">
                    {ship.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{ship.duration} days</span>
                      </div>
                    )}
                    {ship.departurePort && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="truncate">{ship.departurePort}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-primary font-semibold text-sm group-hover:gap-2 flex items-center gap-1 transition-all">
                      View Details
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ——— RECOMMENDED SHIPS ——— */}
      {recommendedShips.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Recommended For You
                </h2>
                <p className="text-gray-600 mt-1">Handpicked popular ship experiences</p>
              </div>
            </div>
            <a
              href="/ships"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              Browse All
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedShips.map((ship) => (
              <a
                key={ship.id}
                href={`/ships/${ship.slug || ship.id}`}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={ship.images?.[0] || "https://images.unsplash.com/photo-1564654181-27f1dde3a38d?w=800&h=600&fit=crop&crop=center"}
                    alt={ship.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      if (!e.target.src.includes('placeholder')) {
                        e.target.src = "https://images.unsplash.com/photo-1564654181-27f1dde3a38d?w=800&h=600&fit=crop&crop=center";
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <p className="text-sm font-bold text-purple-600">
                      ${ship.price || '899'}
                    </p>
                  </div>
                  {ship.rating && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-900 text-sm font-semibold">{ship.rating}</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {ship.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {ship.description || 'Embark on an unforgettable voyage across the seas'}
                  </p>

                  <div className="space-y-2 mb-4">
                    {ship.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>{ship.duration} days voyage</span>
                      </div>
                    )}
                    {ship.departurePort && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span className="truncate">{ship.departurePort}</span>
                      </div>
                    )}
                    {ship.capacity && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>Up to {ship.capacity} guests</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <span className="text-purple-600 font-semibold text-sm group-hover:gap-2 flex items-center gap-1 transition-all">
                      Explore This Ship
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ——— ENHANCED CTA + breadcrumbs ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 py-10 text-white shadow-2xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h3 className="text-3xl font-bold leading-tight">Ready to sail on {shipData.name}?</h3>
              <p className="mt-2 text-white/90 text-lg">From ${shipPrice.toLocaleString()} per person</p>
              <div className="mt-4 flex items-center gap-6 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {shipDuration} days voyage
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  All ages welcome
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-fit">
              <Link
                href={`/checkout/ships/${shipData.slug || shipData.id}`}
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 font-bold text-primary shadow-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-xl"
              >
                Book Now
              </Link>
              <button className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-8 py-3 font-semibold text-white hover:bg-white/10 transition-all duration-200">
                Get Quote
              </button>
            </div>
          </div>
        </div>

        <nav className="mt-10 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary hover:underline transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ships" className="hover:text-primary hover:underline transition">Ships</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{shipData.name}</span>
        </nav>
      </section>
    </main>
  );
}

/* ——— Enhanced stat card component ——— */
function StatCard({ label, value, subtext }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow ring-1 ring-black/5 hover:shadow-lg transition-shadow duration-200">
      <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/10" />
      <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-gray-900">{value}</p>
      {subtext && (
        <p className="mt-1 text-sm text-gray-600">{subtext}</p>
      )}
    </div>
  );
}