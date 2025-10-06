"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, Sparkles, CheckCircle, Play, Star, Globe, Zap, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    destination: '',
    activity: '',
    dates: '',
    guests: ''
  });

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
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(147, 51, 234, 0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(147, 51, 234, 0.4);
            transform: scale(1.02);
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.05) rotate(5deg); }
          70% { transform: scale(0.9) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite 2s;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-rotate {
          animation: rotate 20s linear infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 1s ease-out forwards;
        }
        .gradient-text {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6);
          background-size: 300% 300%;
          animation: gradient-shift 4s ease infinite;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
        {/* Ultra Dynamic Background */}
        <div className="absolute inset-0">
          {/* Video Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-indigo-600/30"></div>

          {/* Animated Orbs */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '0ms'}}></div>
            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '1000ms'}}></div>
            <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '2000ms'}}></div>
            <div className="absolute top-1/3 left-1/6 w-64 h-64 bg-gradient-to-r from-cyan-500/15 to-teal-500/15 rounded-full blur-2xl animate-pulse-glow" style={{animationDelay: '3000ms'}}></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/5 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg rotate-45 animate-float opacity-60"></div>
            <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float-delayed opacity-70"></div>
            <div className="absolute bottom-1/3 left-2/3 w-10 h-10 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full animate-float opacity-50"></div>
            <div className="absolute top-2/3 right-1/6 w-4 h-4 bg-gradient-to-r from-cyan-400 to-teal-400 rotate-45 animate-float-delayed opacity-60"></div>
            <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg rotate-12 animate-float opacity-40"></div>
          </div>

          {/* Rotating Rings */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-[800px] h-[800px] border border-blue-400/10 rounded-full animate-rotate" style={{animationDuration: '30s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-purple-400/10 rounded-full animate-rotate" style={{animationDuration: '25s', animationDirection: 'reverse'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-400/10 rounded-full animate-rotate" style={{animationDuration: '20s'}}></div>
          </div>

          {/* Shimmer Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-shimmer" style={{animationDelay: '3s'}}></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative pt-32 pb-20 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Content */}
              <div className="space-y-8 text-white">
                {/* Animated Trust Badge */}
                <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl border border-white/30 rounded-full px-8 py-4 animate-bounce-in hover:scale-105 transition-all duration-300">
                  <div className="relative">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-black text-white tracking-wide uppercase">⚡ Trusted by Fortune 500 Companies</span>
                  </div>
                </div>

                {/* Main Headline */}
                <div className="space-y-6">
                  <h1 className="text-6xl lg:text-8xl font-black leading-tight">
                    <span className="gradient-text bg-clip-text text-transparent relative">
                      Luxury Travel
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl rounded-lg animate-pulse-glow"></div>
                    </span>
                    <span className="block text-white mt-4 relative animate-bounce-in" style={{animationDelay: '0.5s'}}>
                      <span className="relative z-10">Redefined</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5 blur-sm rounded-lg"></div>
                    </span>
                  </h1>

                  <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-2xl animate-bounce-in" style={{animationDelay: '1s'}}>
                    Experience extraordinary journeys crafted for discerning travelers.
                    <span className="block mt-3 text-white font-bold text-2xl">
                      ✨ Exclusive destinations • 🎯 Personalized service • 💎 Unforgettable memories
                    </span>
                  </p>
                </div>

                {/* Dynamic Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-bounce-in" style={{animationDelay: '1.5s'}}>
                  <div className="group bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/30 hover:border-blue-400/50 hover:bg-white/25 transition-all duration-500 hover:scale-105 hover:rotate-1 animate-pulse-glow">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                        <Globe className="w-8 h-8 text-white" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      </div>
                      <div>
                        <div className="text-4xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">500+</div>
                        <div className="text-sm font-bold text-blue-100 uppercase tracking-wide">Elite Partners</div>
                      </div>
                    </div>
                  </div>
                  <div className="group bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/30 hover:border-purple-400/50 hover:bg-white/25 transition-all duration-500 hover:scale-105 hover:rotate-1 animate-pulse-glow" style={{animationDelay: '200ms'}}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                        <Star className="w-8 h-8 text-white fill-white" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      </div>
                      <div>
                        <div className="text-4xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">25+</div>
                        <div className="text-sm font-bold text-blue-100 uppercase tracking-wide">Awards Won</div>
                      </div>
                    </div>
                  </div>
                  <div className="group bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/30 hover:border-indigo-400/50 hover:bg-white/25 transition-all duration-500 hover:scale-105 hover:rotate-1 animate-pulse-glow" style={{animationDelay: '400ms'}}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                        <Zap className="w-8 h-8 text-white" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      </div>
                      <div>
                        <div className="text-4xl font-black bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">98%</div>
                        <div className="text-sm font-bold text-blue-100 uppercase tracking-wide">Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-blue-100 font-medium text-lg">🌍 Exclusive global destinations & VIP access</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-blue-100 font-medium text-lg">🥂 Personalized concierge & luxury services</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-blue-100 font-medium text-lg">💼 Corporate travel management & events</span>
                  </div>
                </div>

                {/* Dynamic CTAs */}
                <div className="flex flex-col sm:flex-row gap-6 pt-8 animate-bounce-in" style={{animationDelay: '2s'}}>
                  <button className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white px-12 py-5 rounded-2xl text-xl font-black transition-all duration-500 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 border border-white/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center gap-4">
                      <Play className="w-6 h-6 group-hover:scale-125 transition-transform" />
                      🚀 Start Your Journey
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </button>
                  <button className="group relative border-2 border-white/40 hover:border-white/70 text-white hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 px-12 py-5 rounded-2xl text-xl font-black transition-all duration-500 backdrop-blur-xl overflow-hidden hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center gap-4">
                      <Star className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                      🎬 Watch Video Tour
                      <Sparkles className="w-6 h-6 group-hover:scale-125 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Column - Ultra Dynamic Visual */}
              <div className="relative lg:block hidden animate-bounce-in" style={{animationDelay: '2.5s'}}>
                <div className="relative z-10">
                  {/* Main Image with epic effects */}
                  <div className="relative group">
                    <div className="absolute -inset-8 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-700 animate-pulse-glow"></div>
                    <div className="relative overflow-hidden rounded-3xl">
                      <img
                        src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80"
                        alt="Luxury travel experience"
                        className="relative w-full h-[600px] object-cover shadow-2xl group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Multiple overlay gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-purple-900/30"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10"></div>

                      {/* Floating elements inside image */}
                      <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-xl p-3 rounded-full animate-float">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute bottom-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-full animate-float-delayed">
                        <Star className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Floating Cards */}
                  <div className="absolute -top-8 -right-8 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/30 animate-float hover:scale-110 transition-transform duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center relative">
                        <span className="text-white font-black text-lg">AZ</span>
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30"></div>
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-800">Azure Travel</div>
                        <div className="text-sm text-slate-600 font-bold">✨ Luxury Redefined</div>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-8 -left-8 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/30 animate-float-delayed hover:scale-110 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">4.9</div>
                      <div className="flex justify-center my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <div className="text-sm text-slate-600 font-bold">Client Rating</div>
                      <div className="text-xs text-slate-500">From 10,000+ reviews</div>
                    </div>
                  </div>

                  {/* Additional floating elements */}
                  <div className="absolute top-1/2 -left-4 bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl shadow-xl animate-float border border-white/20">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>

                  <div className="absolute top-1/4 -right-4 bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-2xl shadow-xl animate-float-delayed border border-white/20">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Enhanced Background decorative elements */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 -right-8 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Luxury Search Form */}
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                ✨ Design Your Perfect
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Luxury Experience
                </span>
              </h2>
              <p className="text-blue-100 text-lg">Where would you like to create unforgettable memories?</p>
            </div>

            <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Destination Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-blue-100 uppercase tracking-wide">🌍 Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="text"
                      placeholder="Where to?"
                      value={searchData.destination}
                      onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Activity Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-blue-100 uppercase tracking-wide">✨ Experience</label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <select
                      value={searchData.activity}
                      onChange={(e) => setSearchData({...searchData, activity: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all font-medium appearance-none"
                    >
                      <option value="" className="bg-slate-800">Choose Style</option>
                      <option value="luxury" className="bg-slate-800">🥂 Ultimate Luxury</option>
                      <option value="business" className="bg-slate-800">💼 Executive Travel</option>
                      <option value="adventure" className="bg-slate-800">🏔️ Adventure & Exploration</option>
                      <option value="romance" className="bg-slate-800">💕 Romantic Getaway</option>
                      <option value="group" className="bg-slate-800">👥 Group Celebration</option>
                    </select>
                  </div>
                </div>

                {/* Dates Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-blue-100 uppercase tracking-wide">📅 When</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <input
                      type="date"
                      value={searchData.dates}
                      onChange={(e) => setSearchData({...searchData, dates: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Guests Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-blue-100 uppercase tracking-wide">👥 Travelers</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="number"
                      placeholder="How many?"
                      min="1"
                      value={searchData.guests}
                      onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-transparent">Search</label>
                  <button
                    type="submit"
                    className="group w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center space-x-3 border border-white/20"
                  >
                    <Search className="w-5 h-5" />
                    <span className="uppercase tracking-wide">🚀 Explore</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}