"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { cruiseApi } from "../../lib/api";
import { getCruiseCategories, formatDepartureDates, calculateDeparturePrice, getDepartureStatusColor, getDepartureStatusText } from "../../lib/cruiseApi";
import { useApi } from "./hooks/useApi";

export default function CruiseShipSectionEnhanced() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredShip, setHoveredShip] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const sectionRef = useRef(null);

  // Fetch cruises from backend
  const { data: cruisesData, loading, error, refetch } = useApi(() => cruiseApi.getAll({ limit: 10 }));
  const backendCruises = cruisesData?.data || [];

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      const cats = await getCruiseCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  // Filter cruises by category
  const filteredCruises = selectedCategory === 'all'
    ? backendCruises
    : backendCruises.filter(cruise => cruise.category?.slug === selectedCategory);

  // Map backend data to component format
  const cruises = filteredCruises.length > 0
    ? filteredCruises.map((cruise, index) => ({
        id: cruise.id,
        name: cruise.name || `Cruise ${index + 1}`,
        image: cruise.images?.[0] || cruise.image || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80",
        description: cruise.description || "Discover unforgettable experiences on the high seas.",
        capacity: cruise.capacity || "3,000",
        amenities: cruise.amenities?.length || 20,
        rating: cruise.rating || 4.5,
        tag: cruise.category?.name || "Popular",
        categoryIcon: cruise.category?.icon || "",
        startingPrice: cruise.price || 899,
        destinations: cruise.destination || "Multiple Destinations",
        slug: cruise.slug || slugify(cruise.name),
        departures: cruise.departures || [],
        departureCount: cruise._count?.departures || 0,
      }))
    : [];

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
    if (cruises.length === 0) return;
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
          <div className="flex flex-col items-center justify-center py-20">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load cruises</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
            >
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

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div
            className={`flex justify-center mb-8 transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Cruises
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === category.slug
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.icon && <span>{category.icon}</span>}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {cruises.length === 0 && !loading && (
          <div className="text-center py-20">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No cruises found</h3>
            <p className="mt-2 text-gray-600">Try selecting a different category or check back later.</p>
          </div>
        )}

        {/* Cruise Grid with Departure Info */}
        {cruises.length > 0 && (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {cruises.map((cruise, index) => (
              <div
                key={cruise.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={cruise.image}
                    alt={cruise.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      {cruise.categoryIcon && <span>{cruise.categoryIcon}</span>}
                      {cruise.tag}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">{cruise.rating}</span>
                  </div>

                  {/* Name */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-xl font-bold drop-shadow-lg">{cruise.name}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{cruise.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Capacity</p>
                      <p className="text-sm font-semibold text-gray-900">{cruise.capacity}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Amenities</p>
                      <p className="text-sm font-semibold text-gray-900">{cruise.amenities}+</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">From</p>
                      <p className="text-sm font-semibold text-blue-600">${cruise.startingPrice}</p>
                    </div>
                  </div>

                  {/* Departures */}
                  {cruise.departures.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        {cruise.departureCount} Sailing Dates Available
                      </p>
                      <div className="space-y-2">
                        {cruise.departures.slice(0, 2).map((departure) => {
                          const finalPrice = calculateDeparturePrice(cruise.startingPrice, departure.priceModifier);
                          const priceChange = ((departure.priceModifier - 1) * 100).toFixed(0);

                          return (
                            <div key={departure.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {new Date(departure.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getDepartureStatusColor(departure.status)}`}>
                                  {getDepartureStatusText(departure.status)}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-blue-600">${finalPrice}</p>
                                {departure.priceModifier !== 1.0 && (
                                  <p className={`text-xs ${priceChange > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {cruise.departureCount > 2 && (
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                          +{cruise.departureCount - 2} more dates
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 text-center py-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Sailing dates coming soon</p>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/cruises/${cruise.slug || cruise.id}`}
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {cruises.length > 0 && (
          <div
            className={`text-center transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Link
              href="/cruises"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Explore All Cruises
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
        )}
      </div>
    </section>
  );
}

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}