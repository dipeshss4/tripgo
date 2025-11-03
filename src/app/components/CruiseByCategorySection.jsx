"use client";

import { useEffect, useState, useMemo } from 'react';
import { getCruiseCategories, getCruisesByCategory } from '../../lib/cruiseApi';
import { ChevronRight, MapPin, Calendar, Ship, Filter, X } from 'lucide-react';

export default function CruiseByCategorySection() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCruises, setLoadingCruises] = useState(false);

  // Filter states
  const [selectedDeparture, setSelectedDeparture] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const cats = await getCruiseCategories();
        setCategories(cats);

        // Auto-select first category
        if (cats.length > 0) {
          setSelectedCategory(cats[0]);
          fetchCruisesForCategory(cats[0].slug);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchCruisesForCategory = async (categorySlug) => {
    try {
      setLoadingCruises(true);
      const data = await getCruisesByCategory(categorySlug);
      setCruises(data.cruises || []);
    } catch (error) {
      console.error(`Error fetching cruises for ${categorySlug}:`, error);
      setCruises([]);
    } finally {
      setLoadingCruises(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchCruisesForCategory(category.slug);
    // Reset filters when changing category
    setSelectedDeparture('');
    setSelectedDestination('');
  };

  // Extract unique departure ports and destinations
  const departurePorts = useMemo(() => {
    const ports = cruises
      .map(cruise => cruise.departurePort)
      .filter(port => port && port.trim() !== '');
    return [...new Set(ports)].sort();
  }, [cruises]);

  const destinations = useMemo(() => {
    const dests = cruises
      .map(cruise => cruise.destination)
      .filter(dest => dest && dest.trim() !== '');
    return [...new Set(dests)].sort();
  }, [cruises]);

  // Filter cruises based on selected filters
  const filteredCruises = useMemo(() => {
    let filtered = cruises;

    if (selectedDeparture) {
      filtered = filtered.filter(cruise => cruise.departurePort === selectedDeparture);
    }

    if (selectedDestination) {
      filtered = filtered.filter(cruise => cruise.destination === selectedDestination);
    }

    return filtered;
  }, [cruises, selectedDeparture, selectedDestination]);

  const clearFilters = () => {
    setSelectedDeparture('');
    setSelectedDestination('');
  };

  const hasActiveFilters = selectedDeparture || selectedDestination;

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading cruise categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Cruises by Destination
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing cruise experiences organized by popular destinations around the world
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`group flex items-center gap-3 px-6 py-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 ${
                selectedCategory?.id === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{category.icon}</span>
              <div className="text-left">
                <p className={`font-bold text-sm ${selectedCategory?.id === category.id ? 'text-white' : 'text-gray-900'}`}>
                  {category.name}
                </p>
                <p className={`text-xs ${selectedCategory?.id === category.id ? 'text-white/90' : 'text-gray-500'}`}>
                  {category.description?.substring(0, 30)}...
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Category Cruises */}
        {selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl shadow-lg">
                  {selectedCategory.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {selectedCategory.name}
                  </h3>
                  <p className="text-gray-600">{selectedCategory.description}</p>
                </div>
              </div>
              {cruises.length > 0 && (
                <a
                  href={`/cruises?category=${selectedCategory.slug}`}
                  className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm hover:shadow-md"
                >
                  View All {cruises.length}
                  <ChevronRight className="w-5 h-5" />
                </a>
              )}
            </div>

            {loadingCruises ? (
              <div className="flex items-center justify-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : cruises.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <p className="text-gray-500 text-lg">No cruises available in this category yet.</p>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="mb-8 bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Filter className="w-5 h-5 text-primary" />
                    <h4 className="text-lg font-bold text-gray-900">Filter Cruises</h4>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Departure Port Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departure Port
                      </label>
                      <select
                        value={selectedDeparture}
                        onChange={(e) => setSelectedDeparture(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                      >
                        <option value="">All Ports</option>
                        {departurePorts.map((port) => (
                          <option key={port} value={port}>
                            {port}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Destination Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                      </label>
                      <select
                        value={selectedDestination}
                        onChange={(e) => setSelectedDestination(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                      >
                        <option value="">All Destinations</option>
                        {destinations.map((dest) => (
                          <option key={dest} value={dest}>
                            {dest}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-end">
                      <div className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <span className="font-bold text-lg">{filteredCruises.length}</span>
                          <span className="ml-1">cruise{filteredCruises.length !== 1 ? 's' : ''} found</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cruises Grid */}
                {filteredCruises.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                    <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No cruises match your filters</p>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCruises.slice(0, 6).map((cruise) => (
                        <a
                          key={cruise.id}
                          href={`/cruises/${cruise.slug || cruise.id}`}
                          className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {/* Cruise Image */}
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={cruise.images?.[0] || "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop&crop=center"}
                              alt={cruise.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                if (!e.target.src.includes('placeholder')) {
                                  e.target.src = "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop&crop=center";
                                }
                              }}
                            />
                            {/* Overlay Badge */}
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                              <p className="text-sm font-bold text-primary">
                                ${cruise.price || '899'}
                              </p>
                            </div>
                          </div>

                          {/* Cruise Details */}
                          <div className="p-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-1">
                              {cruise.name}
                            </h4>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {cruise.description || 'Embark on an unforgettable journey across the seas'}
                            </p>

                            {/* Cruise Info */}
                            <div className="space-y-2">
                              {cruise.duration && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span>{cruise.duration} days</span>
                                </div>
                              )}
                              {cruise.departurePort && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  <span>{cruise.departurePort}</span>
                                </div>
                              )}
                              {cruise.capacity && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Ship className="w-4 h-4 text-primary" />
                                  <span>Capacity: {cruise.capacity} guests</span>
                                </div>
                              )}
                            </div>

                            {/* View Details Button */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <span className="text-primary font-semibold text-sm group-hover:gap-2 flex items-center gap-1 transition-all">
                                View Details
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Mobile View All Button */}
                    <div className="mt-8 md:hidden">
                      <a
                        href={`/cruises?category=${selectedCategory.slug}`}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm"
                      >
                        View All {filteredCruises.length} Cruises
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}