"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { cruiseApi } from "../../lib/api";
import { useApi } from "./hooks/useApi";

export default function CruiseShipSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredShip, setHoveredShip] = useState(null);
  const sectionRef = useRef(null);

  // Fetch cruises from backend
  const { data: cruisesData, loading, error, refetch } = useApi(() => cruiseApi.getAll({ limit: 5 }));
  const backendCruises = cruisesData?.data || [];

  // Map backend data to component format with fallback to defaults
  const cruises = backendCruises.length > 0
    ? backendCruises.map((cruise, index) => ({
        id: cruise.id,
        name: cruise.name || cruise.title || `Cruise ${index + 1}`,
        image: cruise.images?.[0] || cruise.image || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80",
        description: cruise.description || "Discover unforgettable experiences on the high seas.",
        capacity: cruise.capacity || "3,000",
        amenities: cruise.amenities || 20,
        rating: cruise.rating || 4.5,
        tag: cruise.badge || cruise.tag || (index === 0 ? "Featured" : "Popular"),
        startingPrice: cruise.price ? `$${cruise.price}` : "$899",
        destinations: cruise.destination || cruise.route || "Multiple Destinations",
        slug: cruise.slug || slugify(cruise.name || cruise.title || `cruise-${cruise.id}`),
      }))
    : [
        // Fallback data if API fails or returns empty
        {
          id: 1,
          name: "Ocean Pearl",
          image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80",
          description: "Spacious decks, panoramic lounges, and ocean-view suites.",
          capacity: "3,500",
          amenities: 24,
          rating: 4.8,
          tag: "Flagship",
          startingPrice: "$899",
          destinations: "Caribbean, Mediterranean",
          slug: "ocean-pearl",
        },
      ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % cruises.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [cruises.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % cruises.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + cruises.length) % cruises.length);
  };

  // Loading state
  if (loading) {
    return (
      <section className="relative bg-gradient-to-b from-white via-blue-50/30 to-white py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Featured Fleet
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-4">
              Your cruise starts with your ship
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-gray-600 text-lg">Loading our amazing fleet...</span>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="relative bg-gradient-to-b from-white via-blue-50/30 to-white py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Featured Fleet
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-4">
              Your cruise starts with your ship
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"></line>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"></line>
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load ships</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-white via-blue-50/30 to-white py-20 overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading Section */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Featured Fleet
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-4">
            Your cruise starts with your ship
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-lg text-gray-600">
            Discover our fleet of world-class vessels, each offering unique experiences and unforgettable journeys
          </p>
        </div>

        {/* Featured Carousel */}
        <div
          className={`relative mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            {cruises.map((cruise, index) => (
              <div
                key={cruise.id || cruise.name}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <img
                  src={cruise.image}
                  alt={cruise.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center">
                  <div className="px-8 md:px-16 max-w-2xl space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                        {cruise.tag}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="text-white font-semibold">{cruise.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">
                      {cruise.name}
                    </h3>

                    <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                      {cruise.description}
                    </p>

                    {/* Ship Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Capacity</p>
                        <p className="text-white text-2xl font-bold">{cruise.capacity}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Amenities</p>
                        <p className="text-white text-2xl font-bold">{cruise.amenities}+</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-white/70 text-xs uppercase tracking-wide mb-1">From</p>
                        <p className="text-white text-2xl font-bold">{cruise.startingPrice}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{cruise.destinations}</span>
                    </div>

                    <Link
                      href={`/cruises/${cruise.slug || cruise.id}`}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      Explore This Ship
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 border border-white/30 z-10"
              aria-label="Previous ship"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 border border-white/30 z-10"
              aria-label="Next ship"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {cruises.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ship Grid */}
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12 transition-all duration-1000 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {cruises.map((cruise, index) => (
            <Link
              key={cruise.id || cruise.name}
              href={`/cruises/${cruise.slug || cruise.id}`}
              onMouseEnter={() => setHoveredShip(index)}
              onMouseLeave={() => setHoveredShip(null)}
              className="group relative overflow-hidden rounded-2xl ring-1 ring-black/5 hover:ring-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[3/4] w-full">
                <img
                  src={cruise.image}
                  alt={cruise.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/80"></div>

                {/* Hover Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-blue-600/90 to-purple-600/50 transition-opacity duration-300 ${
                    hoveredShip === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-2">
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="font-semibold">{cruise.rating}</span>
                    </div>
                    <p className="text-xs opacity-90">{cruise.amenities}+ Amenities</p>
                    <p className="text-lg font-bold">{cruise.startingPrice}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="absolute top-3 left-3">
                  <span className="inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    {cruise.tag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-white text-sm font-bold drop-shadow-lg leading-tight">
                    {cruise.name}
                  </h4>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div
          className={`text-center transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Link
            href="/cruises"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Explore All Ships
            <svg
              className="w-6 h-6 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
