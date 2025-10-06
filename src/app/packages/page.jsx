"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Star, MapPin, Clock, Users, Plane } from "lucide-react";
import { packageApi } from "../../lib/api";
import { useApi } from "../components/hooks/useApi";

export default function PackagesPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    minPrice: '',
    maxPrice: '',
    destination: '',
    duration: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data: packagesData, loading, error, refetch } = useApi(
    () => packageApi.getAll(filters),
    [filters]
  );

  const packages = packagesData?.data || [];
  const pagination = packagesData?.pagination || {};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && filters.page === 1) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading packages...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-blue-600 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Travel Packages
          </h1>
          <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
            Curated travel experiences combining flights, accommodations, and unforgettable activities
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                placeholder="Any destination"
                value={filters.destination}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="$0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="$10000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any duration</option>
                <option value="7">Up to 7 days</option>
                <option value="14">Up to 14 days</option>
                <option value="21">Up to 21 days</option>
                <option value="30">30+ days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration-asc">Duration: Short to Long</option>
                <option value="duration-desc">Duration: Long to Short</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
              <button
                onClick={() => setFilters({
                  page: 1,
                  limit: 12,
                  minPrice: '',
                  maxPrice: '',
                  destination: '',
                  duration: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                })}
                className="w-full rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load packages</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {pagination.total} Packages Found
              </h2>
              {loading && (
                <div className="flex items-center text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              )}
            </div>

            {/* Packages Grid */}
            {packages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No packages match your current filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} package={pkg} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        page === pagination.page
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function PackageCard({ package: pkg }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="relative h-60 w-full">
        <img
          src={pkg.images?.[0] || pkg.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828"}
          alt={pkg.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Duration badge */}
        <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {pkg.duration} days
        </div>

        {/* Title over image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="line-clamp-1 text-lg font-semibold text-white drop-shadow">
            {pkg.name}
          </h3>
          <div className="flex items-center text-white/90 text-sm mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {pkg.destinations?.slice(0, 2).join(', ')}
            {pkg.destinations?.length > 2 && ` +${pkg.destinations.length - 2} more`}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <p className="line-clamp-2 text-sm text-gray-600 mb-4">{pkg.description}</p>

        {/* Inclusions */}
        {pkg.inclusions?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {pkg.inclusions.slice(0, 3).map((inclusion, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
              >
                {inclusion.includes('flight') || inclusion.includes('Flight') ?
                  <Plane className="h-3 w-3 mr-1" /> : null}
                {inclusion.length > 25 ? `${inclusion.substring(0, 25)}...` : inclusion}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {pkg.duration} days
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {pkg.destinations?.length || 0} destinations
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">From</p>
            <p className="text-xl font-bold text-gray-900">
              ${Number(pkg.price || 0).toLocaleString()}/person
            </p>
          </div>
          <Link
            href={`/packages/${pkg.id}`}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}