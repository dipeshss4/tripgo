"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Play } from "lucide-react";
import { packageApi } from "../../lib/api";
import { useApi } from "./hooks/useApi";
import EnhancedVideoModal from "./EnhancedVideoModal";

export default function PopularTravelPackages() {
    const { data: packagesData, loading, error, refetch } = useApi(() => packageApi.getAll({ limit: 6 }));
    const packages = packagesData?.data || [];
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Sample videos for packages (in real app, these would come from the API)
    const packageVideos = {
        'package-african-safari-adventure': {
            title: "Ultimate African Safari Adventure",
            description: "Experience the adventure of a lifetime through Kenya and Tanzania. Witness the Great Migration and see the Big Five.",
            src: "https://cdn.coverr.co/videos/coverr-african-safari-wildlife-3456/1080p.mp4",
            poster: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=60&auto=format&fit=crop",
            category: "Safari Adventure",
            views: "78K",
            duration: "3:45"
        },
        'package-european-grand-tour': {
            title: "European Grand Tour Experience",
            description: "Journey through Europe's most iconic cities and landmarks in this comprehensive cultural adventure.",
            src: "https://cdn.coverr.co/videos/coverr-european-cities-tour-4789/1080p.mp4",
            poster: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=60&auto=format&fit=crop",
            category: "Cultural Tour",
            views: "92K",
            duration: "4:20"
        }
    };

    const handleVideoPlay = (packageId, packageName) => {
        const video = packageVideos[packageId] || {
            title: `${packageName} Adventure Preview`,
            description: `Get a sneak peek of the amazing experiences waiting for you in ${packageName}.`,
            src: "https://cdn.coverr.co/videos/coverr-travel-adventure-montage-5432/1080p.mp4",
            poster: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=60&auto=format&fit=crop",
            category: "Travel Package",
            views: "45K",
            duration: "2:30"
        };
        setSelectedVideo(video);
        setVideoModalOpen(true);
    };

    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <header className="mb-10 text-center">
                        <p className="text-sm uppercase tracking-widest text-gray-500">Bundles</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Popular Travel Packages</h2>
                        <p className="mt-3 text-gray-600">Curated routes with flights, stays, and signature experiences.</p>
                    </header>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading packages...</span>
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
                        <p className="text-sm uppercase tracking-widest text-gray-500">Bundles</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Popular Travel Packages</h2>
                        <p className="mt-3 text-gray-600">Curated routes with flights, stays, and signature experiences.</p>
                    </header>
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load packages</h3>
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
                        Bundles
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Popular Travel Packages
                    </h2>
                    <p className="mt-3 text-gray-600">
                        Curated routes with flights, stays, and signature experiences.
                    </p>
                </header>

                {packages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No packages available at the moment.</p>
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                    {packages.map((p) => {
                        const includes = (p.includes || []).slice(0, 3);
                        return (
                            <article
                                key={p.id}
                                className="group overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                {/* Image / badge */}
                                <div className="relative h-64 w-full">
                                    <img
                                        src={p.images?.[0] || p.image || "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=1600"}
                                        alt={p.name || p.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Video Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleVideoPlay(p.id, p.name);
                                            }}
                                            className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 group/play"
                                        >
                                            <Play className="w-8 h-8 ml-1 group-hover/play:scale-110 transition-transform" />
                                        </button>
                                    </div>

                                    {/* Video Tour Badge */}
                                    <div className="absolute left-3 bottom-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        🎬 Video Tour
                                    </div>
                                    {p.badge && (
                                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900 shadow">
                      {p.badge}
                    </span>
                                    )}
                                    <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow">
                    ⏱ {p.duration || `${p.durationDays || 7} days`}
                  </span>

                                    {/* Title over image */}
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <h3 className="line-clamp-1 text-lg font-semibold text-white drop-shadow">
                                            {p.name || p.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5">
                                    <p className="line-clamp-2 text-sm text-gray-600">
                                        {p.description}
                                    </p>

                                    {/* Includes chips */}
                                    {includes.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {includes.map((i, index) => (
                                                <span
                                                    key={i || index}
                                                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                                                >
                          {i}
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
                                                ${Number(p.price || 0).toLocaleString()}
                                                <span className="ml-1 text-sm font-medium text-gray-500">
                          /person
                        </span>
                                            </p>
                                        </div>

                                        <Link
                                            href={`/packages/${p.id}`}
                                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                    {/* View all CTA */}
                    <div className="mt-10 text-center">
                        <Link
                            href="/packages"
                            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                        >
                            Browse all packages
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