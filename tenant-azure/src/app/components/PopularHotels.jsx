"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Play } from "lucide-react";
import { hotelApi } from "../../lib/api";
import { useApi } from "./hooks/useApi";
import EnhancedVideoModal from "./EnhancedVideoModal";

export default function PopularHotels() {
    const { data: hotelsData, loading, error, refetch } = useApi(() => hotelApi.getAll({ limit: 6 }));
    const hotels = hotelsData?.data || [];
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Sample videos for hotels (in real app, these would come from the API)
    const hotelVideos = {
        'hotel-maldives-overwater': {
            title: "Maldives Overwater Paradise Tour",
            description: "Take a virtual tour of our exclusive overwater bungalows with crystal clear waters and vibrant coral reefs.",
            src: "https://cdn.coverr.co/videos/coverr-maldives-overwater-bungalow-3421/1080p.mp4",
            poster: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=60&auto=format&fit=crop",
            category: "Luxury Resort",
            views: "45K",
            duration: "2:15"
        },
        'hotel-swiss-chalet': {
            title: "Swiss Alpine Chalet Experience",
            description: "Experience the magic of our mountain retreat with breathtaking alpine views and cozy luxury.",
            src: "https://cdn.coverr.co/videos/coverr-mountain-chalet-winter-5678/1080p.mp4",
            poster: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=60&auto=format&fit=crop",
            category: "Mountain Resort",
            views: "32K",
            duration: "1:45"
        }
    };

    const handleVideoPlay = (hotelId, hotelName) => {
        const video = hotelVideos[hotelId] || {
            title: `${hotelName} Virtual Tour`,
            description: `Take a virtual tour of ${hotelName} and discover what makes this destination special.`,
            src: "https://cdn.coverr.co/videos/coverr-luxury-hotel-lobby-4521/1080p.mp4",
            poster: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=60&auto=format&fit=crop",
            category: "Hotel Tour",
            views: "25K",
            duration: "2:00"
        };
        setSelectedVideo(video);
        setVideoModalOpen(true);
    };

    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <header className="mb-10 text-center">
                        <p className="text-sm uppercase tracking-widest text-gray-500">Handpicked</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Popular Hotels</h2>
                        <p className="mt-3 text-gray-600">Beach bliss, alpine calm, or city convenience—pick your vibe.</p>
                    </header>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading hotels...</span>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <header className="mb-10 text-center">
                        <p className="text-sm uppercase tracking-widest text-gray-500">Handpicked</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Popular Hotels</h2>
                        <p className="mt-3 text-gray-600">Beach bliss, alpine calm, or city convenience—pick your vibe.</p>
                    </header>
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load hotels</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={refetch}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-10 text-center">
                    <p className="text-sm uppercase tracking-widest text-gray-500">
                        Handpicked
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Popular Hotels
                    </h2>
                    <p className="mt-3 text-gray-600">
                        Beach bliss, alpine calm, or city convenience—pick your vibe.
                    </p>
                </header>

{hotels.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No hotels available at the moment.</p>
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                    {hotels.map((h) => (
                        <article
                            key={h.id || h.title}
                            className="group overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            {/* Image / badge / rating */}
                            <div className="relative h-60 w-full">
                                <img
                                    src={h.images?.[0] || h.image || "https://images.unsplash.com/photo-1604147706284-703b2f9c2b52?auto=format&fit=crop&w=1600&q=80"}
                                    alt={h.name || h.title}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                {/* Video Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleVideoPlay(h.id, h.name);
                                        }}
                                        className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 group/play"
                                    >
                                        <Play className="w-8 h-8 ml-1 group-hover/play:scale-110 transition-transform" />
                                    </button>
                                </div>

                                {h.badge && (
                                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900 shadow">
                    {h.badge}
                  </span>
                                )}
                                <div
                                    className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-yellow-600 shadow"
                                    aria-label={`${h.rating || 4.5} out of 5`}
                                >
                                    {h.rating || 4.5} ★
                                </div>

                                {/* Video Tour Badge */}
                                <div className="absolute left-3 bottom-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    🎬 Video Tour
                                </div>

                                {/* Title over image */}
                                <div className="absolute bottom-3 left-3 right-3">
                                    <h3 className="line-clamp-1 text-lg font-semibold text-white drop-shadow">
                                        {h.name || h.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Card body */}
                            <div className="p-5">
                                <p className="line-clamp-2 text-sm text-gray-600">{h.description}</p>

                                {/* Amenities chips */}
                                {(h.amenities?.length > 0 || h.features?.length > 0) && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(h.amenities || h.features || []).slice(0, 3).map((a, index) => (
                                            <span
                                                key={a || index}
                                                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                                            >
                        {a}
                      </span>
                                        ))}
                                    </div>
                                )}

                                {/* Price + CTA */}
                                <div className="mt-6 flex items-end justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500">
                                            From
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">
                                            ${Number(h.price || 0).toLocaleString()}/night
                                        </p>
                                    </div>
                                    <Link
                                        href={`/hotels/${h.id}`}
                                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* View all CTA */}
                <div className="mt-10 text-center">
                    <Link
                        href="/hotels"
                        className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                    >
                        Browse all hotels
                    </Link>
                </div>
                </>
                )}
            </div>

            {/* Enhanced Video Modal */}
            <EnhancedVideoModal
                isOpen={videoModalOpen}
                onClose={() => setVideoModalOpen(false)}
                video={selectedVideo}
            />
        </section>
    );
}