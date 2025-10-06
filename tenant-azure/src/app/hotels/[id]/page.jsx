"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Star, MapPin, Wifi, Car, Dumbbell, Users, Bed, Calendar } from "lucide-react";
import { hotelApi } from "../../../lib/api";
import { useApi } from "../../components/hooks/useApi";

export default function HotelDetail({ params }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const { data: hotel, loading, error, refetch } = useApi(
    () => hotelApi.getById(params.id),
    [params.id]
  );

  const hotelData = hotel?.data;

  if (loading) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading hotel details...</span>
        </div>
      </main>
    );
  }

  if (error || !hotelData) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hotel not found</h1>
          <p className="text-gray-600 mb-4">{error || "The requested hotel could not be found."}</p>
          <div className="flex gap-4">
            <button
              onClick={refetch}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
            >
              Try Again
            </button>
            <Link
              href="/hotels"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
            >
              Back to Hotels
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
          src={hotelData.images?.[0] || hotelData.image}
          alt={hotelData.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur px-3 py-1">
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                <span className="font-semibold">{hotelData.rating || 4.5}</span>
              </div>
              <div className="flex items-center gap-1 text-white/90">
                <MapPin className="h-4 w-4" />
                {hotelData.city}, {hotelData.country}
              </div>
            </div>
            <h1 className="text-4xl font-bold sm:text-5xl">{hotelData.name}</h1>
            <p className="mt-4 text-xl text-white/90 max-w-2xl">{hotelData.description}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <section className="bg-white rounded-2xl p-6 shadow ring-1 ring-black/5">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotelData.images?.map((image, index) => (
                  <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${hotelData.name} - Image ${index + 1}`}
                      className="absolute inset-0 h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section className="bg-white rounded-2xl p-6 shadow ring-1 ring-black/5">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotelData.amenities?.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    {amenity.includes('WiFi') || amenity.includes('Wifi') ?
                      <Wifi className="h-5 w-5 text-blue-600" /> :
                      amenity.includes('Gym') || amenity.includes('Fitness') ?
                      <Dumbbell className="h-5 w-5 text-green-600" /> :
                      amenity.includes('Transport') || amenity.includes('Transfer') ?
                      <Car className="h-5 w-5 text-purple-600" /> :
                      <div className="h-5 w-5 rounded-full bg-gray-400" />
                    }
                    <span className="text-sm font-medium text-gray-900">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Room Types */}
            {hotelData.roomTypes?.length > 0 && (
              <section className="bg-white rounded-2xl p-6 shadow ring-1 ring-black/5">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Types</h2>
                <div className="space-y-4">
                  {hotelData.roomTypes.map((room, index) => (
                    <div
                      key={index}
                      className={`border rounded-xl p-4 cursor-pointer transition ${
                        selectedRoom === index
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRoom(selectedRoom === index ? null : index)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{room.type}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {room.size || 'Standard'} m²
                            </div>
                            {room.capacity && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Up to {room.capacity} guests
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ${Number(room.price || hotelData.price).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">per night</div>
                        </div>
                      </div>

                      {selectedRoom === index && room.amenities && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-900 mb-2">Room Amenities:</p>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl p-6 shadow ring-1 ring-black/5">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  ${Number(hotelData.price).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per night</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (!checkIn || !checkOut) {
                      alert('Please select check-in and check-out dates');
                      return;
                    }
                    alert('Booking functionality will be implemented soon!');
                  }}
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition"
                >
                  Book Now
                </button>

                <div className="text-center text-xs text-gray-600 mt-4">
                  Free cancellation up to 24 hours before check-in
                </div>
              </div>

              {/* Hotel Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Address</div>
                      <div className="text-gray-600">{hotelData.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Check-in / Check-out</div>
                      <div className="text-gray-600">3:00 PM / 11:00 AM</div>
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