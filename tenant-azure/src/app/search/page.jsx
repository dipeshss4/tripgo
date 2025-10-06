"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, MapPin, Calendar, Users, Search, Filter } from 'lucide-react';
import { cruiseApi, hotelApi, packageApi } from '../../lib/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    cruises: [],
    hotels: [],
    packages: []
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState({
    destination: searchParams.get('destination') || '',
    activity: searchParams.get('activity') || '',
    dates: searchParams.get('dates') || '',
    guests: searchParams.get('guests') || ''
  });

  const searchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build search parameters
      const searchParams = {};
      if (searchQuery.destination) {
        searchParams.destination = searchQuery.destination;
        searchParams.city = searchQuery.destination;
      }

      // Fetch real data from APIs
      const [cruisesRes, hotelsRes, packagesRes] = await Promise.allSettled([
        cruiseApi.getAll({ limit: 6, ...searchParams }),
        hotelApi.getAll({ limit: 6, ...searchParams }),
        packageApi.getAll({ limit: 6, ...searchParams })
      ]);

      const results = {
        cruises: cruisesRes.status === 'fulfilled' ? (cruisesRes.value?.data || []) : [],
        hotels: hotelsRes.status === 'fulfilled' ? (hotelsRes.value?.data || []) : [],
        packages: packagesRes.status === 'fulfilled' ? (packagesRes.value?.data || []) : []
      };

      setResults(results);
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    searchAll();
  }, [searchAll]);

  const totalResults = results.cruises.length + results.hotels.length + results.packages.length;

  const renderCruiseCard = (cruise) => (
    <div key={cruise.id} className="bg-white rounded-xl shadow ring-1 ring-black/5 overflow-hidden hover:shadow-lg transition">
      <div className="relative h-48">
        <img
          src={cruise.images?.[0] || cruise.image || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80"}
          alt={cruise.name || cruise.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white px-2 py-1 text-xs font-semibold rounded">Cruise</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 text-gray-700 px-2 py-1 text-xs font-semibold rounded">
            ★ {cruise.rating || 4.5}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{cruise.name || cruise.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{cruise.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">${Number(cruise.price || 0).toLocaleString()}</span>
            <span className="text-gray-500 text-sm">/person</span>
          </div>
          <Link
            href={`/cruises/${cruise.slug || cruise.id}`}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm font-semibold"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  const renderHotelCard = (hotel) => (
    <div key={hotel.id} className="bg-white rounded-xl shadow ring-1 ring-black/5 overflow-hidden hover:shadow-lg transition">
      <div className="relative h-48">
        <img
          src={hotel.images?.[0] || hotel.image || "https://images.unsplash.com/photo-1604147706284-703b2f9c2b52?w=800&q=80"}
          alt={hotel.name || hotel.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-green-600 text-white px-2 py-1 text-xs font-semibold rounded">Hotel</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 text-gray-700 px-2 py-1 text-xs font-semibold rounded">
            ★ {hotel.rating || 4.5}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{hotel.name || hotel.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{hotel.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">${Number(hotel.price || 0).toLocaleString()}</span>
            <span className="text-gray-500 text-sm">/night</span>
          </div>
          <Link
            href={`/hotels/${hotel.id}`}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm font-semibold"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  const renderPackageCard = (pkg) => (
    <div key={pkg.id} className="bg-white rounded-xl shadow ring-1 ring-black/5 overflow-hidden hover:shadow-lg transition">
      <div className="relative h-48">
        <img
          src={pkg.images?.[0] || pkg.image || "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?w=800&q=80"}
          alt={pkg.name || pkg.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-purple-600 text-white px-2 py-1 text-xs font-semibold rounded">Package</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 text-gray-700 px-2 py-1 text-xs font-semibold rounded">
            {pkg.duration} days
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{pkg.name || pkg.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{pkg.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">${Number(pkg.price || 0).toLocaleString()}</span>
            <span className="text-gray-500 text-sm">/person</span>
          </div>
          <Link
            href={`/packages/${pkg.id}`}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm font-semibold"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    switch (activeTab) {
      case 'cruises':
        return results.cruises.map(renderCruiseCard);
      case 'hotels':
        return results.hotels.map(renderHotelCard);
      case 'packages':
        return results.packages.map(renderPackageCard);
      default:
        return [
          ...results.cruises.map(renderCruiseCard),
          ...results.hotels.map(renderHotelCard),
          ...results.packages.map(renderPackageCard)
        ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-lg text-gray-600">Searching for the best deals...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={searchAll}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            {searchQuery.destination && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{searchQuery.destination}</span>
              </div>
            )}
            {searchQuery.activity && (
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-1" />
                <span>{searchQuery.activity}</span>
              </div>
            )}
            {searchQuery.dates && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{searchQuery.dates}</span>
              </div>
            )}
            {searchQuery.guests && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{searchQuery.guests} guests</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Search Results {searchQuery.destination && `for "${searchQuery.destination}"`}
          </h1>
          <p className="text-gray-600 mt-2">
            Found {totalResults} results
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'all', label: `All (${totalResults})` },
              { key: 'cruises', label: `Cruises (${results.cruises.length})` },
              { key: 'hotels', label: `Hotels (${results.hotels.length})` },
              { key: 'packages', label: `Packages (${results.packages.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Results */}
        {totalResults === 0 ? (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your search criteria or browse our popular options.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/cruises" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                Browse Cruises
              </Link>
              <Link href="/hotels" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                Browse Hotels
              </Link>
              <Link href="/packages" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                Browse Packages
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {renderResults()}
          </div>
        )}
      </div>
    </div>
  );
}