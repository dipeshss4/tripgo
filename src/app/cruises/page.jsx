"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { cruiseApi } from "../../lib/api";
import { useApi } from "../components/hooks/useApi";

export default function CruisesIndex() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("");
  const [sort, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Create API parameters
  const apiParams = useMemo(() => {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      sortBy: sort,
      sortOrder: sortOrder,
    };

    if (query.trim()) params.search = query.trim();
    if (type) params.type = type;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (rating) params.rating = rating;

    return params;
  }, [query, type, minPrice, maxPrice, rating, sort, sortOrder, page]);

  // Use real API calls
  const {
    data: cruisesResponse,
    loading,
    error,
    refetch
  } = useApi(() => cruiseApi.getAll(apiParams), [apiParams]);

  const cruises = cruisesResponse?.data || [];
  const pagination = cruisesResponse?.pagination || { page: 1, pages: 1, total: 0 };

  const reset = () => {
    setQuery("");
    setType("");
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setPage(1);
  }, []);

  if (loading) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading cruises...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Cruises</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={refetch}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cruise Packages
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing cruise destinations and unforgettable experiences
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search cruises..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="">All Types</option>
                    <option value="ocean">Ocean Cruise</option>
                    <option value="river">River Cruise</option>
                    <option value="expedition">Expedition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min price"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max price"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="createdAt">Newest</option>
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          {cruises.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No cruises found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {cruises.length} of {pagination.total} cruises
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {cruises.map((cruise) => (
                  <div
                    key={cruise.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={cruise.images?.[0] || cruise.image || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80"}
                        alt={cruise.name || cruise.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 text-gray-700 px-2 py-1 text-xs font-semibold rounded">
                          ★ {cruise.rating || '4.5'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {cruise.name || cruise.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {cruise.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">
                          <span>{cruise.duration || '7 days'}</span>
                          {cruise.departure && (
                            <span className="ml-2">• {cruise.departure}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          {cruise.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${Number(cruise.originalPrice).toLocaleString()}
                            </span>
                          )}
                          <div className="text-2xl font-bold text-gray-900">
                            ${Number(cruise.price || 0).toLocaleString()}
                            <span className="text-sm font-normal text-gray-500">/person</span>
                          </div>
                        </div>
                        <Link
                          href={`/cruises/${cruise.id}`}
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          page === pageNum
                            ? 'bg-primary text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                      disabled={page === pagination.pages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}