"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, Sparkles, Star, Zap, Rocket, Globe } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const videoRef = useRef(null);
  const [searchData, setSearchData] = useState({
    destination: '',
    activity: '',
    dates: '',
    guests: ''
  });

  // Popular destinations for the dropdown
  const destinations = [
    'Caribbean Islands',
    'Mediterranean',
    'Alaska',
    'Hawaiian Islands',
    'Bahamas',
    'Greek Islands',
    'Norwegian Fjords',
    'Antarctica',
    'South Pacific',
    'Baltic Sea',
    'Panama Canal',
    'Australia & NZ',
    'Eastern Caribbean',
    'Western Caribbean',
    'Southern Caribbean',
    'Alaska Inside Passage',
    'Mediterranean Sea',
    'East Asia',
    'New England'
  ].sort();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.destination) params.set('destination', searchData.destination);
    if (searchData.activity) params.set('activity', searchData.activity);
    if (searchData.dates) params.set('dates', searchData.dates);
    if (searchData.guests) params.set('guests', searchData.guests);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative w-full min-h-[60vh] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=80&auto=format&fit=crop"
        onLoadedData={() => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        }}
      >
        {/* Luxury Cruise Ship Videos */}
        <source src="https://cdn.pixabay.com/video/2022/08/19/128588-742816042_large.mp4" type="video/mp4" />
        <source src="https://cdn.pixabay.com/video/2020/08/13/47808-450878975_large.mp4" type="video/mp4" />
        <source src="https://cdn.pixabay.com/video/2022/03/24/112421-690863878_large.mp4" type="video/mp4" />
      </video>

      {/* Video Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-pink-900/60"></div>

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-purple-400/8 to-pink-400/10"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">

          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            {/* Premium Badge */}
            <div className="inline-flex items-center space-x-2 glass-morphism rounded-full px-4 py-2 text-cyan-400 mb-6">
              <Rocket className="w-4 h-4" />
              <span className="text-xs font-medium tracking-wide uppercase">Premium Travel</span>
              <Globe className="w-4 h-4" />
            </div>

            {/* Main Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              <span className="block text-holographic">Discover the</span>
              <span className="block bg-gradient-to-r from-cyan-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent">
                most engaging places
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-2">
              Experience luxury travel with our{' '}
              <span className="text-holographic font-semibold">AI-powered</span> recommendations
            </p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 rounded-full mx-auto"></div>
          </div>

          {/* Search Form */}
          <div className="mb-12 animate-fade-in-up-delayed">
            <form onSubmit={handleSearch} className="glass-morphism rounded-xl p-6 border border-white/20 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

                {/* Destination Dropdown */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none z-10" />
                    <select
                      value={searchData.destination}
                      onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1.25rem'
                      }}
                    >
                      <option value="" className="bg-gray-800">Select destination...</option>
                      {destinations.map(dest => (
                        <option key={dest} value={dest} className="bg-gray-800">{dest}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Activity Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Activity</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                    <input
                      type="text"
                      placeholder="What activity?"
                      value={searchData.activity}
                      onChange={(e) => setSearchData({...searchData, activity: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all"
                    />
                  </div>
                </div>

                {/* Dates Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Dates</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400" />
                    <input
                      type="date"
                      value={searchData.dates}
                      onChange={(e) => setSearchData({...searchData, dates: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                    />
                  </div>
                </div>

                {/* Guests Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Travelers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <input
                      type="number"
                      placeholder="Guests"
                      min="1"
                      value={searchData.guests}
                      onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-transparent">Search</label>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Category Buttons */}
          <div className="mb-12 animate-fade-in-up-delayed-2">
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: "🏝️", label: "Tropical", activity: "Beach & Relaxation", link: "/search?activity=Beach%20%26%20Relaxation" },
                { icon: "🏔️", label: "Mountains", activity: "Adventure & Hiking", link: "/search?activity=Adventure%20%26%20Hiking" },
                { icon: "🌆", label: "Cities", activity: "City Exploration", link: "/search?activity=City%20Exploration" },
                { icon: "🏛️", label: "Culture", activity: "Cultural Tours", link: "/search?activity=Cultural%20Tours" },
                { icon: "🚢", label: "Cruises", activity: "Cruise", link: "/cruises" }
              ].map((category, index) => (
                <button
                  key={category.label}
                  onClick={() => router.push(category.link)}
                  className="glass-morphism hover:glass-morphism-dark border border-white/20 hover:border-white/40 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="text-center animate-fade-in-up-delayed-2">
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { number: "50K+", label: "Happy Travelers" },
                { number: "200+", label: "Destinations" },
                { number: "4.9★", label: "Average Rating" }
              ].map((stat, index) => (
                <div key={stat.label} className="glass-morphism rounded-lg px-6 py-4 text-center">
                  <div className="text-2xl font-bold text-holographic">{stat.number}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-pink-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}