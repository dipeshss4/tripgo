"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Ship, Hotel, Plane, Mountain, FileText, Phone, ChevronDown, Search, User, Globe, Building2 } from "lucide-react";

const megaMenuData = {
  cruises: [
    {
      id: "cruise-mediterranean-odyssey",
      name: "Mediterranean Odyssey",
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&q=80",
      description: "Ancient ports & luxury",
      price: "$3,299"
    },
    {
      id: "cruise-royal-caribbean",
      name: "Caribbean Paradise",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80",
      description: "Island adventures await",
      price: "$2,599"
    }
  ],
  hotels: [
    {
      id: "hotel-bali-resort",
      name: "Bali Infinity Resort",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      description: "Oceanfront paradise",
      price: "$299/night"
    },
    {
      id: "hotel-swiss-chalet",
      name: "Swiss Alpine Chalet",
      image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&q=80",
      description: "Mountain luxury",
      price: "$199/night"
    }
  ],
  packages: [
    {
      id: "package-european-grand-tour",
      name: "European Grand Tour",
      image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80",
      description: "6 countries, 21 days",
      price: "$3,299"
    }
  ]
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  const handleDropdownToggle = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-800 text-white px-4 py-2 text-center text-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs">
            <span className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              +1 (555) 123-4567
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              support@azuretravel.com
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span>24/7 Customer Support</span>
            <span>|</span>
            <span>Licensed Travel Agency</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group inline-flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-slate-800">
                  AZURE
                </span>
                <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">
                  TRAVEL SOLUTIONS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 lg:flex">
              {/* Cruises Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('cruises')}
                onMouseLeave={closeAllDropdowns}
              >
                <button
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition py-3 px-4 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'cruises'}
                >
                  <Ship className="h-4 w-4" />
                  CRUISES
                  <ChevronDown className="h-3 w-3" />
                </button>

                <div className={`absolute left-0 mt-2 w-[700px] rounded-xl border border-gray-200 bg-white p-8 shadow-2xl ${activeDropdown === 'cruises' ? 'block' : 'hidden'}`}>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Luxury Ocean Cruises</h3>
                      <p className="text-sm text-gray-500 mt-1">Experience the world's finest cruise lines</p>
                    </div>
                    <Link href="/cruises" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                      VIEW ALL CRUISES →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {megaMenuData.cruises.map((cruise) => (
                      <Link
                        key={cruise.id}
                        href={`/cruises/${cruise.id}`}
                        className="group flex gap-4 rounded-lg p-4 hover:bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all"
                      >
                        <img
                          src={cruise.image}
                          alt={cruise.name}
                          className="h-20 w-28 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 mb-2">
                            {cruise.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{cruise.description}</p>
                          <p className="text-lg font-bold text-blue-600">{cruise.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hotels Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('hotels')}
                onMouseLeave={closeAllDropdowns}
              >
                <button
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition py-3 px-4 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'hotels'}
                >
                  <Hotel className="h-4 w-4" />
                  HOTELS
                  <ChevronDown className="h-3 w-3" />
                </button>

                <div className={`absolute left-0 mt-2 w-[700px] rounded-xl border border-gray-200 bg-white p-8 shadow-2xl ${activeDropdown === 'hotels' ? 'block' : 'hidden'}`}>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Premium Hotel Collection</h3>
                      <p className="text-sm text-gray-500 mt-1">Curated luxury accommodations worldwide</p>
                    </div>
                    <Link href="/hotels" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                      VIEW ALL HOTELS →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {megaMenuData.hotels.map((hotel) => (
                      <Link
                        key={hotel.id}
                        href={`/hotels/${hotel.id}`}
                        className="group flex gap-4 rounded-lg p-4 hover:bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all"
                      >
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="h-20 w-28 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 mb-2">
                            {hotel.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{hotel.description}</p>
                          <p className="text-lg font-bold text-blue-600">{hotel.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Travel Packages */}
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition py-3 px-4 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100"
              >
                <Plane className="h-4 w-4" />
                PACKAGES
              </Link>

              {/* Destinations */}
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition py-3 px-4 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100"
              >
                <Mountain className="h-4 w-4" />
                DESTINATIONS
              </Link>

              {/* About */}
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition py-3 px-4 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100"
              >
                <FileText className="h-4 w-4" />
                ABOUT
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden items-center gap-4 lg:flex">
              <button className="p-3 text-slate-600 hover:text-blue-600 transition rounded-lg hover:bg-blue-50">
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="#"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition py-3 px-4"
              >
                <User className="h-4 w-4" />
                CLIENT LOGIN
              </Link>
              <Link
                href="#"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-sm font-bold transition shadow-lg border-2 border-blue-600 hover:border-blue-700"
              >
                REQUEST QUOTE
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 lg:hidden hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="absolute left-0 right-0 top-20 bg-white shadow-2xl border-t border-gray-200 lg:hidden">
              <div className="p-6">
                <div className="space-y-4">
                  <Link href="/cruises" className="block text-slate-800 hover:text-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-50">CRUISES</Link>
                  <Link href="/hotels" className="block text-slate-800 hover:text-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-50">HOTELS</Link>
                  <Link href="/packages" className="block text-slate-800 hover:text-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-50">PACKAGES</Link>
                  <Link href="/destinations" className="block text-slate-800 hover:text-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-50">DESTINATIONS</Link>
                  <Link href="/about" className="block text-slate-800 hover:text-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-50">ABOUT</Link>
                  <hr className="my-4" />
                  <Link href="#" className="block text-slate-700 font-bold py-3 px-4">CLIENT LOGIN</Link>
                  <Link href="#" className="block bg-blue-600 text-white px-4 py-3 rounded-lg text-center font-bold hover:bg-blue-700">REQUEST QUOTE</Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}