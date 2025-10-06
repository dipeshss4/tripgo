"use client";

import { useState, useEffect } from "react";
import { Play, Video, X, Volume2 } from "lucide-react";
import EnhancedVideoModal from "./EnhancedVideoModal";

export default function FloatingVideoButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Featured videos that can pop up
  const featuredVideos = [
    {
      id: 1,
      title: "Luxury Cruise Experience",
      description: "Experience the ultimate in luxury travel with our premium cruise collection featuring world-class amenities and breathtaking destinations.",
      src: "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=60&auto=format&fit=crop",
      category: "Cruise",
      views: "125K",
      duration: "2:30"
    },
    {
      id: 2,
      title: "Premium Hotel Collection",
      description: "Discover our handpicked selection of luxury hotels offering unparalleled comfort and world-class service.",
      src: "https://cdn.coverr.co/videos/coverr-luxury-hotel-lobby-4521/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=60&auto=format&fit=crop",
      category: "Hotels",
      views: "89K",
      duration: "1:45"
    },
    {
      id: 3,
      title: "Adventure Travel Packages",
      description: "Embark on extraordinary adventures with our curated travel packages designed for the ultimate explorer.",
      src: "https://cdn.coverr.co/videos/coverr-tropical-paradise-5748/1080p.mp4",
      poster: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=60&auto=format&fit=crop",
      category: "Packages",
      views: "156K",
      duration: "3:15"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const expandTimer = setTimeout(() => {
        setIsExpanded(true);
        // Auto-collapse after 5 seconds
        setTimeout(() => setIsExpanded(false), 5000);
      }, 1000);

      return () => clearTimeout(expandTimer);
    }
  }, [isVisible]);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
    setIsExpanded(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Video Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`transition-all duration-500 transform ${isExpanded ? 'scale-100 opacity-100' : 'scale-95 opacity-95'}`}>
          {/* Expanded Panel */}
          {isExpanded && (
            <div className="absolute bottom-20 right-0 w-80 glass-morphism rounded-2xl border border-white/20 shadow-2xl p-4 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">🎬 Featured Videos</h3>
                <button
                  onClick={handleClose}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {featuredVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className="group cursor-pointer bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={video.poster}
                          alt={video.title}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{video.title}</p>
                        <div className="flex items-center space-x-2 text-xs text-white/70">
                          <span>{video.category}</span>
                          <span>•</span>
                          <span>{video.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/20">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-full text-center text-white/70 hover:text-white text-sm transition-colors"
                >
                  Minimize
                </button>
              </div>
            </div>
          )}

          {/* Main Floating Button */}
          <div className="relative">
            {/* Pulsing Ring Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse opacity-50"></div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative w-16 h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full shadow-2xl flex items-center justify-center text-white transform hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden group"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>

              {/* Icon */}
              <div className="relative z-10">
                {isExpanded ? (
                  <X className="w-7 h-7 animate-pulse" />
                ) : (
                  <Video className="w-7 h-7 animate-bounce" />
                )}
              </div>

              {/* Notification Badge */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{featuredVideos.length}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Action Buttons (when not expanded) */}
        {!isExpanded && (
          <div className="absolute bottom-20 right-0 space-y-3 animate-fade-in-up">
            <button
              onClick={() => handleVideoSelect(featuredVideos[0])}
              className="w-12 h-12 bg-blue-600/90 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300 hover:bg-blue-500"
              title="Watch Cruise Video"
            >
              <Play className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleVideoSelect(featuredVideos[1])}
              className="w-12 h-12 bg-green-600/90 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300 hover:bg-green-500"
              title="Watch Hotel Video"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Video Modal */}
      <EnhancedVideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        video={selectedVideo}
      />
    </>
  );
}