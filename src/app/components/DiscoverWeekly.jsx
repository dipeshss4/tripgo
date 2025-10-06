"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { cruiseApi, hotelApi, packageApi } from "../../lib/api";

export default function DiscoverWeekly() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadWeeklyDeals = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch one featured item from each category
                const [cruiseResponse, hotelResponse, packageResponse] = await Promise.all([
                    cruiseApi.getAll({ limit: 1, sortBy: 'rating', sortOrder: 'desc' }),
                    hotelApi.getAll({ limit: 1, sortBy: 'rating', sortOrder: 'desc' }),
                    packageApi.getAll({ limit: 1, sortBy: 'rating', sortOrder: 'desc' })
                ]);

                const weeklyItems = [];

                // Add cruise if available
                if (cruiseResponse.data && cruiseResponse.data.length > 0) {
                    const cruise = cruiseResponse.data[0];
                    weeklyItems.push({
                        category: "Cruises",
                        title: cruise.name || cruise.title,
                        price: `$${Number(cruise.price || 0).toLocaleString()}`,
                        originalPrice: cruise.originalPrice ? `$${Number(cruise.originalPrice).toLocaleString()}` : null,
                        href: `/cruises/${cruise.id}`,
                        image: cruise.images?.[0] || cruise.image || "https://images.unsplash.com/photo-1594736797933-d0ddb7e7e0b0?w=600&q=80",
                        discount: cruise.discount || "Featured",
                        rating: cruise.rating || 4.8,
                        duration: cruise.duration || cruise.durationDays ? `${cruise.durationDays} days` : "7 days"
                    });
                }

                // Add hotel if available
                if (hotelResponse.data && hotelResponse.data.length > 0) {
                    const hotel = hotelResponse.data[0];
                    weeklyItems.push({
                        category: "Hotels",
                        title: hotel.name || hotel.title,
                        price: `$${Number(hotel.price || 0).toLocaleString()}`,
                        originalPrice: hotel.originalPrice ? `$${Number(hotel.originalPrice).toLocaleString()}` : null,
                        priceUnit: "/night",
                        href: `/hotels/${hotel.id}`,
                        image: hotel.images?.[0] || hotel.image || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
                        discount: hotel.discount || "Featured",
                        rating: hotel.rating || 4.9,
                        amenities: hotel.amenities ? hotel.amenities.slice(0, 3).join(" • ") : "Pool • Spa • Beach"
                    });
                }

                // Add package if available
                if (packageResponse.data && packageResponse.data.length > 0) {
                    const pkg = packageResponse.data[0];
                    weeklyItems.push({
                        category: "Travel Packages",
                        title: pkg.name || pkg.title,
                        price: `$${Number(pkg.price || 0).toLocaleString()}`,
                        originalPrice: pkg.originalPrice ? `$${Number(pkg.originalPrice).toLocaleString()}` : null,
                        href: `/packages/${pkg.id}`,
                        image: pkg.images?.[0] || pkg.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
                        discount: pkg.discount || "Featured",
                        rating: pkg.rating || 4.7,
                        duration: pkg.duration || pkg.durationDays ? `${pkg.durationDays} days` : "12 days",
                        countries: pkg.destinations ? pkg.destinations.length : 5
                    });
                }

                setItems(weeklyItems);
            } catch (err) {
                console.error('Error loading weekly deals:', err);
                setError('Failed to load weekly deals');
                // Fallback to static data if API fails
                setItems([
                    {
                        category: "Cruises",
                        title: "Caribbean Paradise Cruise",
                        price: "$999",
                        originalPrice: "$1299",
                        href: "/cruises",
                        image: "https://images.unsplash.com/photo-1594736797933-d0ddb7e7e0b0?w=600&q=80",
                        discount: "23% OFF",
                        rating: 4.8,
                        duration: "7 days"
                    },
                    {
                        category: "Hotels",
                        title: "Luxury Oceanfront Resort",
                        price: "$299",
                        originalPrice: "$399",
                        priceUnit: "/night",
                        href: "/hotels",
                        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
                        discount: "25% OFF",
                        rating: 4.9,
                        amenities: "Pool • Spa • Beach"
                    },
                    {
                        category: "Travel Packages",
                        title: "European Grand Adventure",
                        price: "$1999",
                        originalPrice: "$2499",
                        href: "/packages",
                        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
                        discount: "20% OFF",
                        rating: 4.7,
                        duration: "12 days",
                        countries: 5
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadWeeklyDeals();
    }, []);

    const categoryConfig = {
        "Cruises": {
            icon: "🚢",
            gradient: "from-blue-500 via-cyan-500 to-teal-500",
            bgGradient: "from-blue-50 via-cyan-50 to-teal-50",
            features: ["Ocean Views", "Fine Dining", "Entertainment"]
        },
        "Hotels": {
            icon: "🏨",
            gradient: "from-pink-500 via-rose-500 to-orange-500",
            bgGradient: "from-pink-50 via-rose-50 to-orange-50",
            features: ["Luxury Suites", "World-class Spa", "Gourmet Breakfast"]
        },
        "Travel Packages": {
            icon: "🗺️",
            gradient: "from-purple-500 via-indigo-500 to-blue-500",
            bgGradient: "from-purple-50 via-indigo-50 to-blue-50",
            features: ["Guided Tours", "Premium Hotels", "All Flights Included"]
        }
    };

    if (loading) {
        return (
            <section className="relative py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 overflow-hidden">
                <div className="relative mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
                    <header className="text-center mb-16">
                        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                Discover Weekly
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Loading this week's exclusive deals...
                        </p>
                    </header>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                        <span className="ml-4 text-xl text-gray-600">Finding the best deals for you...</span>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="relative py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 overflow-hidden">
                <div className="relative mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
                    <header className="text-center mb-16">
                        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                Discover Weekly
                            </span>
                        </h2>
                    </header>
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Unable to load weekly deals</h3>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-20 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-float-slow"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-200/20 to-yellow-200/20 rounded-full blur-2xl animate-float-delayed"></div>
                <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-teal-200/20 to-green-200/20 rounded-full blur-xl animate-float"></div>
            </div>

            <div className="relative mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
                <header className="text-center mb-16 animate-fade-in-up">
                    <div className="flex items-center justify-center mb-6 space-x-2">
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-purple-500"></div>
                        <span className="text-2xl animate-spin-slow">⭐</span>
                        <p className="text-sm uppercase tracking-widest text-purple-600 font-bold">
                            This Week's Exclusive Picks
                        </p>
                        <span className="text-2xl animate-spin-slow">⭐</span>
                        <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-purple-500"></div>
                    </div>
                    <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-text">
                            Discover Weekly
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Handpicked deals across Cruises, Hotels, and Travel Packages. Limited time offers that disappear fast!
                    </p>
                </header>

                <div className="flex flex-wrap justify-center gap-8 lg:gap-10 animate-fade-in-up-delayed">
                    {items.map((item, index) => {
                        const config = categoryConfig[item.category];

                        return (
                            <article
                                key={item.title}
                                className="group relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-200/50 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(139,69,19,0.15)] hover:ring-purple-300/60 hover-lift-rotate"
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                {/* Enhanced Discount Badge */}
                                <div className="absolute top-6 left-6 z-20">
                                    <div className="flex flex-col space-y-2">
                                        <span className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-black text-white bg-gradient-to-r ${config.gradient} shadow-xl animate-neon-glow`}>
                                            🔥 {item.discount}
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-white/95 text-purple-600 shadow-lg animate-pulse">
                                            ⭐ Premium
                                        </span>
                                    </div>
                                </div>

                                {/* Category Header */}
                                <div className={`relative h-56 bg-gradient-to-br ${config.bgGradient} overflow-hidden`}>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-115 transition-transform duration-1000 animate-prismatic"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500"></div>

                                    {/* Holographic Shine Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1500 animate-holographic-shine"></div>
                                    </div>

                                    {/* Enhanced Category Badge */}
                                    <div className="absolute top-6 right-6">
                                        <div className={`flex items-center space-x-3 glass-morphism rounded-xl px-4 py-2.5 border border-white/20`}>
                                            <span className="text-2xl animate-float">{config.icon}</span>
                                            <span className="text-sm font-black text-white uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Enhanced Rating */}
                                    <div className="absolute bottom-6 left-6">
                                        <div className="flex items-center space-x-2 glass-morphism rounded-xl px-4 py-2.5 border border-white/20">
                                            <span className="text-yellow-400 text-lg animate-pulse">⭐</span>
                                            <span className="text-white font-black text-lg">{item.rating}</span>
                                            <span className="text-white/80 text-sm">(2.1k)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <h3 className="text-2xl font-black text-gray-900 mb-6 group-hover:text-purple-900 transition-colors duration-300">
                                        {item.title}
                                    </h3>

                                    {/* Enhanced Features */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {config.features.slice(0, 2).map((feature) => (
                                            <span
                                                key={feature}
                                                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r ${config.gradient}/10 text-gray-800 border border-gray-200/50 hover:border-purple-300/50 transition-all duration-300 hover:scale-105`}
                                            >
                                                ✨ {feature}
                                            </span>
                                        ))}
                                        {item.duration && (
                                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border border-blue-200/50">
                                                📅 {item.duration}
                                            </span>
                                        )}
                                        {item.countries && (
                                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-green-50 to-teal-50 text-green-800 border border-green-200/50">
                                                🌍 {item.countries} Countries
                                            </span>
                                        )}
                                    </div>

                                    {/* Enhanced Price Section */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <p className="text-sm uppercase tracking-widest text-gray-500 font-black mb-2">
                                                🎯 Special Price
                                            </p>
                                            <div className="flex items-baseline space-x-3">
                                                <span className={`text-4xl font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent animate-gradient-text`}>
                                                    {item.price}
                                                </span>
                                                {item.priceUnit && (
                                                    <span className="text-lg font-bold text-gray-600">{item.priceUnit}</span>
                                                )}
                                            </div>
                                            {item.originalPrice && (
                                                <p className="text-lg text-gray-500 line-through font-semibold">{item.originalPrice}</p>
                                            )}
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="text-right">
                                            {item.amenities && (
                                                <p className="text-xs text-gray-600">{item.amenities}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Enhanced Action Buttons */}
                                    <div className="flex gap-4">
                                        <Link
                                            href={item.href || "#"}
                                            className={`group relative flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r ${config.gradient} hover:shadow-2xl px-8 py-4 text-lg font-black text-white transition-all duration-500 transform hover:scale-110 overflow-hidden animate-neon-glow`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                                            <span className="relative mr-2">Book Now</span>
                                            <svg className="relative w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>

                                        <button className="group inline-flex items-center justify-center rounded-2xl border-3 border-gray-200/60 hover:border-purple-400/60 bg-white hover:bg-purple-50 px-6 py-4 text-gray-600 hover:text-purple-600 transition-all duration-500 hover:scale-105 glass-morphism">
                                            <svg className="w-7 h-7 group-hover:scale-125 group-hover:text-red-500 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Enhanced Animated Bottom Bar */}
                                <div className={`h-2 w-full bg-gradient-to-r ${config.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-holographic-shine`} />

                                {/* Enhanced Shine Effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1500 animate-holographic-shine"></div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* Enhanced Bottom CTA */}
                <div className="mt-24 text-center animate-fade-in-up-delayed-2">
                    <div className="glass-morphism rounded-3xl p-12 border-2 border-purple-200/30 max-w-5xl mx-auto">
                        <div className="animate-bounce mb-8">
                            <span className="text-6xl">⚡</span>
                        </div>
                        <h3 className="text-4xl font-black text-holographic mb-6">
                            Limited Time Only!
                        </h3>
                        <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
                            These exclusive deals are disappearing fast. Book now and save up to 33%!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                href="/deals"
                                className="group relative inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 px-12 py-6 text-xl font-black text-white transition-all duration-500 transform hover:scale-110 hover:shadow-2xl overflow-hidden animate-neon-glow"
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                                <span className="relative mr-3 text-2xl">🎯</span>
                                <span className="relative">View All Weekly Deals</span>
                                <svg className="relative ml-3 w-7 h-7 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>

                            <button className="group glass-morphism hover:glass-morphism-dark border-3 border-purple-200/50 hover:border-purple-400/60 bg-white hover:bg-purple-50 px-12 py-6 text-xl font-black text-purple-600 hover:text-purple-700 rounded-3xl transition-all duration-500 transform hover:scale-105">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl animate-pulse">📧</span>
                                    <span>Get Deal Alerts</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}