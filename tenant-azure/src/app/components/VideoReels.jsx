"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Eye, Heart, Share } from "lucide-react";

export default function VideoReels() {
  const [playingId, setPlayingId] = useState(null);
  const [mutedId, setMutedId] = useState(null);
  const scrollerRef = useRef(null);

  const reels = [
    {
      id: 1,
      title: "Ocean Paradise",
      description: "Breathtaking sunset views from the pool deck",
      src: "https://cdn.coverr.co/videos/coverr-sunset-by-the-sea-2600/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=60&auto=format&fit=crop",
      duration: "0:45",
      views: "12.5K",
      category: "Relaxation"
    },
    {
      id: 2,
      title: "Culinary Excellence",
      description: "World-class dining experiences onboard",
      src: "https://cdn.coverr.co/videos/coverr-dinner-5517/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=60&auto=format&fit=crop",
      duration: "1:20",
      views: "8.9K",
      category: "Dining"
    },
    {
      id: 3,
      title: "Tropical Adventure",
      description: "Explore pristine beaches and crystal waters",
      src: "https://cdn.coverr.co/videos/coverr-tropical-paradise-5748/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1526481280698-8fcc13fd87f8?w=1200&q=60&auto=format&fit=crop",
      duration: "2:10",
      views: "24.3K",
      category: "Adventure"
    },
    {
      id: 4,
      title: "Vibrant Nightlife",
      description: "Dance the night away under the stars",
      src: "https://cdn.coverr.co/videos/coverr-nightlife-2136/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=60&auto=format&fit=crop",
      duration: "1:35",
      views: "16.7K",
      category: "Entertainment"
    },
    {
      id: 5,
      title: "Luxury Spa",
      description: "Rejuvenate with premium wellness treatments",
      src: "https://cdn.coverr.co/videos/coverr-spa-relaxation-3421/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=60&auto=format&fit=crop",
      duration: "1:45",
      views: "9.2K",
      category: "Wellness"
    },
    {
      id: 6,
      title: "Epic Adventures",
      description: "Thrilling excursions and water sports",
      src: "https://cdn.coverr.co/videos/coverr-adventure-sports-2890/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&q=60&auto=format&fit=crop",
      duration: "2:30",
      views: "31.8K",
      category: "Sports"
    }
  ];

  const categoryColors = {
    "Relaxation": "from-blue-500 to-cyan-500",
    "Dining": "from-orange-500 to-red-500",
    "Adventure": "from-green-500 to-teal-500",
    "Entertainment": "from-purple-500 to-pink-500",
    "Wellness": "from-indigo-500 to-purple-500",
    "Sports": "from-yellow-500 to-orange-500"
  };

  const handlePlayPause = (id, videoRef) => {
    if (playingId === id) {
      videoRef.pause();
      setPlayingId(null);
    } else {
      videoRef.play();
      setPlayingId(id);
    }
  };

  const handleMuteToggle = (id, videoRef) => {
    if (mutedId === id) {
      videoRef.muted = false;
      setMutedId(null);
    } else {
      videoRef.muted = true;
      setMutedId(id);
    }
  };

  const scrollLeft = () => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/5 animate-morphing-blob blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 animate-liquid-morph blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500/8 to-red-500/5 animate-morphing-blob blur-2xl" style={{animationDelay: '10s'}}></div>

        {/* Floating Video Elements */}
        <div className="absolute top-1/4 left-1/5 w-6 h-6 text-purple-400/40 animate-particle-float-1">
          <Play className="w-full h-full" />
        </div>
        <div className="absolute top-2/3 right-1/4 w-8 h-8 text-cyan-400/50 animate-particle-float-2">
          <Volume2 className="w-full h-full" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-5 h-5 text-pink-400/60 animate-particle-float-3">
          <Heart className="w-full h-full" />
        </div>
      </div>

      {/* Full-Width Container */}
      <div className="relative mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        {/* Premium Header */}
        <header className="text-center mb-20 animate-fade-in-up">
          <div className="flex items-center justify-center mb-8 space-x-4">
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-pink-400"></div>
            <div className="flex items-center space-x-3 glass-morphism rounded-full px-8 py-4 border border-purple-400/30 animate-neon-glow text-purple-400">
              <Play className="w-6 h-6 animate-pulse" />
              <span className="text-lg font-bold tracking-wider uppercase">Cruise Stories</span>
              <Heart className="w-6 h-6 animate-bounce" />
            </div>
            <div className="w-20 h-0.5 bg-gradient-to-l from-transparent via-pink-400 to-purple-400"></div>
          </div>

          <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8">
            <span className="block bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent animate-gradient-text">
              Video Reels
            </span>
          </h2>

          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Experience the magic through the eyes of our travelers. Real moments, real adventures.
          </p>
        </header>

        {/* Enhanced Navigation & Scroller */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-16 h-16 glass-morphism rounded-full flex items-center justify-center border-2 border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-110 group"
          >
            <ChevronLeft className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
          </button>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-16 h-16 glass-morphism rounded-full flex items-center justify-center border-2 border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-110 group"
          >
            <ChevronRight className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
          </button>

          {/* Ultra-Premium Video Scroller */}
          <div
            ref={scrollerRef}
            className="no-scrollbar flex gap-8 overflow-x-auto scroll-smooth px-20 py-8"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {reels.map((reel, index) => (
              <article
                key={reel.id}
                className="group relative shrink-0 w-80 lg:w-96 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 overflow-hidden transition-all duration-700 hover:-translate-y-6 hover:shadow-[0_50px_100px_rgba(139,69,19,0.2)] hover:ring-purple-400/40 hover-lift-rotate"
                style={{
                  scrollSnapAlign: 'start',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Category Badge */}
                <div className="absolute top-6 left-6 z-30">
                  <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-black text-white bg-gradient-to-r ${categoryColors[reel.category]} shadow-xl animate-pulse`}>
                    ✨ {reel.category}
                  </span>
                </div>

                {/* Views & Duration */}
                <div className="absolute top-6 right-6 z-30 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 glass-morphism rounded-xl px-3 py-1.5">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-sm font-bold">{reel.views}</span>
                  </div>
                  <div className="glass-morphism rounded-xl px-3 py-1.5">
                    <span className="text-white text-sm font-bold">{reel.duration}</span>
                  </div>
                </div>

                {/* Premium Video Container */}
                <div className="relative h-96 overflow-hidden rounded-t-3xl">
                  <video
                    ref={(el) => {
                      if (el) {
                        el.onloadedmetadata = () => {
                          el.muted = mutedId === reel.id;
                        };
                      }
                    }}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000 animate-prismatic"
                    playsInline
                    loop
                    preload="metadata"
                    poster={reel.poster}
                    onPlay={() => setPlayingId(reel.id)}
                    onPause={() => setPlayingId(null)}
                  >
                    <source src={reel.src} type="video/mp4" />
                  </video>

                  {/* Dynamic Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-500"></div>

                  {/* Holographic Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1500 animate-holographic-shine"></div>
                  </div>

                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const video = e.currentTarget.closest('article').querySelector('video');
                          handlePlayPause(reel.id, video);
                        }}
                        className="w-16 h-16 glass-morphism rounded-full flex items-center justify-center border-2 border-white/30 hover:border-white/60 transition-all duration-300 hover:scale-110"
                      >
                        {playingId === reel.id ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const video = e.currentTarget.closest('article').querySelector('video');
                          handleMuteToggle(reel.id, video);
                        }}
                        className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110"
                      >
                        {mutedId === reel.id ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Content Section */}
                <div className="relative p-8">
                  {/* Floating Content Card */}
                  <div className="relative -mt-8 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl ring-1 ring-gray-200/50 group-hover:bg-white group-hover:shadow-2xl transition-all duration-500">

                    <div className="mb-6">
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-purple-900 transition-colors duration-300 mb-3">
                        {reel.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {reel.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-gray-500">
                        <button className="flex items-center space-x-2 hover:text-red-500 transition-colors duration-300 group/heart">
                          <Heart className="w-5 h-5 group-hover/heart:fill-current" />
                          <span className="text-sm font-semibold">Like</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors duration-300">
                          <Share className="w-5 h-5" />
                          <span className="text-sm font-semibold">Share</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          const video = e.currentTarget.closest('article').querySelector('video');
                          handlePlayPause(reel.id, video);
                        }}
                        className={`group/btn relative bg-gradient-to-r ${categoryColors[reel.category]} hover:shadow-xl text-white font-black px-6 py-3 rounded-xl transition-all duration-500 transform hover:scale-110 overflow-hidden animate-neon-glow`}
                      >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover/btn:-translate-x-full transition-transform duration-1000"></div>
                        <div className="relative flex items-center space-x-2">
                          <Play className="w-5 h-5" />
                          <span>Watch</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Bottom Bar */}
                <div className={`h-2 w-full bg-gradient-to-r ${categoryColors[reel.category]} opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-holographic-shine`} />
              </article>
            ))}
          </div>
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="mt-24 text-center animate-fade-in-up-delayed">
          <div className="glass-morphism rounded-3xl p-12 border-2 border-purple-200/30 max-w-5xl mx-auto">
            <div className="animate-bounce mb-8">
              <span className="text-6xl">🎬</span>
            </div>
            <h3 className="text-4xl font-black text-holographic mb-6">
              Create Your Own Story
            </h3>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Join thousands of travelers sharing their incredible cruise experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white font-black px-12 py-6 rounded-3xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl overflow-hidden animate-neon-glow">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center space-x-3">
                  <Play className="w-6 h-6" />
                  <span className="text-xl">Watch All Videos</span>
                </div>
              </button>

              <button className="group glass-morphism hover:glass-morphism-dark border-3 border-purple-200/50 hover:border-purple-400/60 text-purple-300 hover:text-purple-200 font-black px-12 py-6 rounded-3xl transition-all duration-500 transform hover:scale-105">
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 group-hover:fill-current transition-all duration-300" />
                  <span className="text-xl">Follow for More</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}