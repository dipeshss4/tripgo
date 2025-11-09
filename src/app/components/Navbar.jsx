
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Ship,
  Hotel,
  Plane,
  Mountain,
  FileText,
  Phone,
  LogIn,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { cruiseApi, shipApi, hotelApi, packageApi } from "../../lib/api";
import { getCruiseCategories, getCruisesByCategory } from "../../lib/cruiseApi";
import { getShipCategories, getShipsByCategory } from "../../lib/shipApi";

/* ---------- Component ---------- */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  const [showCruises, setShowCruises] = useState(false);
  const [showShips, setShowShips] = useState(false);
  const [showHotels, setShowHotels] = useState(false);
  const [showPackages, setShowPackages] = useState(false);

  const [cruiseCategories, setCruiseCategories] = useState([]);
  const [shipCategories, setShipCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredShipCategory, setHoveredShipCategory] = useState(null);
  const [categoryCruises, setCategoryCruises] = useState({});
  const [categoryShips, setCategoryShips] = useState({});
  const [hotelList, setHotelList] = useState([]);
  const [packageList, setPackageList] = useState([]);

  const [loading, setLoading] = useState({
    cruises: false,
    ships: false,
    hotels: false,
    packages: false
  });

  const [error, setError] = useState({
    cruises: null,
    ships: null,
    hotels: null,
    packages: null
  });

  const cruiseTimer = useRef(null);
  const shipTimer = useRef(null);
  const hotelTimer = useRef(null);
  const packageTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // API Data Fetching Functions
  const fetchCruiseCategories = async () => {
    if (cruiseCategories.length > 0) return; // Don't refetch if already loaded

    setLoading(prev => ({ ...prev, cruises: true }));
    setError(prev => ({ ...prev, cruises: null }));

    try {
      const categories = await getCruiseCategories();
      setCruiseCategories(categories);
      sessionStorage.setItem('navbar-cruise-categories', JSON.stringify(categories));
    } catch (err) {
      console.error('Error fetching cruise categories:', err);
      setError(prev => ({ ...prev, cruises: 'Failed to load cruise categories' }));
    } finally {
      setLoading(prev => ({ ...prev, cruises: false }));
    }
  };

  const fetchCategoryCruises = async (categorySlug) => {
    // Check if already loaded
    if (categoryCruises[categorySlug]) return;

    try {
      const data = await getCruisesByCategory(categorySlug);
      if (data && data.cruises) {
        setCategoryCruises(prev => ({
          ...prev,
          [categorySlug]: data.cruises
        }));
      }
    } catch (err) {
      console.error(`Error fetching cruises for category ${categorySlug}:`, err);
    }
  };

  const handleCategoryHover = (category) => {
    setHoveredCategory(category.slug);
    // Fetch cruises for this category
    fetchCategoryCruises(category.slug);
  };

  const getStaticHotels = () => [
    { name: "Luxury Beach Resort", image: "https://images.unsplash.com/photo-1501117716987-c8e2a9ce5142?w=400&q=60&auto=format&fit=crop", href: "/hotels" },
    { name: "Mountain Retreat", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=60&auto=format&fit=crop", href: "/hotels" },
    { name: "Urban Boutique", image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400&q=60&auto=format&fit=crop", href: "/hotels" },
    { name: "Seaside Paradise", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=60&auto=format&fit=crop", href: "/hotels" },
    { name: "Desert Oasis", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=60&auto=format&fit=crop", href: "/hotels" },
    { name: "City Center Suites", image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=60&auto=format&fit=crop", href: "/hotels" }
  ];

  const fetchHotels = async () => {
    if (hotelList.length > 0) return; // Don't refetch if already loaded

    setLoading(prev => ({ ...prev, hotels: true }));
    setError(prev => ({ ...prev, hotels: null }));

    try {
      const response = await hotelApi.getAll({ limit: 6 });
      const hotels = response.data || [];
      setHotelList(hotels);
      sessionStorage.setItem('navbar-hotels', JSON.stringify(hotels));
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError(prev => ({ ...prev, hotels: 'Failed to load hotels' }));
      setHotelList(getStaticHotels());
    } finally {
      setLoading(prev => ({ ...prev, hotels: false }));
    }
  };

  const getStaticPackages = () => [
    { name: "European Adventure", image: "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400", href: "/packages" },
    { name: "Asian Explorer", image: "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=400", href: "/packages" },
    { name: "African Safari", image: "https://images.pexels.com/photos/667205/pexels-photo-667205.jpeg?auto=compress&cs=tinysrgb&w=400", href: "/packages" },
    { name: "South American Discovery", image: "https://images.pexels.com/photos/356269/pexels-photo-356269.jpeg?auto=compress&cs=tinysrgb&w=400", href: "/packages" },
    { name: "Pacific Islands", image: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400", href: "/packages" },
    { name: "USA National Parks", image: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=400", href: "/packages" }
  ];

  const fetchShipCategories = async () => {
    if (shipCategories.length > 0) return; // Don't refetch if already loaded

    setLoading(prev => ({ ...prev, ships: true }));
    setError(prev => ({ ...prev, ships: null }));

    try {
      const categories = await getShipCategories();
      setShipCategories(categories);
      sessionStorage.setItem('navbar-ship-categories', JSON.stringify(categories));
    } catch (err) {
      console.error('Error fetching ship categories:', err);
      setError(prev => ({ ...prev, ships: 'Failed to load ship categories' }));
    } finally {
      setLoading(prev => ({ ...prev, ships: false }));
    }
  };

  const fetchCategoryShips = async (categorySlug) => {
    // Check if already loaded
    if (categoryShips[categorySlug]) return;

    try {
      const data = await getShipsByCategory(categorySlug);
      if (data && data.ships) {
        setCategoryShips(prev => ({
          ...prev,
          [categorySlug]: data.ships
        }));
      }
    } catch (err) {
      console.error(`Error fetching ships for category ${categorySlug}:`, err);
    }
  };

  const handleShipCategoryHover = (category) => {
    setHoveredShipCategory(category.slug);
    // Fetch ships for this category
    fetchCategoryShips(category.slug);
  };

  const fetchPackages = async () => {
    if (packageList.length > 0) return; // Don't refetch if already loaded

    setLoading(prev => ({ ...prev, packages: true }));
    setError(prev => ({ ...prev, packages: null }));

    try {
      const response = await packageApi.getAll({ limit: 6 });
      const packages = response.data || [];
      setPackageList(packages);
      sessionStorage.setItem('navbar-packages', JSON.stringify(packages));
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(prev => ({ ...prev, packages: 'Failed to load packages' }));
      setPackageList(getStaticPackages());
    } finally {
      setLoading(prev => ({ ...prev, packages: false }));
    }
  };

  // Load initial data on component mount with caching and delayed fetching
  useEffect(() => {
    // Check if data exists in sessionStorage for caching
    const cachedCategories = sessionStorage.getItem('navbar-cruise-categories');
    const cachedShipCategories = sessionStorage.getItem('navbar-ship-categories');
    const cachedHotels = sessionStorage.getItem('navbar-hotels');
    const cachedPackages = sessionStorage.getItem('navbar-packages');

    if (cachedCategories) {
      try {
        setCruiseCategories(JSON.parse(cachedCategories));
      } catch (e) {
        console.error('Error parsing cached cruise categories:', e);
      }
    }

    if (cachedShipCategories) {
      try {
        setShipCategories(JSON.parse(cachedShipCategories));
      } catch (e) {
        console.error('Error parsing cached ship categories:', e);
      }
    }

    if (cachedHotels) {
      try {
        setHotelList(JSON.parse(cachedHotels));
      } catch (e) {
        console.error('Error parsing cached hotels:', e);
      }
    }

    if (cachedPackages) {
      try {
        setPackageList(JSON.parse(cachedPackages));
      } catch (e) {
        console.error('Error parsing cached packages:', e);
      }
    }

    // Only fetch if no cached data exists, and stagger the requests
    const loadData = async () => {
      if (!cachedCategories) {
        await fetchCruiseCategories();
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }

      if (!cachedShipCategories) {
        await fetchShipCategories();
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }

      if (!cachedHotels) {
        await fetchHotels();
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      }

      if (!cachedPackages) {
        await fetchPackages();
      }
    };

    // Delay initial load to avoid hitting rate limits
    const timer = setTimeout(loadData, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowCruises(false);
        setShowShips(false);
        setShowHotels(false);
        setShowPackages(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const LinkItem = ({ children, href = "#" }) => (
    <a
      href={href}
      className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition"
    >
      {children}
    </a>
  );

  const openCruises = () => {
    if (cruiseTimer.current) clearTimeout(cruiseTimer.current);
    setShowCruises(true);
    // Only fetch if not already loading and no data exists
    if (!loading.cruises && cruiseCategories.length === 0) {
      fetchCruiseCategories();
    }
  };
  const closeCruises = () => { cruiseTimer.current = setTimeout(() => setShowCruises(false), 120); };

  const openShipsMenu = () => {
    if (shipTimer.current) clearTimeout(shipTimer.current);
    setShowShips(true);
    // Only fetch if not already loading and no data exists
    if (!loading.ships && shipCategories.length === 0) {
      fetchShipCategories();
    }
  };
  const closeShipsMenu = () => { shipTimer.current = setTimeout(() => setShowShips(false), 120); };

  const openHotelsMenu = () => {
    if (hotelTimer.current) clearTimeout(hotelTimer.current);
    setShowHotels(true);
    // Only fetch if not already loading and no data exists
    if (!loading.hotels && hotelList.length === 0) {
      fetchHotels();
    }
  };
  const closeHotelsMenu = () => { hotelTimer.current = setTimeout(() => setShowHotels(false), 120); };

  const openPackagesMenu = () => {
    if (packageTimer.current) clearTimeout(packageTimer.current);
    setShowPackages(true);
    // Only fetch if not already loading and no data exists
    if (!loading.packages && packageList.length === 0) {
      fetchPackages();
    }
  };
  const closePackagesMenu = () => { packageTimer.current = setTimeout(() => setShowPackages(false), 120); };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition ${solid ? "bg-black/70 backdrop-blur-xl" : "bg-gradient-to-b from-black/80 via-black/30 to-transparent"}`}
    >
      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <a href="/" className="group inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <span className="font-black">T</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">TripGo</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 lg:flex">
            {/* Cruises */}
            <div className="relative" onMouseEnter={openCruises} onMouseLeave={closeCruises}>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition" aria-haspopup="true" aria-expanded={showCruises} onClick={() => setShowCruises((v) => !v)}>
                <Ship className="h-4 w-4" /> Cruises <ChevronDown className="h-4 w-4 opacity-80" />
              </button>
              <div className={`absolute left-0 mt-3 w-[420px] rounded-2xl border border-white/10 bg-black/80 p-4 text-white shadow-2xl backdrop-blur-md ${showCruises ? "block" : "hidden"}`} onMouseEnter={openCruises} onMouseLeave={closeCruises}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/90">Browse by Category</span>
                  <a href="/cruises" className="text-xs font-semibold text-white/80 hover:text-white">View all →</a>
                </div>
                {loading.cruises ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                    <span className="ml-2 text-sm text-white/60">Loading categories...</span>
                  </div>
                ) : error.cruises ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-400">{error.cruises}</p>
                    <button onClick={fetchCruiseCategories} className="mt-2 text-xs text-white/80 hover:text-white">Try again</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cruiseCategories.map((category) => {
                      const catCruises = categoryCruises[category.slug] || [];
                      return (
                        <div
                          key={category.id}
                          className="relative group/cat"
                          onMouseEnter={() => handleCategoryHover(category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <a
                            href={`/cruises?category=${category.slug}`}
                            className="flex items-center gap-3 rounded-lg p-3 hover:bg-white/10 transition border border-white/5 hover:border-white/20"
                            onClick={() => setShowCruises(false)}
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-2xl">
                              {category.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{category.name}</p>
                              <p className="truncate text-xs text-white/60">{category.description}</p>
                            </div>
                            <svg className="w-4 h-4 text-white/40 group-hover/cat:text-white/80 group-hover/cat:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </a>

                          {/* Submenu with cruises */}
                          {hoveredCategory === category.slug && (
                            <div className="absolute left-full top-0 ml-2 w-[320px] rounded-xl border border-white/10 bg-black/90 p-3 shadow-2xl backdrop-blur-md z-50">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="text-lg">{category.icon}</span>
                                <span className="text-xs font-semibold text-white/90">{category.name}</span>
                              </div>
                              {catCruises.length === 0 ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                                  <span className="ml-2 text-xs text-white/60">Loading...</span>
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                  {catCruises.slice(0, 5).map((cruise) => (
                                    <a
                                      key={cruise.id}
                                      href={`/cruises/${cruise.slug || cruise.id}`}
                                      className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10 transition"
                                      onClick={() => setShowCruises(false)}
                                    >
                                      <img
                                        src={cruise.images?.[0] || "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=48&h=48&fit=crop&crop=center"}
                                        alt={cruise.name}
                                        className="w-10 h-10 rounded object-cover ring-1 ring-white/10"
                                        onError={(e) => {
                                          if (!e.target.src.includes('placeholder')) {
                                            e.target.src = "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=48&h=48&fit=crop&crop=center";
                                          }
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="truncate text-xs font-medium text-white">{cruise.name}</p>
                                        <p className="truncate text-xs text-white/60">${cruise.price || '899'}</p>
                                      </div>
                                    </a>
                                  ))}
                                  {catCruises.length > 5 && (
                                    <a
                                      href={`/cruises?category=${category.slug}`}
                                      className="block text-center text-xs text-blue-400 hover:text-blue-300 py-2"
                                      onClick={() => setShowCruises(false)}
                                    >
                                      View all {catCruises.length} cruises →
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Ships */}
            <div className="relative" onMouseEnter={openShipsMenu} onMouseLeave={closeShipsMenu}>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition" aria-haspopup="true" aria-expanded={showShips} onClick={() => setShowShips((v) => !v)}>
                <Ship className="h-4 w-4" /> Ships <ChevronDown className="h-4 w-4 opacity-80" />
              </button>
              <div className={`absolute left-0 mt-3 w-[420px] rounded-2xl border border-white/10 bg-black/80 p-4 text-white shadow-2xl backdrop-blur-md ${showShips ? "block" : "hidden"}`} onMouseEnter={openShipsMenu} onMouseLeave={closeShipsMenu}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/90">Browse by Type</span>
                  <a href="/ships" className="text-xs font-semibold text-white/80 hover:text-white">View all →</a>
                </div>
                {loading.ships ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                    <span className="ml-2 text-sm text-white/60">Loading categories...</span>
                  </div>
                ) : error.ships ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-400">{error.ships}</p>
                    <button onClick={fetchShipCategories} className="mt-2 text-xs text-white/80 hover:text-white">Try again</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shipCategories.map((category) => {
                      const catShips = categoryShips[category.slug] || [];
                      return (
                        <div
                          key={category.id}
                          className="relative group/cat"
                          onMouseEnter={() => handleShipCategoryHover(category)}
                          onMouseLeave={() => setHoveredShipCategory(null)}
                        >
                          <a
                            href={`/ships?category=${category.slug}`}
                            className="flex items-center gap-3 rounded-lg p-3 hover:bg-white/10 transition border border-white/5 hover:border-white/20"
                            onClick={() => setShowShips(false)}
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-2xl">
                              {category.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{category.name}</p>
                              <p className="truncate text-xs text-white/60">{category.description}</p>
                            </div>
                            <svg className="w-4 h-4 text-white/40 group-hover/cat:text-white/80 group-hover/cat:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </a>

                          {/* Submenu with ships */}
                          {hoveredShipCategory === category.slug && (
                            <div className="absolute left-full top-0 ml-2 w-[320px] rounded-xl border border-white/10 bg-black/90 p-3 shadow-2xl backdrop-blur-md z-50">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="text-lg">{category.icon}</span>
                                <span className="text-xs font-semibold text-white/90">{category.name}</span>
                              </div>
                              {catShips.length === 0 ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                                  <span className="ml-2 text-xs text-white/60">Loading...</span>
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                  {catShips.slice(0, 5).map((ship) => (
                                    <a
                                      key={ship.id}
                                      href={`/ships/${ship.slug || ship.id}`}
                                      className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10 transition"
                                      onClick={() => setShowShips(false)}
                                    >
                                      <img
                                        src={ship.images?.[0] || ship.image || "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=48&h=48&fit=crop&crop=center"}
                                        alt={ship.name}
                                        className="w-10 h-10 rounded object-cover ring-1 ring-white/10"
                                        onError={(e) => {
                                          if (!e.target.src.includes('placeholder')) {
                                            e.target.src = "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=48&h=48&fit=crop&crop=center";
                                          }
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="truncate text-xs font-medium text-white">{ship.name}</p>
                                        <p className="truncate text-xs text-white/60">${ship.price || '499'}</p>
                                      </div>
                                    </a>
                                  ))}
                                  {catShips.length > 5 && (
                                    <a
                                      href={`/ships?category=${category.slug}`}
                                      className="block text-center text-xs text-blue-400 hover:text-blue-300 py-2"
                                      onClick={() => setShowShips(false)}
                                    >
                                      View all {catShips.length} ships →
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Hotels */}
            <div className="relative" onMouseEnter={openHotelsMenu} onMouseLeave={closeHotelsMenu}>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition" aria-haspopup="true" aria-expanded={showHotels} onClick={() => setShowHotels((v) => !v)}>
                <Hotel className="h-4 w-4" /> Hotels <ChevronDown className="h-4 w-4 opacity-80" />
              </button>
              <div className={`absolute left-0 mt-3 w-[560px] rounded-2xl border border-white/10 bg-black/80 p-4 text-white shadow-2xl backdrop-blur-md ${showHotels ? "block" : "hidden"}`} onMouseEnter={openHotelsMenu} onMouseLeave={closeHotelsMenu}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/90">Featured hotels</span>
                  <a href="/hotels" className="text-xs font-semibold text-white/80 hover:text-white">View all →</a>
                </div>
                {loading.hotels ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                    <span className="ml-2 text-sm text-white/60">Loading hotels...</span>
                  </div>
                ) : error.hotels ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-400">{error.hotels}</p>
                    <button onClick={fetchHotels} className="mt-2 text-xs text-white/80 hover:text-white">Try again</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {hotelList.map((h, index) => (
                      <a key={h.id || index} href={`/hotels/${h.id}`} className="group/item flex items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition" onClick={() => setShowHotels(false)}>
                        <img src={h.images?.[0] || h.image} alt={h.name} className="h-12 w-12 rounded object-cover ring-1 ring-white/10" onError={(e) => {
                          // Prevent infinite loops by checking if already using fallback
                          if (!e.target.src.includes('placeholder')) {
                            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=48&h=48&fit=crop&crop=center";
                          }
                        }} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{h.name}</p>
                          <p className="truncate text-xs text-white/70">${Number(h.price || 0).toLocaleString()}/night</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Travel Packages */}
            <div className="relative" onMouseEnter={openPackagesMenu} onMouseLeave={closePackagesMenu}>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition" aria-haspopup="true" aria-expanded={showPackages} onClick={() => setShowPackages((v) => !v)}>
                <Plane className="h-4 w-4" /> Travel Packages <ChevronDown className="h-4 w-4 opacity-80" />
              </button>
              <div className={`absolute left-0 mt-3 w-[560px] rounded-2xl border border-white/10 bg-black/80 p-4 text-white shadow-2xl backdrop-blur-md ${showPackages ? "block" : "hidden"}`} onMouseEnter={openPackagesMenu} onMouseLeave={closePackagesMenu}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/90">Popular packages</span>
                  <a href="/packages" className="text-xs font-semibold text-white/80 hover:text-white">View all →</a>
                </div>
                {loading.packages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                    <span className="ml-2 text-sm text-white/60">Loading packages...</span>
                  </div>
                ) : error.packages ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-400">{error.packages}</p>
                    <button onClick={fetchPackages} className="mt-2 text-xs text-white/80 hover:text-white">Try again</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {packageList.map((p, index) => (
                      <a key={p.id || index} href={`/packages/${p.id}`} className="group/item flex items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition" onClick={() => setShowPackages(false)}>
                        <img src={p.images?.[0] || p.image} alt={p.name} className="h-12 w-12 rounded object-cover ring-1 ring-white/10" onError={(e) => {
                          // Prevent infinite loops by checking if already using fallback
                          if (!e.target.src.includes('placeholder')) {
                            e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=48&h=48&fit=crop&crop=center";
                          }
                        }} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{p.name}</p>
                          <p className="truncate text-xs text-white/70">{p.duration} days - ${Number(p.price || 0).toLocaleString()}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <LinkItem href="/verify-document"><Ship className="h-4 w-4" /> Verify Documents</LinkItem>
            <LinkItem href="/destinations"><Mountain className="h-4 w-4" /> Destination</LinkItem>
            <LinkItem href="/blog"><FileText className="h-4 w-4" /> Blog</LinkItem>
            <LinkItem href="/contact"><Phone className="h-4 w-4" /> Contact</LinkItem>
          </div>

          {/* Right actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <a href="#" className="text-sm font-medium text-white/90 hover:text-white">Login</a>
            <a href="#" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition">Sign Up</a>
          </div>

          {/* Mobile toggle */}
          <button aria-label="Toggle menu" onClick={() => setOpen((v) => !v)} className="inline-flex items-center justify-center rounded-lg p-2 text-white lg:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mt-2 rounded-2xl border border-white/10 bg-black/70 p-4 backdrop-blur-md lg:hidden">
            <div className="grid gap-3">
              <a href="/cruises" className="text-white/90 hover:text-white">Cruises</a>
              <a href="/ships" className="text-white/90 hover:text-white">Ships</a>
              <a href="/hotels" className="text-white/90 hover:text-white">Hotels</a>
              <a href="/packages" className="text-white/90 hover:text-white">Travel Packages</a>
              <a href="/verify-document" className="text-white/90 hover:text-white">Verify Documents</a>
              <a href="/destinations" className="text-white/90 hover:text-white">Destination</a>
              <a href="/blog" className="text-white/90 hover:text-white">Blog</a>
              <a href="/contact" className="text-white/90 hover:text-white">Contact</a>
            </div>

            {/* Optional quick picks */}
            {hotelList.length > 0 && (
              <>
                <div className="mt-4 text-sm font-semibold text-white/80">Popular hotels</div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {hotelList.slice(0, 4).map((h) => (
                    <a key={h.id} href={`/hotels/${h.id}`} className="flex items-center gap-2 rounded-lg border border-white/10 p-2 hover:bg-white/10">
                      <img src={h.images?.[0] || h.image} alt={h.name} className="h-10 w-10 rounded object-cover ring-1 ring-white/10" onError={(e) => {
                        // Prevent infinite loops by checking if already using fallback
                        if (!e.target.src.includes('placeholder')) {
                          e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=40&h=40&fit=crop&crop=center";
                        }
                      }} />
                      <span className="truncate text-xs text-white/90">{h.name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 flex items-center gap-3">
              <a href="#" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/90 hover:text-white">
                <LogIn className="h-4 w-4" /> Login
              </a>
              <a href="#" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                Create account
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
