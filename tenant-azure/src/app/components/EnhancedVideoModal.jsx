"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Share2, Heart, Download } from "lucide-react";

export default function EnhancedVideoModal({ isOpen, onClose, video }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Modal Container */}
      <div
        className="relative w-full max-w-7xl mx-4 bg-black/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
        onMouseMove={handleMouseMove}
      >
        {/* Header */}
        <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="glass-morphism rounded-full px-4 py-2">
                <span className="text-white text-sm font-semibold">Now Playing</span>
              </div>
              {video.category && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {video.category}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full glass-morphism transition-all duration-300 ${isLiked ? 'text-red-500' : 'text-white hover:text-red-400'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 rounded-full glass-morphism text-white hover:text-blue-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full glass-morphism text-white hover:text-green-400 transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-3 rounded-full glass-morphism text-white hover:text-red-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
            preload="metadata"
            poster={video.poster}
            onClick={togglePlayPause}
          >
            <source src={video.src} type="video/mp4" />
          </video>

          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`transition-all duration-300 ${!showControls && isPlaying ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
            >
              {!isPlaying && (
                <button
                  onClick={togglePlayPause}
                  className="pointer-events-auto w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
                >
                  <Play className="w-12 h-12 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all duration-200"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100 relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2 shadow-lg opacity-0 hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlayPause}
                className="p-3 rounded-full glass-morphism text-white hover:scale-110 transition-all duration-200"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-3 rounded-full glass-morphism text-white hover:scale-110 transition-all duration-200"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-3 rounded-full glass-morphism text-white hover:scale-110 transition-all duration-200">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Info */}
          <div className="mt-4 text-white">
            <h3 className="text-2xl font-bold mb-2">{video.title}</h3>
            <p className="text-white/80 mb-2">{video.description}</p>
            {video.views && (
              <div className="flex items-center space-x-4 text-sm text-white/60">
                <span>{video.views} views</span>
                {video.duration && <span>{video.duration}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="absolute bottom-4 left-4 glass-morphism rounded-lg p-3 text-white text-xs opacity-60">
        <div>Press ESC to close • SPACE to play/pause • M to mute</div>
      </div>
    </div>
  );
}