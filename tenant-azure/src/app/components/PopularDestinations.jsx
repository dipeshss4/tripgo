"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Users, Star, Zap, Crown, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cruiseApi, hotelApi, packageApi } from "../../lib/api";

export default function PopularDestinations() {
  const [destinationsData, setDestinationsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDestinationsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch top 3 items from each category
        const [cruiseResponse, hotelResponse, packageResponse] = await Promise.all([
          cruiseApi.getAll({ limit: 3, sortBy: 'rating', sortOrder: 'desc' }),
          hotelApi.getAll({ limit: 3, sortBy: 'rating', sortOrder: 'desc' }),
          packageApi.getAll({ limit: 3, sortBy: 'rating', sortOrder: 'desc' })
        ]);

        const data = {
          cruises: {
            title: "Ocean Voyages",
            icon: "🚢",
            gradient: "from-blue-600 via-blue-500 to-indigo-600",
            bgGradient: "from-blue-900/20 via-blue-800/10 to-indigo-900/20",
            accentColor: "blue",
            items: []
          },
          hotels: {
            title: "Luxury Stays",
            icon: "🏨",
            gradient: "from-indigo-600 via-blue-500 to-cyan-600",
            bgGradient: "from-indigo-900/20 via-blue-800/10 to-cyan-900/20",
            accentColor: "indigo",
            items: []
          },
          packages: {
            title: "Epic Adventures",
            icon: "🗺️",
            gradient: "from-cyan-600 via-blue-500 to-indigo-600",
            bgGradient: "from-cyan-900/20 via-blue-800/10 to-indigo-900/20",
            accentColor: "cyan",
            items: []
          }
        };

        // Process cruises
        if (cruiseResponse.data && cruiseResponse.data.length > 0) {
          data.cruises.items = cruiseResponse.data.map(cruise => ({
            title: cruise.name || cruise.title,
            price: cruise.price || 1299,
            originalPrice: cruise.originalPrice || null,
            tag: cruise.badge || "🔥 Limited Time",
            href: `/cruises/${cruise.id}`,
            image: cruise.images?.[0] || cruise.image || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
            duration: cruise.duration || cruise.durationDays ? `${cruise.durationDays} days` : "7 days",
            rating: cruise.rating || 4.8,
            description: cruise.description || "Explore amazing destinations"
          }));
        }

        // Process hotels
        if (hotelResponse.data && hotelResponse.data.length > 0) {
          data.hotels.items = hotelResponse.data.map(hotel => ({
            title: hotel.name || hotel.title,
            priceNote: `$${Number(hotel.price || 0).toLocaleString()}/night`,
            originalPrice: hotel.originalPrice ? `$${Number(hotel.originalPrice).toLocaleString()}/night` : null,
            tag: hotel.badge || "👑 Luxury",
            href: `/hotels/${hotel.id}`,
            image: hotel.images?.[0] || hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
            amenities: hotel.amenities ? hotel.amenities.slice(0, 3).join(" • ") : "Spa • Pool • Restaurant",
            rating: hotel.rating || 4.9,
            description: hotel.description || "Luxury accommodation"
          }));
        }

        // Process packages
        if (packageResponse.data && packageResponse.data.length > 0) {
          data.packages.items = packageResponse.data.map(pkg => ({
            title: pkg.name || pkg.title,
            price: pkg.price || 2499,
            originalPrice: pkg.originalPrice || null,
            tag: pkg.badge || "🎌 Cultural",
            href: `/packages/${pkg.id}`,
            image: pkg.images?.[0] || pkg.image || "https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&q=80",
            duration: pkg.duration || pkg.durationDays ? `${pkg.durationDays} days` : "14 days",
            countries: pkg.destinations ? pkg.destinations.length : 4,
            rating: pkg.rating || 4.8,
            description: pkg.description || "Amazing travel experience"
          }));
        }

        setDestinationsData(data);
      } catch (err) {
        console.error('Error loading destinations data:', err);
        setError('Failed to load destinations');
        // Fallback to static data
        setDestinationsData(getStaticDestinationsData());
      } finally {
        setLoading(false);
      }
    };

    loadDestinationsData();
  }, []);

  const getStaticDestinationsData = () => {
    return {
    cruises: {
      title: "Ocean Voyages",
      icon: "🚢",
      gradient: "from-blue-600 via-blue-500 to-indigo-600",
      bgGradient: "from-blue-900/20 via-blue-800/10 to-indigo-900/20",
      accentColor: "blue",
      items: [
        {
          title: "Mediterranean Paradise",
          price: 1299,
          originalPrice: 1599,
          tag: "🔥 Limited Time",
          href: "/cruises",
          image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
          duration: "7 days",
          rating: 4.9,
          description: "Explore ancient cities and pristine beaches"
        },
        {
          title: "Caribbean Dreams",
          price: 999,
          originalPrice: 1299,
          tag: "⚡ Best Seller",
          href: "/cruises",
          image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
          duration: "5 days",
          rating: 4.8,
          description: "Crystal clear waters and tropical paradise"
        },
        {
          title: "Arctic Adventure",
          price: 2399,
          originalPrice: 2899,
          tag: "🆕 New Route",
          href: "/cruises",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
          duration: "10 days",
          rating: 4.9,
          description: "Witness glaciers and northern lights"
        }
      ]
    },
    hotels: {
      title: "Luxury Stays",
      icon: "🏨",
      gradient: "from-indigo-600 via-blue-500 to-cyan-600",
      bgGradient: "from-indigo-900/20 via-blue-800/10 to-cyan-900/20",
      accentColor: "indigo",
      items: [
        {
          title: "Parisian Elegance",
          priceNote: "$399/night",
          originalPrice: "$499/night",
          tag: "👑 Luxury",
          href: "/hotels",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
          amenities: "Spa • Pool • Restaurant",
          rating: 4.9,
          description: "Iconic views of the Eiffel Tower"
        },
        {
          title: "Alpine Sanctuary",
          priceNote: "$299/night",
          originalPrice: "$399/night",
          tag: "🏔️ Mountain",
          href: "/hotels",
          image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&q=80",
          amenities: "Ski Access • Spa • Fireplace",
          rating: 4.7,
          description: "Breathtaking mountain vistas and serenity"
        },
        {
          title: "Seaside Escape",
          priceNote: "$199/night",
          originalPrice: "$299/night",
          tag: "🌊 Beachfront",
          href: "/hotels",
          image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
          amenities: "Beach Access • Pool • Restaurant",
          rating: 4.6,
          description: "Direct beach access and ocean views"
        }
      ]
    },
    packages: {
      title: "Epic Adventures",
      icon: "🗺️",
      gradient: "from-cyan-600 via-blue-500 to-indigo-600",
      bgGradient: "from-cyan-900/20 via-blue-800/10 to-indigo-900/20",
      accentColor: "cyan",
      items: [
        {
          title: "Asian Odyssey",
          price: 2499,
          originalPrice: 2999,
          tag: "🎌 Cultural",
          href: "/packages",
          image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&q=80",
          duration: "14 days",
          countries: 4,
          rating: 4.8,
          description: "Japan, Thailand, Vietnam & Singapore"
        },
        {
          title: "European Grand Tour",
          price: 3299,
          originalPrice: 3799,
          tag: "🏰 Historic",
          href: "/packages",
          image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80",
          duration: "21 days",
          countries: 6,
          rating: 4.9,
          description: "Paris, Rome, Barcelona & more"
        },
        {
          title: "African Safari",
          price: 4999,
          originalPrice: 5999,
          tag: "🦁 Wildlife",
          href: "/packages",
          image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80",
          duration: "12 days",
          countries: 3,
          rating: 5.0,
          description: "Kenya, Tanzania & South Africa"
        }
      ]
    }
    };
  };

  if (loading) {
    return (
      <section className="relative py-32 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
        <div className="relative mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
          <header className="text-center mb-20">
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-8">
              <span className="block text-holographic">
                Popular Destinations
              </span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Loading amazing destinations...
            </p>
          </header>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-blue-400" />
            <span className="ml-4 text-xl text-gray-300">Discovering destinations...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-32 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
        <div className="relative mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
          <header className="text-center mb-20">
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-8">
              <span className="block text-holographic">
                Popular Destinations
              </span>
            </h2>
          </header>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-20 w-20 text-red-500 mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">Unable to load destinations</h3>
            <p className="text-gray-300 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-32 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 animate-morphing-blob blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 animate-liquid-morph blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-indigo-500/8 to-blue-500/5 animate-morphing-blob blur-2xl" style={{animationDelay: '10s'}}></div>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-particle-float-1"></div>
        <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-indigo-400/70 rounded-full animate-particle-float-2"></div>
        <div className="absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-cyan-400/80 rounded-full animate-particle-float-3"></div>
        <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 bg-blue-400/60 rounded-full animate-particle-float-1" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12">
        {/* Futuristic Header */}
        <header className="text-center mb-20 animate-fade-in-up">
          <div className="flex items-center justify-center mb-8 space-x-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-blue-400"></div>
            <div className="flex items-center space-x-3 glass-morphism rounded-full px-8 py-4 border border-blue-400/30 animate-neon-glow text-blue-400">
              <MapPin className="w-6 h-6 animate-pulse" />
              <span className="text-lg font-bold tracking-wider uppercase">Explore Destinations</span>
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-blue-400"></div>
          </div>

          <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-8">
            <span className="block text-holographic animate-gradient-text">
              Popular Destinations
            </span>
          </h2>

          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Embark on extraordinary journeys to the world's most breathtaking destinations
          </p>
        </header>

        {/* Ultra-Premium Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in-up-delayed">
          {Object.entries(destinationsData).map(([key, section], sectionIndex) => (
            <div
              key={key}
              className="group relative"
              style={{ animationDelay: `${sectionIndex * 0.3}s` }}
            >
              {/* Column Container with Advanced Effects */}
              <div className="relative glass-morphism rounded-3xl p-8 border-2 border-white/10 hover:border-white/20 transition-all duration-700 overflow-hidden hover-lift-rotate">

                {/* Dynamic Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${section.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl`}></div>

                {/* Holographic Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1500"></div>
                </div>

                {/* Section Header */}
                <div className="relative flex items-center justify-between mb-10">
                  <div className="flex items-center space-x-4">
                    <div className={`text-6xl animate-float`}>{section.icon}</div>
                    <div>
                      <h3 className={`text-3xl font-black bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
                        {section.title}
                      </h3>
                      <div className={`w-24 h-1 bg-gradient-to-r ${section.gradient} rounded-full mt-2 animate-holographic-shine`}></div>
                    </div>
                  </div>

                  <Link
                    href={`/${key}`}
                    className={`group/link flex items-center space-x-2 glass-morphism-dark rounded-xl px-4 py-3 hover:bg-white/10 transition-all duration-300`}
                  >
                    <span className="text-white font-bold text-sm">View All</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Items Grid */}
                <div className="space-y-6 mb-8">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={item.title}
                      href={item.href || "#"}
                      className="group/item block relative neumorphism rounded-2xl p-6 hover:glass-morphism transition-all duration-500 overflow-hidden"
                      style={{ animationDelay: `${itemIndex * 0.1}s` }}
                    >
                      {/* Item Background Image */}
                      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-10 group-hover/item:opacity-20 transition-opacity duration-500">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      </div>

                      {/* Item Content */}
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-white group-hover/item:text-blue-300 transition-colors duration-300 mb-2">
                              {item.title}
                            </h4>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                              {item.description}
                            </p>
                          </div>

                          {item.tag && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r ${section.gradient} text-white shadow-lg animate-pulse ml-4`}>
                              {item.tag}
                            </span>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            {/* Price */}
                            <div className="flex items-baseline space-x-2">
                              {item.price ? (
                                <>
                                  <span className={`text-2xl font-black bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
                                    ${item.price.toLocaleString()}
                                  </span>
                                  {item.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ${item.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className={`text-2xl font-black bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
                                    {item.priceNote}
                                  </span>
                                  {item.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {item.originalPrice}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              {item.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="font-semibold text-white">{item.rating}</span>
                                </div>
                              )}
                              {item.duration && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{item.duration}</span>
                                </div>
                              )}
                              {item.countries && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{item.countries} countries</span>
                                </div>
                              )}
                              {item.amenities && (
                                <span className="truncate">{item.amenities}</span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button className={`group/btn relative bg-gradient-to-r ${section.gradient} hover:shadow-lg px-6 py-3 rounded-xl text-white font-bold transition-all duration-300 transform hover:scale-105 overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative">Explore</span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Section CTA */}
                <Link
                  href={`/${key}`}
                  className={`group/cta relative w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r ${section.gradient} hover:shadow-2xl px-8 py-4 text-lg font-black text-white transition-all duration-500 transform hover:scale-105 overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover/cta:-translate-x-full transition-transform duration-1000"></div>
                  <span className="relative mr-3">Discover All {section.title}</span>
                  <Zap className="relative w-6 h-6 group-hover/cta:rotate-12 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-32 text-center animate-fade-in-up-delayed-2">
          <div className="glass-morphism rounded-3xl p-12 border-2 border-blue-400/20">
            <Crown className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-float" />
            <h3 className="text-4xl font-black text-holographic mb-6">
              Ready for Your Next Adventure?
            </h3>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of travelers who've discovered their perfect getaway with us
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/search"
                className="group relative bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black px-12 py-5 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative text-xl">Start Exploring</span>
              </Link>
              <button className="group glass-morphism hover:glass-morphism-dark border-2 border-white/20 hover:border-blue-400/40 text-white font-black px-12 py-5 rounded-2xl transition-all duration-500 transform hover:scale-105">
                <span className="text-xl">Get Personalized Recommendations</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}