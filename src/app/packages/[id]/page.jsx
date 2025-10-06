"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Clock, MapPin, Users, Calendar, CheckCircle, XCircle, Plane } from "lucide-react";
import { packageApi } from "../../../lib/api";
import { useApi } from "../../components/hooks/useApi";

export default function PackageDetail({ params }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [showInclusions, setShowInclusions] = useState(true);

  const { data: packageData, loading, error, refetch } = useApi(
    () => packageApi.getById(params.id),
    [params.id]
  );

  const pkg = packageData?.data;

  if (loading) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading package details...</span>
        </div>
      </main>
    );
  }

  if (error || !pkg) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Package not found</h1>
          <p className="text-gray-600 mb-4">{error || "The requested package could not be found."}</p>
          <div className="flex gap-4">
            <button
              onClick={refetch}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
            >
              Try Again
            </button>
            <Link
              href="/packages"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              Back to Packages
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50">
      {/* Hero Image */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <img
          src={pkg.images?.[0] || pkg.image}
          alt={pkg.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur px-3 py-1">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">{pkg.duration} days</span>
              </div>
              <div className="flex items-center gap-1 text-white/90">
                <MapPin className="h-4 w-4" />
                {pkg.destinations?.length || 0} destinations
              </div>
            </div>
            <h1 className="text-4xl font-bold sm:text-5xl">{pkg.name}</h1>
            <p className="mt-4 text-xl text-white/90 max-w-2xl">{pkg.description}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Destinations */}
            {pkg.destinations?.length > 0 && (
              <section className="bg-white rounded-2xl p-6 shadow ring-1 ring-black/5">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Destinations</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pkg.destinations.map((destination, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{destination}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Image Gallery */}
            <section className="bg-white rounded-2xl p-6 shadow ring-1 ring-black/5">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pkg.images?.map((image, index) => (
                  <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${pkg.name} - Image ${index + 1}`}
                      className="absolute inset-0 h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            {pkg.itinerary?.days && (
              <section className="bg-white rounded-2xl p-6 shadow ring-1 ring-black/5">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Itinerary</h2>
                <div className="space-y-6">
                  {pkg.itinerary.days.map((day, index) => (
                    <div key={index} className="border-l-4 border-primary pl-6 pb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">
                          {day.day}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{day.location}</h3>
                      </div>
                      {day.activities && (
                        <div className="flex flex-wrap gap-2">
                          {day.activities.map((activity, actIndex) => (
                            <span
                              key={actIndex}
                              className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inclusions & Exclusions */}
            <section className="bg-white rounded-2xl p-6 shadow ring-1 ring-black/5">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setShowInclusions(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    showInclusions
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  What's Included
                </button>
                <button
                  onClick={() => setShowInclusions(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    !showInclusions
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  What's Excluded
                </button>
              </div>

              {showInclusions ? (
                <div className="space-y-3">
                  {pkg.inclusions?.map((inclusion, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{inclusion}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {pkg.exclusions?.map((exclusion, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{exclusion}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl p-6 shadow ring-1 ring-black/5">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  ${Number(pkg.price).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per person</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} Traveler{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span>Package price × {travelers}</span>
                    <span>${(Number(pkg.price) * travelers).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span>Service fee</span>
                    <span>$99</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>${(Number(pkg.price) * travelers + 99).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!selectedDate) {
                      alert('Please select a departure date');
                      return;
                    }
                    alert('Booking functionality will be implemented soon!');
                  }}
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition"
                >
                  Book Now
                </button>

                <div className="text-center text-xs text-gray-600 mt-4">
                  Free cancellation up to 30 days before departure
                </div>
              </div>

              {/* Package Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Duration</div>
                      <div className="text-gray-600">{pkg.duration} days</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Destinations</div>
                      <div className="text-gray-600">{pkg.destinations?.join(', ')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Group Size</div>
                      <div className="text-gray-600">Maximum 20 travelers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}