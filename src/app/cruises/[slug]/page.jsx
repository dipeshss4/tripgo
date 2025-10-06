"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle, Star, Calendar, MapPin, Users, Ship } from "lucide-react";
import { cruiseApi } from "../../../lib/api";
import { useApi } from "../../components/hooks/useApi";

// Client-only map (uses requestAnimationFrame etc.)
const AnimatedRouteMap = dynamic(() => import("../../components/AnimatedRouteMap"), {
  ssr: false,
});

/** —————————————————————————————————————————————
 * PER-CRUISE DETAIL (VIDEO-FIRST)
 * Use only serializable values.
 * ————————————————————————————————————————————— */
const CRUISE_DETAILS = {
  "caribbean-cruise": {
    poster: "https://images.unsplash.com/photo-1526481280698-8fcc13fd87f8?w=1600&q=60&auto=format&fit=crop",
    video: "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4",
    routeNames: ["Miami", "Nassau", "Cozumel", "Key West", "Miami"],
    routeGeo: [
      { name: "Miami", lat: 25.7617, lng: -80.1918 },
      { name: "Nassau", lat: 25.047, lng: -77.3554 },
      { name: "Cozumel", lat: 20.422, lng: -86.92 },
      { name: "Key West", lat: 24.5551, lng: -81.78 },
      { name: "Miami", lat: 25.7617, lng: -80.1918 },
    ],
    highlights: ["Island excursions", "Sunset deck", "Live music"],
    // Short looping reels (all video, no images)
    teasers: [
      { title: "Sail Away", src: "https://cdn.coverr.co/videos/coverr-slow-waves-7284/1080p.mp4" },
      { title: "Island Dock", src: "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4" },
      { title: "Blue Hour", src: "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4" },
    ],
    galleryVideos: [
      "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4",
      "https://www.w3schools.com/html/mov_bbb.mp4",
      "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4",
    ],
  },
  "mediterranean-cruise": {
    poster: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f8?w=1600&q=60&auto=format&fit=crop",
    video: "https://cdn.coverr.co/videos/coverr-mediterranean-sea-8933/1080p.mp4",
    routeNames: ["Barcelona", "Cannes", "Rome", "Santorini", "Athens"],
    routeGeo: [
      { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
      { name: "Cannes", lat: 43.5528, lng: 7.0174 },
      { name: "Rome", lat: 41.9028, lng: 12.4964 },
      { name: "Santorini", lat: 36.3932, lng: 25.4615 },
      { name: "Athens", lat: 37.9838, lng: 23.7275 },
    ],
    highlights: ["Old towns & cuisine", "Coastal sunsets", "Historic ports"],
    teasers: [
      { title: "Harbor Mornings", src: "https://cdn.coverr.co/videos/coverr-sunset-over-the-harbor-6138/1080p.mp4" },
      { title: "Coastal Run", src: "https://cdn.coverr.co/videos/coverr-coastline-5241/1080p.mp4" },
    ],
    galleryVideos: [
      "https://cdn.coverr.co/videos/coverr-coastal-waves-2078/1080p.mp4",
      "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4",
    ],
  },
  "alaskan-cruise": {
    poster: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=60&auto=format&fit=crop",
    video: "https://cdn.coverr.co/videos/coverr-waterfall-valley-2076/1080p.mp4",
    routeNames: ["Vancouver", "Ketchikan", "Juneau", "Skagway", "Vancouver"],
    routeGeo: [
      { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
      { name: "Ketchikan", lat: 55.3422, lng: -131.6461 },
      { name: "Juneau", lat: 58.3019, lng: -134.4197 },
      { name: "Skagway", lat: 59.4583, lng: -135.3139 },
      { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
    ],
    highlights: ["Glaciers & fjords", "Whale watching", "Scenic rail"],
    teasers: [
      { title: "Fjord Glide", src: "https://cdn.coverr.co/videos/coverr-icebergs-ice-3961/1080p.mp4" },
      { title: "Wild North", src: "https://cdn.coverr.co/videos/coverr-mountain-lake-3585/1080p.mp4" },
    ],
    galleryVideos: [
      "https://cdn.coverr.co/videos/coverr-icebergs-ice-3961/1080p.mp4",
      "https://cdn.coverr.co/videos/coverr-waterfall-valley-2076/1080p.mp4",
    ],
  },
};

/** —————————————————————————————————————————————
 * DEFAULTS (also video-first)
 * ————————————————————————————————————————————— */
const DEFAULTS = {
  poster: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=60&auto=format&fit=crop",
  video: "https://www.w3schools.com/html/mov_bbb.mp4",
  routeNames: ["Embark", "At Sea", "Port", "Return"],
  routeGeo: [
    { name: "Embark", lat: 25.7617, lng: -80.1918 },
    { name: "At Sea", lat: 24.0, lng: -78.0 },
    { name: "Port", lat: 23.1, lng: -81.2 },
    { name: "Return", lat: 25.7617, lng: -80.1918 },
  ],
  highlights: ["Pool deck", "Evening shows", "Buffet & dining"],
  cabins: [
    { name: "Interior", size: "16–18 m²", perks: ["Queen/Twin", "Smart TV"] },
    { name: "Oceanview", size: "18–20 m²", perks: ["Sea window", "Mini bar"] },
    { name: "Balcony", size: "20–24 m²", perks: ["Private balcony", "Sofa"] },
    { name: "Suite", size: "30–45 m²", perks: ["Concierge", "Lounge access"] },
  ],
  includes: [
    "All meals in main dining & buffet",
    "Evening entertainment",
    "Pools & fitness center",
    "Kids & teens programs",
    "Port taxes & fees",
  ],
  faq: [
    { q: "Do I need a passport?", a: "International ports typically require a passport. Check your local requirements." },
    { q: "What dining is included?", a: "Main dining room and buffet are included. Specialty venues have a surcharge." },
  ],
  teasers: [
    { title: "Open Sea", src: "https://cdn.coverr.co/videos/coverr-slow-waves-7284/1080p.mp4" },
    { title: "Golden Hour", src: "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4" },
  ],
  galleryVideos: [
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://cdn.coverr.co/videos/coverr-slow-waves-7284/1080p.mp4",
  ],
};

export default function CruiseDetail({ params }) {
  // Use real API calls
  const {
    data: cruise,
    loading,
    error,
    refetch
  } = useApi(() => cruiseApi.getBySlug(params.slug), [params.slug]);

  // Get route data from backend API
  const {
    data: routeData,
    loading: routeLoading
  } = useApi(() => cruiseApi.getRoute(params.slug), [params.slug]);

  // Keep static data as fallback
  const staticCruises = {
        "mediterranean-majesty": {
          id: 1,
          name: "Mediterranean Majesty",
          description: "Sail through ancient civilizations, pristine beaches, and vibrant cultures across the Mediterranean Sea.",
          price: 1299,
          originalPrice: 1699,
          images: ["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"],
          rating: 4.9,
          reviews: 2847,
          duration: "8 days",
          departure: "Barcelona, Spain",
          slug: "mediterranean-majesty",
          highlights: ["Italian Riviera", "Greek Islands", "French Riviera"],
          amenities: ["Michelin Dining", "Spa & Wellness", "Live Entertainment"],
          overview: "Experience the rich history and stunning coastlines of the Mediterranean on this luxury cruise.",
          inclusions: ["All meals", "Entertainment", "Port taxes"],
          routeNames: ["Barcelona", "Nice", "Rome", "Santorini", "Barcelona"],
          routeGeo: [
            { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
            { name: "Nice", lat: 43.5528, lng: 7.0174 },
            { name: "Rome", lat: 41.9028, lng: 12.4964 },
            { name: "Santorini", lat: 36.3932, lng: 25.4615 },
            { name: "Barcelona", lat: 41.3851, lng: 2.1734 }
          ],
          teasers: [
            { title: "Harbor Mornings", src: "https://cdn.coverr.co/videos/coverr-sunset-over-the-harbor-6138/1080p.mp4" },
            { title: "Coastal Run", src: "https://cdn.coverr.co/videos/coverr-coastline-5241/1080p.mp4" }
          ],
          galleryVideos: [
            "https://cdn.coverr.co/videos/coverr-coastal-waves-2078/1080p.mp4",
            "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4"
          ],
          cabins: [
            { name: "Interior", size: "16–18 m²", perks: ["Queen/Twin", "Smart TV"] },
            { name: "Oceanview", size: "18–20 m²", perks: ["Sea window", "Mini bar"] },
            { name: "Balcony", size: "20–24 m²", perks: ["Private balcony", "Sofa"] },
            { name: "Suite", size: "30–45 m²", perks: ["Concierge", "Lounge access"] }
          ],
          faq: [
            { q: "Do I need a passport?", a: "Yes, for Mediterranean ports a passport is required." },
            { q: "What dining is included?", a: "Main dining room and buffet are included. Specialty venues have a surcharge." }
          ],
          itinerary: [
            { day: 1, port: "Barcelona, Spain", activities: "Embarkation" },
            { day: 2, port: "Nice, France", activities: "City tour, French Riviera" },
            { day: 3, port: "Rome, Italy", activities: "Colosseum, Vatican" },
            { day: 4, port: "Santorini, Greece", activities: "Blue domes, sunset" },
            { day: 5, port: "Mykonos, Greece", activities: "Beaches, nightlife" },
            { day: 6, port: "At Sea", activities: "Spa, pools, shows" },
            { day: 7, port: "Valencia, Spain", activities: "City center, paella" },
            { day: 8, port: "Barcelona, Spain", activities: "Disembarkation" }
          ]
        },
        "caribbean-paradise": {
          id: 2,
          name: "Caribbean Paradise",
          description: "Experience crystal-clear waters, white sand beaches, and tropical luxury in the Caribbean.",
          price: 999,
          originalPrice: 1299,
          images: ["https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80"],
          rating: 4.8,
          reviews: 3241,
          duration: "7 days",
          departure: "Miami, Florida",
          slug: "caribbean-paradise",
          highlights: ["Pristine Beaches", "Snorkeling", "Island Hopping"],
          amenities: ["Water Sports", "Tropical Spa", "Beach Bar"],
          overview: "Discover the tropical paradise of the Caribbean with pristine beaches and crystal-clear waters.",
          inclusions: ["All meals", "Water sports", "Entertainment"],
          routeNames: ["Miami", "Nassau", "Cozumel", "Key West", "Miami"],
          routeGeo: [
            { name: "Miami", lat: 25.7617, lng: -80.1918 },
            { name: "Nassau", lat: 25.047, lng: -77.3554 },
            { name: "Cozumel", lat: 20.422, lng: -86.92 },
            { name: "Key West", lat: 24.5551, lng: -81.78 },
            { name: "Miami", lat: 25.7617, lng: -80.1918 }
          ],
          teasers: [
            { title: "Sail Away", src: "https://cdn.coverr.co/videos/coverr-slow-waves-7284/1080p.mp4" },
            { title: "Island Dock", src: "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4" },
            { title: "Blue Hour", src: "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4" }
          ],
          galleryVideos: [
            "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4",
            "https://www.w3schools.com/html/mov_bbb.mp4",
            "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4"
          ],
          cabins: [
            { name: "Interior", size: "16–18 m²", perks: ["Queen/Twin", "Smart TV"] },
            { name: "Oceanview", size: "18–20 m²", perks: ["Sea window", "Mini bar"] },
            { name: "Balcony", size: "20–24 m²", perks: ["Private balcony", "Sofa"] },
            { name: "Suite", size: "30–45 m²", perks: ["Concierge", "Lounge access"] }
          ],
          faq: [
            { q: "Do I need a passport?", a: "International ports typically require a passport. Check your local requirements." },
            { q: "What dining is included?", a: "Main dining room and buffet are included. Specialty venues have a surcharge." }
          ],
          itinerary: [
            { day: 1, port: "Miami, Florida", activities: "Embarkation" },
            { day: 2, port: "At Sea", activities: "Pool deck, shows" },
            { day: 3, port: "Nassau, Bahamas", activities: "Swimming, shopping" },
            { day: 4, port: "Cozumel, Mexico", activities: "Snorkeling, ruins" },
            { day: 5, port: "Key West, Florida", activities: "Sunset, fishing" },
            { day: 6, port: "At Sea", activities: "Spa, dining" },
            { day: 7, port: "Miami, Florida", activities: "Disembarkation" }
          ]
        },
        "alaskan-wilderness": {
          id: 3,
          name: "Alaskan Wilderness",
          description: "Journey through breathtaking glaciers, wildlife, and the untouched beauty of Alaska.",
          price: 1499,
          originalPrice: 1899,
          images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80"],
          rating: 4.9,
          reviews: 1876,
          duration: "10 days",
          departure: "Seattle, Washington",
          slug: "alaskan-wilderness",
          highlights: ["Glacier Bay", "Wildlife Viewing", "Scenic Fjords"],
          amenities: ["Expedition Deck", "Wildlife Naturalist", "Thermal Pools"],
          overview: "Explore the last frontier with glaciers, wildlife, and breathtaking natural beauty.",
          inclusions: ["All meals", "Wildlife guide", "Expedition gear"],
          routeNames: ["Seattle", "Ketchikan", "Juneau", "Skagway", "Seattle"],
          routeGeo: [
            { name: "Seattle", lat: 47.6062, lng: -122.3321 },
            { name: "Ketchikan", lat: 55.3422, lng: -131.6461 },
            { name: "Juneau", lat: 58.3019, lng: -134.4197 },
            { name: "Skagway", lat: 59.4583, lng: -135.3139 },
            { name: "Seattle", lat: 47.6062, lng: -122.3321 }
          ],
          teasers: [
            { title: "Glacier Views", src: "https://cdn.coverr.co/videos/coverr-icebergs-ice-3961/1080p.mp4" },
            { title: "Wildlife Watch", src: "https://cdn.coverr.co/videos/coverr-mountain-lake-3585/1080p.mp4" }
          ],
          galleryVideos: [
            "https://cdn.coverr.co/videos/coverr-icebergs-ice-3961/1080p.mp4",
            "https://cdn.coverr.co/videos/coverr-waterfall-valley-2076/1080p.mp4"
          ],
          cabins: [
            { name: "Interior", size: "16–18 m²", perks: ["Queen/Twin", "Smart TV"] },
            { name: "Oceanview", size: "18–20 m²", perks: ["Sea window", "Mini bar"] },
            { name: "Balcony", size: "20–24 m²", perks: ["Private balcony", "Sofa"] },
            { name: "Suite", size: "30–45 m²", perks: ["Concierge", "Lounge access"] }
          ],
          faq: [
            { q: "What should I pack for Alaska?", a: "Warm layers, waterproof jacket, and comfortable walking shoes are essential." },
            { q: "Can I see the Northern Lights?", a: "During summer cruising season, the Northern Lights are not visible due to extended daylight hours." }
          ],
          itinerary: [
            { day: 1, port: "Seattle, Washington", activities: "Embarkation" },
            { day: 2, port: "At Sea", activities: "Scenic cruising" },
            { day: 3, port: "Ketchikan, Alaska", activities: "Totem poles, fishing" },
            { day: 4, port: "Juneau, Alaska", activities: "Glaciers, whales" },
            { day: 5, port: "Skagway, Alaska", activities: "Gold rush history" },
            { day: 6, port: "Glacier Bay", activities: "Glacier viewing" },
            { day: 7, port: "Haines, Alaska", activities: "Eagles, wilderness" },
            { day: 8, port: "At Sea", activities: "Scenic cruising" },
            { day: 9, port: "Victoria, BC", activities: "Gardens, tea" },
            { day: 10, port: "Seattle, Washington", activities: "Disembarkation" }
          ]
        }
      };

  if (loading) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading cruise details...</span>
        </div>
      </main>
    );
  }

  if (error || !cruise) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cruise not found</h1>
          <p className="text-gray-600 mb-4">{error || "The requested cruise could not be found."}</p>
          <div className="flex gap-4">
            <button
              onClick={refetch}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
            >
              Try Again
            </button>
            <Link
              href="/cruises"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              Back to all cruises
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Get cruise data from API or fallback to static data
  const cruiseData = cruise.data || staticCruises[params.slug] || {};
  const cruiseRating = cruiseData.rating || 0;
  const cruiseDuration = cruiseData.duration || 7;
  const cruisePrice = cruiseData.price || 0;
  const cruiseImage = cruiseData.image || cruiseData.images?.[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=60&auto=format&fit=crop";

  // Use API route data if available, otherwise fallback to static data
  const apiRouteData = routeData?.data || {};
  const fallbackRouteGeo = [
    { name: "Embark", lat: 25.7617, lng: -80.1918 },
    { name: "At Sea", lat: 24.0, lng: -78.0 },
    { name: "Port", lat: 23.1, lng: -81.2 },
    { name: "Return", lat: 25.7617, lng: -80.1918 },
  ];
  const fallbackRouteNames = ["Embark", "At Sea", "Port", "Return"];

  const defaultRouteGeo = apiRouteData.routeGeo || fallbackRouteGeo;
  const defaultRouteNames = apiRouteData.routeNames || fallbackRouteNames;
  const defaultHighlights = apiRouteData.highlights || cruiseData.highlights || ["Luxury accommodations", "World-class dining", "Entertainment"];
  const defaultAmenities = cruiseData.amenities || ["Pool", "Spa", "Theater", "Dining"];
  const defaultInclusions = cruiseData.inclusions || cruiseData.includes || ["All meals", "Entertainment", "Port taxes"];
  const defaultCabins = cruiseData.cabins || DEFAULTS.cabins;
  const defaultFaq = cruiseData.faq || DEFAULTS.faq;
  const defaultTeasers = cruiseData.teasers || DEFAULTS.teasers;
  const defaultGalleryVideos = cruiseData.galleryVideos || DEFAULTS.galleryVideos;

  return (
    <main className="bg-gray-50">
      {/* ——— HERO: Enhanced image banner with dynamic content ——— */}
      <section className="relative h-[50vh] sm:h-[45vh] md:h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={cruiseImage}
            alt={cruiseData.name || cruiseData.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl text-white">
            {cruiseData.badge && (
              <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow mb-4">
                {cruiseData.badge}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight drop-shadow mb-4">
              {cruiseData.name || cruiseData.title}
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              {cruiseData.description || cruiseData.summary || "Experience an unforgettable cruise adventure."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
              {cruiseRating > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                  <Star className="w-4 h-4" />
                  {cruiseRating.toFixed(1)} Rating
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                <Calendar className="w-4 h-4" />
                {cruiseDuration} Days
              </span>
              {cruiseData.type && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                  <Ship className="w-4 h-4" />
                  {cruiseData.type}
                </span>
              )}
              {cruiseData.destination && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                  <MapPin className="w-4 h-4" />
                  {cruiseData.destination}
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
            <StatCard label="From" value={`$${cruisePrice.toLocaleString()}`} subtext="per person" />
            <StatCard label="Duration" value={`${cruiseDuration} days`} subtext={`${cruiseDuration - 1} nights`} />
            <StatCard label="Rating" value={cruiseRating > 0 ? cruiseRating.toFixed(1) : 'New'} subtext={cruiseRating > 0 ? '★★★★★' : 'Not rated yet'} />
          </div>

          {/* Enhanced Booking Card */}
          <aside className="sticky top-20 self-start">
            <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Starting price</p>
                  <p className="text-3xl font-extrabold text-gray-900">
                    ${cruisePrice.toLocaleString()}
                    <span className="ml-1 text-sm font-medium text-gray-500">/person</span>
                  </p>
                </div>
                {cruiseRating > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{cruiseRating.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{cruiseDuration} days</span>
                </div>
                {cruiseData.type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cruise Type:</span>
                    <span className="font-medium">{cruiseData.type}</span>
                  </div>
                )}
                {cruiseData.destination && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-medium">{cruiseData.destination}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Link
                  href={`/checkout/cruises/${cruiseData.slug || cruiseData.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-xl"
                >
                  Book This Cruise
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
              Follow your cruise ship's journey in real-time across stunning destinations
            </p>
          </div>

          <div className="mt-8">
            <AnimatedRouteMap points={defaultRouteGeo} height="500px" />
          </div>

          {/* Enhanced route timeline */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Journey Stops</h3>
            <div className="relative">
              {/* Connection line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 hidden lg:block"
                   style={{marginLeft: '2rem', marginRight: '2rem'}} />

              <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {defaultRouteNames.map((name, i) => (
                  <li key={name} className="group relative">
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
                          {i === 0 ? 'Departure' : i === defaultRouteNames.length - 1 ? 'Return' : 'Stop'}
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">{name}</div>
                        {defaultRouteGeo[i] && (
                          <div className="text-xs text-gray-500 mt-1">
                            {defaultRouteGeo[i].lat.toFixed(2)}°, {defaultRouteGeo[i].lng.toFixed(2)}°
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
              <div className="text-2xl font-bold text-blue-600">{defaultRouteNames.length}</div>
              <div className="text-sm text-gray-600">Total Stops</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-100">
              <div className="text-2xl font-bold text-purple-600">{cruiseDuration}</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-gray-100">
              <div className="text-2xl font-bold text-indigo-600">
                {defaultRouteGeo.length > 1 ?
                  Math.round(
                    defaultRouteGeo.reduce((total, point, i) => {
                      if (i === 0) return 0;
                      const prev = defaultRouteGeo[i - 1];
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
          {defaultHighlights.map((h, i) => (
            <span
              key={`${h}-${i}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow ring-1 ring-black/5"
            >
              ✅ {h}
            </span>
          ))}
        </div>
      </section>

      {/* ——— TEASER REELS (all video) ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-900">Ship teaser reels</h2>
        <p className="mt-1 text-gray-600">Short loops to feel the vibe onboard.</p>
        <div className="mt-4 no-scrollbar flex gap-4 overflow-x-auto">
          {defaultTeasers.map((t, i) => (
            <div key={`${t.title}-${i}`} className="shrink-0 w-72 overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5">
              <video
                className="h-44 w-full object-cover"
                muted playsInline loop autoPlay preload="metadata"
              >
                <source src={t.src} type="video/mp4" />
              </video>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800">{t.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ——— CABINS ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Cabins & Suites</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {defaultCabins.map((cabin, i) => (
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

      {/* ——— VIDEO GALLERY GRID ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
        <p className="mt-1 text-gray-600">A moving look at decks, shores, and sunsets.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
          {defaultGalleryVideos.map((src, i) => (
            <figure key={`${src}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/5">
              <video className="h-full w-full object-cover" muted loop playsInline autoPlay preload="metadata">
                <source src={src} type="video/mp4" />
              </video>
            </figure>
          ))}
        </div>
      </section>

      {/* ——— INCLUDES + FAQ ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">What’s included</h2>
            <ul className="mt-4 space-y-2">
              {defaultInclusions.map((inc, i) => (
                <li key={`${inc}-${i}`} className="rounded-xl bg-white p-4 shadow ring-1 ring-black/5">
                  ✅ {inc}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
            <div className="mt-4 divide-y divide-gray-200 rounded-2xl bg-white ring-1 ring-black/5">
              {defaultFaq.map((f, i) => (
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

      {/* ——— ENHANCED CTA + breadcrumbs ——— */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 py-10 text-white shadow-2xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h3 className="text-3xl font-bold leading-tight">Ready to sail on {cruiseData.name || cruiseData.title}?</h3>
              <p className="mt-2 text-white/90 text-lg">From ${cruisePrice.toLocaleString()} per person</p>
              <div className="mt-4 flex items-center gap-6 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {cruiseDuration} days cruise
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  All ages welcome
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-fit">
              <Link
                href={`/checkout/cruises/${cruiseData.slug || cruiseData.id}`}
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
          <Link href="/cruises" className="hover:text-primary hover:underline transition">Cruises</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{cruiseData.name || cruiseData.title}</span>
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