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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">Premium Ocean Cruises</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-800 mb-6">Corporate & Luxury
                        <span className="block text-blue-600">Cruise Solutions</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Professional cruise bookings for corporate events, incentive trips, and luxury leisure travel
                    </p>
                </div>

                <div className="relative">
                    <div
                        ref={scrollerRef}
                        className="flex gap-8 overflow-x-auto scrollbar-hide pb-6"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {cruises.map((cruise) => (
                            <div
                                key={cruise.id}
                                className="flex-none w-96 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                <div className="relative h-48">
                                    <img
                                        src={cruise.images?.[0] || cruise.image || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80"}
                                        alt={cruise.name || cruise.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                                            {cruise.badge || "Featured"}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-white rounded-lg px-3 py-1 flex items-center gap-1 shadow-sm">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-bold text-slate-800">{cruise.rating || '4.5'}</span>
                                        </div>
                                    </div>
                                    {cruise.discount && (
                                        <div className="absolute bottom-4 left-4">
                                            <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                                                {cruise.discount}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-black text-slate-800 mb-3 line-clamp-1">
                                        {cruise.name || cruise.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                                        {cruise.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span>{cruise.duration || '7 days'}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <MapPin className="h-4 w-4 text-blue-600" />
                                                <span className="truncate">{cruise.departure || 'Various ports'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {cruise.highlights && (
                                        <div className="mb-6">
                                            <div className="flex flex-wrap gap-2">
                                                {cruise.highlights.slice(0, 3).map((highlight, index) => (
                                                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                                        {highlight}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                                        <div>
                                            {cruise.originalPrice && (
                                                <span className="text-sm text-slate-500 line-through">
                                                    ${Number(cruise.originalPrice).toLocaleString()}
                                                </span>
                                            )}
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-blue-600">
                                                    ${Number(cruise.price || 0).toLocaleString()}
                                                </span>
                                                <span className="text-sm font-medium text-slate-500">/person</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/cruises/${cruise.slug || cruise.id}`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-blue-600 hover:border-blue-700 uppercase tracking-wide text-sm"
                                        >
                                            Get Quote
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

                <div className="text-center mt-16">
                    <Link
                        href="/cruises"
                        className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-blue-600 hover:border-blue-700 uppercase tracking-wide"
                    >
                        <Anchor className="h-5 w-5" />
                        View All Cruise Options
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}