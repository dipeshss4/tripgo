"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, Users, Anchor, Waves, Crown } from "lucide-react";
import { cruiseApi } from "../../lib/api";

export default function PopularCruisesStatic() {
    const [cruises, setCruises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCruises = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await cruiseApi.getAll({
                    limit: 6,
                    sortBy: 'rating',
                    sortOrder: 'desc'
                });

                setCruises(response.data || []);
            } catch (err) {
                console.error('Error loading cruises:', err);
                setError(err.message || 'Failed to load cruises');
                setCruises([]);
            } finally {
                setLoading(false);
            }
        };

        loadCruises();
    }, []);

    const scrollerRef = useRef(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(true);

    const updateArrows = () => {
        const el = scrollerRef.current;
        if (el) {
            setCanLeft(el.scrollLeft > 0);
            setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth);
        }
    };

    const scroll = (direction) => {
        const el = scrollerRef.current;
        if (el) {
            const cardWidth = 380;
            const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const el = scrollerRef.current;
        if (el) {
            el.addEventListener('scroll', updateArrows);
            updateArrows();
            return () => el.removeEventListener('scroll', updateArrows);
        }
    }, [cruises]);

    if (loading) {
        return (
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Cruise Deals</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Loading amazing cruise deals...</p>
                    </div>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Cruise Deals</h2>
                        <p className="text-xl text-red-600 max-w-3xl mx-auto">
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Cruise Deals</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Discover breathtaking destinations and unforgettable experiences with our top-rated cruise packages
                    </p>
                </div>

                <div className="relative">
                    <div
                        ref={scrollerRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {cruises.map((cruise) => (
                            <div
                                key={cruise.id}
                                className="flex-none w-96 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                <div className="relative h-56">
                                    <img
                                        src={cruise.images?.[0] || cruise.image || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80"}
                                        alt={cruise.name || cruise.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            {cruise.badge || "⭐ Featured"}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-semibold text-gray-900">{cruise.rating || '4.5'}</span>
                                        </div>
                                    </div>
                                    {cruise.discount && (
                                        <div className="absolute bottom-4 left-4">
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                {cruise.discount}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                        {cruise.name || cruise.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                        {cruise.description}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            <span>{cruise.duration || '7 days'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin className="h-4 w-4" />
                                            <span>{cruise.departure || 'Various ports'}</span>
                                        </div>
                                    </div>

                                    {cruise.highlights && (
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-1">
                                                {cruise.highlights.slice(0, 3).map((highlight, index) => (
                                                    <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                                        {highlight}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div>
                                            {cruise.originalPrice && (
                                                <span className="text-sm text-gray-500 line-through">
                                                    ${Number(cruise.originalPrice).toLocaleString()}
                                                </span>
                                            )}
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-gray-900">
                                                    ${Number(cruise.price || 0).toLocaleString()}
                                                </span>
                                                <span className="text-sm text-gray-500">/person</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/cruises/${cruise.slug || cruise.id}`}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={() => scroll('left')}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-3 transition-all duration-300 ${
                            canLeft ? 'hover:bg-white hover:shadow-xl' : 'opacity-50 cursor-not-allowed'
                        }`}
                        disabled={!canLeft}
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-3 transition-all duration-300 ${
                            canRight ? 'hover:bg-white hover:shadow-xl' : 'opacity-50 cursor-not-allowed'
                        }`}
                        disabled={!canRight}
                    >
                        <ChevronRight className="h-6 w-6 text-gray-700" />
                    </button>
                </div>

                <div className="text-center mt-12">
                    <Link
                        href="/cruises"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        <Anchor className="h-5 w-5" />
                        Explore All Cruises
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}