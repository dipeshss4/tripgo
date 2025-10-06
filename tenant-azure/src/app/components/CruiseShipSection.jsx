"use client";
import Link from "next/link";
import { Anchor, Star, Award, Crown, Sparkles, ArrowRight, Play, Zap, Users, Calendar, MapPin, Heart, Eye, ThumbsUp } from "lucide-react";
import { useState } from "react";

export default function CruiseShipSection() {
  const [hoveredCruise, setHoveredCruise] = useState(null);
  const [likedCruises, setLikedCruises] = useState([]);

  const toggleLike = (cruiseName) => {
    setLikedCruises(prev =>
      prev.includes(cruiseName)
        ? prev.filter(name => name !== cruiseName)
        : [...prev, cruiseName]
    );
  };

  const cruises = [
    {
      name: "Ocean Pearl",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      tag: "Flagship",
      description: "Ultra-luxury flagship with panoramic suites & Michelin dining",
      capacity: "2,800 guests",
      rating: "4.9",
      reviews: "2,847",
      price: "$2,499",
      duration: "7 nights",
      nextSailing: "Dec 15, 2024",
      features: ["Butler Service", "Private Balconies", "Michelin Dining"],
      highlights: ["🥂 Champagne Welcome", "🌊 Ocean View Suites", "⭐ 5-Star Service"]
    },
    {
      name: "Caribbean Queen",
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
      tag: "Premium",
      description: "Royal elegance meets modern luxury",
      capacity: "3,200 guests",
      rating: "4.8",
      reviews: "1,924",
      price: "$1,899",
      duration: "5 nights",
      nextSailing: "Jan 8, 2025",
      features: ["Royal Suite", "Spa & Wellness", "Private Beach"],
      highlights: ["👑 Royal Treatment", "🏝️ Private Islands", "💆 Luxury Spa"]
    },
    {
      name: "Sunset Voyager",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
      tag: "Exclusive",
      description: "Intimate luxury for discerning travelers",
      capacity: "1,500 guests",
      rating: "4.9",
      reviews: "892",
      price: "$3,299",
      duration: "10 nights",
      nextSailing: "Feb 22, 2025",
      features: ["Adults Only", "All-Suite", "Personal Concierge"],
      highlights: ["🌅 Sunset Views", "🍾 Adults Only", "🛎️ Personal Butler"]
    },
    {
      name: "Atlantic Dream",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
      tag: "Adventure",
      description: "Expedition luxury with expert guides",
      capacity: "900 guests",
      rating: "4.7",
      reviews: "645",
      price: "$4,199",
      duration: "14 nights",
      nextSailing: "Mar 10, 2025",
      features: ["Expedition", "Zodiac Boats", "Marine Biologist"],
      highlights: ["🐋 Wildlife Watching", "🚤 Zodiac Adventures", "📸 Photography Tours"]
    },
    {
      name: "Tropical Breeze",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      tag: "Paradise",
      description: "Tropical sophistication & island vibes",
      capacity: "2,400 guests",
      rating: "4.8",
      reviews: "1,567",
      price: "$1,699",
      duration: "6 nights",
      nextSailing: "Apr 5, 2025",
      features: ["Infinity Pools", "Overwater Dining", "Spa Sanctuary"],
      highlights: ["🏝️ Tropical Paradise", "🏊 Infinity Pools", "🍽️ Overwater Dining"]
    },
  ];

  const getTagIcon = (tag) => {
    switch(tag) {
      case 'Flagship': return <Crown className="w-4 h-4" />;
      case 'Premium': return <Award className="w-4 h-4" />;
      case 'Exclusive': return <Sparkles className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getTagColor = (tag) => {
    switch(tag) {
      case 'Flagship': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'Premium': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'Exclusive': return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white';
      case 'Adventure': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'Paradise': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default: return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white';
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float-cruise {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
            transform: scale(1.05);
          }
        }
        @keyframes bounce-heart {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 3s infinite;
        }
        .animate-float-cruise {
          animation: float-cruise 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-bounce-heart {
          animation: bounce-heart 0.6s ease-in-out;
        }
      `}</style>

      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-24 overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 to-pink-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

          {/* Floating decorative elements */}
          <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-float-cruise opacity-60"></div>
          <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rotate-45 animate-float-cruise opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-2/3 right-1/6 w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg rotate-12 animate-float-cruise opacity-40" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-400/30 rounded-full px-10 py-4 mb-8 hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <Anchor className="w-7 h-7 text-blue-400" />
                <div className="absolute -inset-1 bg-blue-400/30 rounded-full blur animate-pulse"></div>
              </div>
              <span className="text-lg font-black text-blue-100 uppercase tracking-wide">⚡ Luxury Fleet Collection</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>

            <h2 className="text-5xl lg:text-8xl font-black text-white mb-8 relative">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse-glow">
                Floating Palaces
              </span>
              <span className="block text-white mt-4 relative">
                <span className="relative z-10">Await Your Discovery</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 blur-sm rounded-lg"></div>
              </span>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
            </h2>

            <p className="text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Each vessel in our exclusive fleet offers a unique journey through luxury,
              <span className="block mt-4 text-white font-bold text-3xl">
                🌊 Where every cabin is a suite • ⭐ Every moment is extraordinary • 💎 Every detail is perfection
              </span>
            </p>

            {/* Live Stats */}
            <div className="flex justify-center space-x-8 mt-8">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
                <div className="text-2xl font-black text-green-400">●</div>
                <div className="text-sm font-bold text-blue-100">5 Ships Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
                <div className="text-2xl font-black text-yellow-400">🔥</div>
                <div className="text-sm font-bold text-blue-100">Trending Now</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
                <div className="text-2xl font-black text-blue-400">⚡</div>
                <div className="text-sm font-bold text-blue-100">Instant Booking</div>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-16">
            {/* Enhanced Large Feature */}
            <Link
              href="/ships/ocean-pearl"
              className="group relative overflow-hidden rounded-3xl md:col-span-2 transform transition-all duration-700 hover:scale-105 hover:rotate-1 animate-pulse-glow"
              aria-label={`${cruises[0].name} — view details`}
              onMouseEnter={() => setHoveredCruise(cruises[0].name)}
              onMouseLeave={() => setHoveredCruise(null)}
            >
              <div className="relative aspect-[16/9] w-full">
                <img
                  src={cruises[0].image}
                  alt={cruises[0].name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-115"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40" />

                {/* Interactive overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />

                {/* Enhanced Floating Tag */}
                <div className="absolute top-6 left-6">
                  <span className={`inline-flex items-center gap-3 rounded-full px-6 py-3 text-lg font-black shadow-2xl border border-white/30 backdrop-blur-sm ${getTagColor(cruises[0].tag)} hover:scale-110 transition-transform duration-300`}>
                    {getTagIcon(cruises[0].tag)}
                    {cruises[0].tag}
                    <Zap className="w-4 h-4 animate-pulse" />
                  </span>
                </div>

                {/* Enhanced Rating & Interactions */}
                <div className="absolute top-6 right-6 space-y-3">
                  <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/30 hover:scale-105 transition-transform">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-black text-lg">{cruises[0].rating}</span>
                      <span className="text-blue-200 text-sm">({cruises[0].reviews})</span>
                    </div>
                  </div>

                  {/* Like button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(cruises[0].name);
                    }}
                    className="bg-white/20 backdrop-blur-xl rounded-full p-3 border border-white/30 hover:scale-110 transition-all duration-300 group/like"
                  >
                    <Heart className={`w-5 h-5 transition-all duration-300 ${
                      likedCruises.includes(cruises[0].name)
                        ? 'text-red-400 fill-red-400 animate-bounce-heart'
                        : 'text-white group-hover/like:text-red-300'
                    }`} />
                  </button>

                  {/* View count */}
                  <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-3 py-2 border border-white/30">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-blue-300" />
                      <span className="text-white font-bold text-sm">2.4k</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Content */}
                <div className="absolute left-6 right-6 bottom-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-4xl font-black text-white drop-shadow-lg mb-2">
                        {cruises[0].name}
                        {hoveredCruise === cruises[0].name && (
                          <span className="ml-3 inline-flex items-center gap-2">
                            <Play className="w-6 h-6 text-blue-400 animate-pulse" />
                            <span className="text-lg text-blue-300 font-bold">Preview</span>
                          </span>
                        )}
                      </h3>
                      <p className="text-blue-100 text-xl mb-4 leading-relaxed">
                        {cruises[0].description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-green-400">{cruises[0].price}</div>
                      <div className="text-sm text-blue-200">per person</div>
                    </div>
                  </div>

                  {/* Enhanced Features */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {cruises[0].highlights.map((highlight, idx) => (
                      <span key={idx} className="bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border border-white/40 hover:scale-105 transition-transform">
                        {highlight}
                      </span>
                    ))}
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <Calendar className="w-5 h-5 text-blue-400 mb-1" />
                      <div className="text-white font-bold text-sm">{cruises[0].duration}</div>
                      <div className="text-blue-200 text-xs">{cruises[0].nextSailing}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <Users className="w-5 h-5 text-purple-400 mb-1" />
                      <div className="text-white font-bold text-sm">{cruises[0].capacity}</div>
                      <div className="text-blue-200 text-xs">Max Capacity</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <ThumbsUp className="w-5 h-5 text-green-400 mb-1" />
                      <div className="text-white font-bold text-sm">98%</div>
                      <div className="text-blue-200 text-xs">Satisfaction</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-blue-200 text-lg font-bold flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Caribbean Route
                      </span>
                    </div>
                    <div className="group-hover:translate-x-3 transition-transform duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Enhanced Small Tiles */}
            <div className="grid grid-cols-2 gap-8">
              {cruises.slice(1).map((cruise, idx) => (
                <Link
                  key={cruise.name}
                  href={`/ships/${slugify(cruise.name)}`}
                  className="group relative overflow-hidden rounded-3xl transform transition-all duration-700 hover:scale-110 hover:rotate-2 hover:shadow-2xl animate-float-cruise"
                  style={{animationDelay: `${idx * 0.5}s`}}
                  aria-label={`${cruise.name} — view details`}
                  onMouseEnter={() => setHoveredCruise(cruise.name)}
                  onMouseLeave={() => setHoveredCruise(null)}
                >
                  <div className="relative aspect-[4/3] w-full">
                    <img
                      src={cruise.image}
                      alt={cruise.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-115"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30" />

                    {/* Hover effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />

                    {/* Enhanced Tag */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black border border-white/30 backdrop-blur-sm ${getTagColor(cruise.tag)} hover:scale-110 transition-transform`}>
                        {getTagIcon(cruise.tag)}
                        {cruise.tag}
                      </span>
                    </div>

                    {/* Enhanced Rating & Actions */}
                    <div className="absolute top-4 right-4 space-y-2">
                      <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-3 py-2 border border-white/30">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-white font-black text-sm">{cruise.rating}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleLike(cruise.name);
                        }}
                        className="bg-white/20 backdrop-blur-xl rounded-full p-2 border border-white/30 hover:scale-110 transition-all duration-300"
                      >
                        <Heart className={`w-4 h-4 transition-all duration-300 ${
                          likedCruises.includes(cruise.name)
                            ? 'text-red-400 fill-red-400 animate-bounce-heart'
                            : 'text-white hover:text-red-300'
                        }`} />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white text-lg font-black drop-shadow mb-1">
                            {cruise.name}
                            {hoveredCruise === cruise.name && (
                              <Play className="inline-block w-4 h-4 text-blue-400 ml-2 animate-pulse" />
                            )}
                          </h4>
                          <p className="text-blue-100 text-sm mb-2 line-clamp-2">
                            {cruise.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-green-400">{cruise.price}</div>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                          <Calendar className="w-3 h-3 text-blue-400 mb-1" />
                          <div className="text-white font-bold text-xs">{cruise.duration}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                          <Users className="w-3 h-3 text-purple-400 mb-1" />
                          <div className="text-white font-bold text-xs">{cruise.capacity}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-200 text-sm font-bold">{cruise.reviews} reviews</span>
                        </div>
                        <div className="group-hover:translate-x-2 transition-transform duration-300 bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30">
                          <ArrowRight className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Ultra Dynamic CTA Section */}
          <div className="text-center">
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-[3rem] p-16 border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-500 animate-pulse-glow">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-[3rem] animate-pulse"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-[3rem] blur-xl opacity-50"></div>

              <div className="relative z-10">
                <h3 className="text-4xl lg:text-6xl font-black text-white mb-6">
                  Your Journey Begins with
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mt-2">
                    The Perfect Vessel
                  </span>
                  <div className="flex justify-center mt-4 space-x-2">
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" style={{animationDelay: '0.5s'}} />
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" style={{animationDelay: '1s'}} />
                  </div>
                </h3>

                <p className="text-blue-100 text-2xl max-w-3xl mx-auto mb-12 leading-relaxed">
                  From intimate expedition ships to grand ocean liners, discover the floating palace that matches your luxury travel dreams.
                  <span className="block mt-4 text-white font-bold text-2xl">
                    ⚡ Instant booking • 🌟 Premium service • 💎 Unforgettable experiences
                  </span>
                </p>

                {/* Enhanced Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform">
                    <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">5</div>
                    <div className="text-blue-100 text-lg font-bold uppercase tracking-wide">Luxury Vessels</div>
                    <div className="text-sm text-blue-300 mt-1">Ready to sail</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform">
                    <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">98%</div>
                    <div className="text-blue-100 text-lg font-bold uppercase tracking-wide">Guest Satisfaction</div>
                    <div className="text-sm text-blue-300 mt-1">5-star rating</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform">
                    <div className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-3">24/7</div>
                    <div className="text-blue-100 text-lg font-bold uppercase tracking-wide">Concierge Service</div>
                    <div className="text-sm text-blue-300 mt-1">Always available</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform">
                    <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3">50+</div>
                    <div className="text-blue-100 text-lg font-bold uppercase tracking-wide">Destinations</div>
                    <div className="text-sm text-blue-300 mt-1">Worldwide</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/ships"
                    className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white px-12 py-6 rounded-2xl font-black text-xl transition-all duration-500 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 border border-white/30 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <Anchor className="w-8 h-8 group-hover:rotate-12 transition-transform relative z-10" />
                    <span className="relative z-10">🚢 Explore Our Luxury Fleet</span>
                    <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform relative z-10" />
                  </Link>

                  <button className="group relative inline-flex items-center gap-4 border-2 border-white/40 hover:border-white/70 text-white hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 px-12 py-6 rounded-2xl font-black text-xl transition-all duration-500 backdrop-blur-xl overflow-hidden hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <Play className="w-8 h-8 group-hover:scale-125 transition-transform relative z-10" />
                    <span className="relative z-10">🎬 Watch Virtual Tour</span>
                    <Sparkles className="w-8 h-8 group-hover:rotate-180 transition-transform relative z-10" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}