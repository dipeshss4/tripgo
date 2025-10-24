import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const packages = [
  // European Tours (5)
  {
    name: 'Grand European Explorer',
    description: 'Experience the best of Europe in 15 days! Visit Paris, Amsterdam, Berlin, Prague, Vienna, and Rome. Includes guided city tours, museum visits, Seine river cruise, and authentic local dining experiences. Perfect for first-time European travelers.',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
    images: [
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
      'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800'
    ],
    destinations: ['Paris', 'Amsterdam', 'Berlin', 'Prague', 'Vienna', 'Rome'],
    category: 'Multi-City Tour',
    duration: 15,
    groupSize: 25,
    price: 3299,
    rating: 4.8,
    inclusions: [
      '14 nights accommodation',
      'Daily breakfast',
      '10 dinners',
      'All transportation between cities',
      'Guided city tours',
      'Museum entry tickets',
      'Seine River cruise',
      'Professional tour guide'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-3: Paris (Eiffel Tower, Louvre, Versailles) • Day 4-5: Amsterdam (Canal cruise, Anne Frank House) • Day 6-7: Berlin (Brandenburg Gate, Museum Island) • Day 8-9: Prague (Old Town, Castle) • Day 10-11: Vienna (Schönbrunn Palace, Opera House) • Day 12-15: Rome (Colosseum, Vatican, Trevi Fountain)',
    highlights: [
      'Eiffel Tower at night',
      'Amsterdam canal cruise',
      'Berlin Wall memorial',
      'Prague Castle tour',
      'Vienna Opera performance',
      'Vatican Museums'
    ]
  },
  {
    name: 'Mediterranean Coastal Escape',
    description: 'Discover the stunning Mediterranean coastline with visits to Barcelona, French Riviera, Italian Coast, and Greek Islands. Includes yacht experiences, wine tastings, cooking classes, and beachfront accommodations.',
    image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
    images: [
      'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
      'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800'
    ],
    destinations: ['Barcelona', 'Nice', 'Amalfi Coast', 'Santorini'],
    category: 'Coastal Tour',
    duration: 12,
    groupSize: 18,
    price: 4599,
    rating: 4.9,
    inclusions: [
      '11 nights luxury accommodation',
      'All meals',
      'Private yacht experience',
      'Wine tasting tours',
      'Cooking classes',
      'All transfers',
      'Local guides',
      'Ferry tickets'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-3: Barcelona (Sagrada Familia, Gothic Quarter, Beach) • Day 4-5: French Riviera (Monaco, Cannes, Nice) • Day 6-8: Amalfi Coast (Positano, Capri, Pompeii) • Day 9-12: Santorini (Oia sunset, Wine tours, Beaches)',
    highlights: [
      'Sagrada Familia visit',
      'Monaco yacht experience',
      'Amalfi Coast drive',
      'Capri boat tour',
      'Santorini sunset',
      'Greek cooking class'
    ]
  },
  {
    name: 'Scandinavian Adventure',
    description: 'Explore the beauty of Nordic countries! Visit Copenhagen, Stockholm, Oslo, and Bergen. Experience fjord cruises, Northern Lights, Viking history, and modern Scandinavian culture.',
    image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800',
    images: [
      'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800',
      'https://images.unsplash.com/photo-1518693021-5e9bebf4ed1f?w=800',
      'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800'
    ],
    destinations: ['Copenhagen', 'Stockholm', 'Oslo', 'Bergen'],
    category: 'Cultural Tour',
    duration: 10,
    groupSize: 20,
    price: 3799,
    rating: 4.7,
    inclusions: [
      '9 nights accommodation',
      'Daily breakfast',
      '5 dinners',
      'Fjord cruise',
      'All train tickets',
      'City tours',
      'Viking museum entry',
      'Northern Lights tour (seasonal)'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-2: Copenhagen (Tivoli, Little Mermaid, Nyhavn) • Day 3-4: Stockholm (Old Town, Vasa Museum, Archipelago) • Day 5-7: Oslo (Viking Ships, Opera House, Vigeland Park) • Day 8-10: Bergen (Bryggen, Fjord cruise, Mount Fløyen)',
    highlights: [
      'Tivoli Gardens',
      'Stockholm archipelago cruise',
      'Viking Ship Museum',
      'Norwegian fjords',
      'Bergen Fish Market',
      'Northern Lights viewing'
    ]
  },
  {
    name: 'British Isles Heritage Tour',
    description: 'Journey through England, Scotland, and Ireland. Explore castles, highlands, charming villages, whisky distilleries, and rich Celtic heritage. Includes Edinburgh Festival (seasonal).',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    images: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
      'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
      'https://images.unsplash.com/photo-1561881405-5ec0a6c9dc37?w=800'
    ],
    destinations: ['London', 'Edinburgh', 'Scottish Highlands', 'Dublin'],
    category: 'Heritage Tour',
    duration: 14,
    groupSize: 22,
    price: 3899,
    rating: 4.8,
    inclusions: [
      '13 nights accommodation',
      'Daily breakfast',
      '8 dinners',
      'All transportation',
      'Castle entry fees',
      'Whisky tasting',
      'Guided tours',
      'Traditional pub experiences'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-4: London (Tower, Buckingham Palace, Thames cruise) • Day 5-7: Edinburgh (Castle, Royal Mile, Festival) • Day 8-10: Scottish Highlands (Loch Ness, Glencoe, Isle of Skye) • Day 11-14: Dublin (Trinity College, Cliffs of Moher, Guinness)',
    highlights: [
      'Tower of London',
      'Edinburgh Castle',
      'Highland landscapes',
      'Loch Ness cruise',
      'Cliffs of Moher',
      'Traditional Irish music'
    ]
  },
  {
    name: 'Eastern Europe Discovery',
    description: 'Uncover the hidden gems of Eastern Europe. Visit Budapest, Krakow, Prague, and Vienna. Experience thermal baths, medieval architecture, Jewish heritage, and vibrant nightlife.',
    image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
    images: [
      'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
      'https://images.unsplash.com/photo-1581804928381-c1e4f8a97bed?w=800',
      'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800'
    ],
    destinations: ['Budapest', 'Krakow', 'Prague', 'Vienna'],
    category: 'Cultural Tour',
    duration: 11,
    groupSize: 20,
    price: 2799,
    rating: 4.7,
    inclusions: [
      '10 nights accommodation',
      'Daily breakfast',
      '7 dinners',
      'All train transfers',
      'Guided city tours',
      'Thermal bath entry',
      'Auschwitz visit',
      'River cruise'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-3: Budapest (Parliament, Thermal Baths, Danube cruise) • Day 4-6: Krakow (Old Town, Auschwitz, Salt Mines) • Day 7-9: Prague (Castle, Old Town, Beer tours) • Day 10-11: Vienna (Schönbrunn, Museums)',
    highlights: [
      'Budapest thermal baths',
      'Auschwitz-Birkenau',
      'Prague astronomical clock',
      'Wieliczka Salt Mine',
      'Danube River cruise',
      'Traditional Czech beer'
    ]
  },

  // Asian Adventures (5)
  {
    name: 'Southeast Asia Highlights',
    description: 'Ultimate Southeast Asia experience! Visit Thailand, Vietnam, Cambodia, and Singapore. Explore temples, floating markets, Ha Long Bay, Angkor Wat, and modern Asian cities.',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
    images: [
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
      'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800',
      'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800'
    ],
    destinations: ['Bangkok', 'Hanoi', 'Siem Reap', 'Singapore'],
    category: 'Cultural Adventure',
    duration: 16,
    groupSize: 20,
    price: 2999,
    rating: 4.9,
    inclusions: [
      '15 nights accommodation',
      'Daily breakfast',
      '12 dinners',
      'All flights between cities',
      'Ha Long Bay cruise',
      'Temple entry fees',
      'Tuk-tuk rides',
      'Cooking classes'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-4: Bangkok (Grand Palace, Floating Markets, Street food) • Day 5-8: Hanoi & Ha Long Bay (Old Quarter, Bay cruise) • Day 9-12: Siem Reap (Angkor Wat, Bayon Temple) • Day 13-16: Singapore (Gardens, Marina Bay)',
    highlights: [
      'Grand Palace Bangkok',
      'Ha Long Bay overnight cruise',
      'Angkor Wat sunrise',
      'Vietnamese cooking class',
      'Floating markets',
      'Singapore skyline'
    ]
  },
  {
    name: 'Japan Cultural Journey',
    description: 'Immerse yourself in Japanese culture. Visit Tokyo, Kyoto, Osaka, and Hiroshima. Experience temples, gardens, bullet trains, traditional tea ceremonies, sushi making, and cherry blossoms (seasonal).',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800',
    images: [
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800',
      'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800',
      'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800'
    ],
    destinations: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'],
    category: 'Cultural Tour',
    duration: 12,
    groupSize: 16,
    price: 4299,
    rating: 4.9,
    inclusions: [
      '11 nights accommodation',
      'Daily breakfast',
      '6 traditional dinners',
      'JR Rail Pass',
      'Temple entry fees',
      'Tea ceremony',
      'Sushi making class',
      'English-speaking guide'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-4: Tokyo (Shibuya, Temples, Mt. Fuji day trip) • Day 5-8: Kyoto (Fushimi Inari, Bamboo Grove, Geisha district) • Day 9-10: Osaka (Castle, Street food, Nara day trip) • Day 11-12: Hiroshima (Peace Memorial, Miyajima)',
    highlights: [
      'Mt. Fuji views',
      'Fushimi Inari shrine',
      'Bamboo forest',
      'Tea ceremony experience',
      'Osaka street food',
      'Miyajima floating torii'
    ]
  },
  {
    name: 'India Golden Triangle',
    description: 'Discover India\'s most iconic destinations. Visit Delhi, Agra, and Jaipur. Experience the Taj Mahal, majestic forts, vibrant bazaars, traditional cuisine, and rich Mughal heritage.',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800'
    ],
    destinations: ['Delhi', 'Agra', 'Jaipur'],
    category: 'Heritage Tour',
    duration: 8,
    groupSize: 18,
    price: 1799,
    rating: 4.8,
    inclusions: [
      '7 nights accommodation',
      'Daily breakfast',
      '5 traditional dinners',
      'All transportation',
      'Monument entry fees',
      'Taj Mahal sunrise visit',
      'Elephant ride',
      'Cultural shows'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-3: Delhi (Red Fort, India Gate, Qutub Minar, Street food tour) • Day 4-5: Agra (Taj Mahal sunrise, Agra Fort, Fatehpur Sikri) • Day 6-8: Jaipur (Amber Fort, City Palace, Hawa Mahal, Bazaar shopping)',
    highlights: [
      'Taj Mahal at sunrise',
      'Red Fort Delhi',
      'Amber Fort elephant ride',
      'Hawa Mahal',
      'Traditional Rajasthani dinner',
      'Local bazaar shopping'
    ]
  },
  {
    name: 'Bali & Indonesia Island Paradise',
    description: 'Explore the enchanting islands of Indonesia. Visit Bali, Gili Islands, and Java. Experience rice terraces, temples, beaches, snorkeling, traditional dance, and volcanic landscapes.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800'
    ],
    destinations: ['Bali', 'Gili Islands', 'Yogyakarta'],
    category: 'Island Adventure',
    duration: 14,
    groupSize: 16,
    price: 2599,
    rating: 4.8,
    inclusions: [
      '13 nights accommodation',
      'Daily breakfast',
      '8 dinners',
      'All transfers',
      'Snorkeling trips',
      'Temple visits',
      'Cooking class',
      'Traditional dance show'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-6: Bali (Ubud rice terraces, Temples, Beach clubs, Volcano trek) • Day 7-10: Gili Islands (Snorkeling, Beaches, Island hopping) • Day 11-14: Yogyakarta (Borobudur, Prambanan, Sultan Palace)',
    highlights: [
      'Tegallalang Rice Terraces',
      'Tanah Lot Temple',
      'Gili Islands snorkeling',
      'Borobudur sunrise',
      'Traditional Balinese dance',
      'Cooking class in Ubud'
    ]
  },
  {
    name: 'Sri Lanka Complete Tour',
    description: 'Discover the pearl of the Indian Ocean. Visit ancient cities, tea plantations, wildlife safaris, pristine beaches, and UNESCO World Heritage sites. Experience warm Sri Lankan hospitality.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1591184491583-7e4f79a896fe?w=800',
      'https://images.unsplash.com/photo-1598970605070-92d5de0d7b79?w=800'
    ],
    destinations: ['Colombo', 'Kandy', 'Nuwara Eliya', 'Yala', 'Galle'],
    category: 'Cultural & Wildlife',
    duration: 10,
    groupSize: 15,
    price: 2199,
    rating: 4.7,
    inclusions: [
      '9 nights accommodation',
      'Daily breakfast',
      '6 dinners',
      'All transportation',
      'Safari jeep',
      'Tea plantation tour',
      'Temple entry fees',
      'Train journey'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-2: Colombo (City tour, Markets) • Day 3-4: Kandy (Temple of Tooth, Cultural show) • Day 5-6: Nuwara Eliya (Tea plantations, Scenic train) • Day 7-8: Yala (Wildlife safari) • Day 9-10: Galle (Fort, Beaches)',
    highlights: [
      'Temple of the Tooth',
      'Scenic hill country train',
      'Tea plantation visit',
      'Yala National Park safari',
      'Galle Fort',
      'Beach relaxation'
    ]
  },

  // South American Adventures (4)
  {
    name: 'Peru Adventure: Machu Picchu & Amazon',
    description: 'Experience the best of Peru! Trek to Machu Picchu, explore Cusco, cruise Lake Titicaca, and discover the Amazon rainforest. Ancient civilizations meet natural wonders.',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
    images: [
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
      'https://images.unsplash.com/photo-1531065208531-4036c0dba3f5?w=800'
    ],
    destinations: ['Lima', 'Cusco', 'Machu Picchu', 'Amazon'],
    category: 'Adventure & Culture',
    duration: 12,
    groupSize: 14,
    price: 3499,
    rating: 4.9,
    inclusions: [
      '11 nights accommodation',
      'Daily breakfast',
      '8 dinners',
      'Train to Machu Picchu',
      'Amazon lodge stay',
      'Guided treks',
      'All entry fees',
      'Local flights'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-2: Lima (City tour, Food tour) • Day 3-6: Cusco & Sacred Valley (Inca sites, Markets, Acclimatization) • Day 7-8: Machu Picchu (Inca Trail or train, Guided tour) • Day 9-12: Amazon (Jungle lodge, Wildlife tours, River cruise)',
    highlights: [
      'Machu Picchu sunrise',
      'Inca Trail trek',
      'Sacred Valley ruins',
      'Amazon wildlife',
      'Peruvian cuisine',
      'Lake Titicaca floating islands'
    ]
  },
  {
    name: 'Patagonia Explorer',
    description: 'Adventure through stunning Patagonia! Visit Torres del Paine, Perito Moreno Glacier, El Calafate, and Ushuaia. Hiking, glacier walks, and dramatic landscapes await.',
    image: 'https://images.unsplash.com/photo-1531466998902-25d2c7a7f3b0?w=800',
    images: [
      'https://images.unsplash.com/photo-1531466998902-25d2c7a7f3b0?w=800',
      'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ],
    destinations: ['Torres del Paine', 'El Calafate', 'Ushuaia'],
    category: 'Adventure & Nature',
    duration: 10,
    groupSize: 12,
    price: 4199,
    rating: 4.8,
    inclusions: [
      '9 nights accommodation',
      'Daily breakfast',
      '6 dinners',
      'All transfers',
      'Glacier trekking',
      'National park fees',
      'Hiking guides',
      'Boat tours'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-4: Torres del Paine (W Trek, Base of Towers hike, Grey Glacier) • Day 5-7: El Calafate (Perito Moreno Glacier, Ice trekking) • Day 8-10: Ushuaia (Beagle Channel, Tierra del Fuego, Penguin colonies)',
    highlights: [
      'Torres del Paine W Trek',
      'Perito Moreno Glacier',
      'Ice trekking experience',
      'Beagle Channel cruise',
      'End of the world train',
      'Penguin watching'
    ]
  },
  {
    name: 'Brazil Highlights Tour',
    description: 'Experience vibrant Brazil! Visit Rio de Janeiro, Iguazu Falls, Amazon rainforest, and Salvador. Beaches, waterfalls, carnival culture, and tropical paradise.',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    images: [
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
      'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800',
      'https://images.unsplash.com/photo-1621795409974-cf23c2c86700?w=800'
    ],
    destinations: ['Rio de Janeiro', 'Iguazu Falls', 'Amazon', 'Salvador'],
    category: 'Cultural & Nature',
    duration: 14,
    groupSize: 18,
    price: 3799,
    rating: 4.7,
    inclusions: [
      '13 nights accommodation',
      'Daily breakfast',
      '9 dinners',
      'All domestic flights',
      'Christ the Redeemer',
      'Iguazu Falls tours',
      'Amazon lodge',
      'Samba show'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-4: Rio (Christ Redeemer, Sugarloaf, Copacabana, Samba show) • Day 5-7: Iguazu Falls (Brazilian & Argentine sides, Boat rides) • Day 8-11: Amazon (Jungle lodge, Wildlife tours, River expeditions) • Day 12-14: Salvador (Historic center, Beaches)',
    highlights: [
      'Christ the Redeemer',
      'Copacabana Beach',
      'Iguazu Falls boat ride',
      'Amazon wildlife',
      'Carnival culture',
      'Bahian cuisine'
    ]
  },
  {
    name: 'Ecuador & Galapagos Islands',
    description: 'Explore Ecuador and the legendary Galapagos! Visit Quito, Amazon jungle, and spend 5 days island hopping with unique wildlife encounters.',
    image: 'https://images.unsplash.com/photo-1590010773740-b2b9e3e46cc1?w=800',
    images: [
      'https://images.unsplash.com/photo-1590010773740-b2b9e3e46cc1?w=800',
      'https://images.unsplash.com/photo-1542732351-b44b3b5c5e30?w=800',
      'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=800'
    ],
    destinations: ['Quito', 'Amazon', 'Galapagos Islands'],
    category: 'Wildlife & Adventure',
    duration: 12,
    groupSize: 12,
    price: 5299,
    rating: 4.9,
    inclusions: [
      '11 nights accommodation',
      'Daily breakfast',
      '8 dinners',
      'All flights',
      'Galapagos cruise',
      'Snorkeling equipment',
      'Naturalist guides',
      'National park fees'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-2: Quito (Old Town, Equator monument) • Day 3-5: Amazon (Jungle lodge, Wildlife, Indigenous communities) • Day 6-12: Galapagos (Island hopping, Snorkeling, Giant tortoises, Sea lions, Marine iguanas)',
    highlights: [
      'Middle of the world',
      'Amazon jungle trek',
      'Giant tortoises',
      'Sea lion swimming',
      'Snorkeling with penguins',
      'Darwin research station'
    ]
  },

  // African Safaris (3)
  {
    name: 'East African Safari Adventure',
    description: 'Ultimate safari experience in Kenya and Tanzania! Witness the Great Migration, Big Five game drives, Maasai culture, and stunning savanna landscapes.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
    images: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800'
    ],
    destinations: ['Nairobi', 'Masai Mara', 'Serengeti', 'Ngorongoro'],
    category: 'Wildlife Safari',
    duration: 10,
    groupSize: 12,
    price: 4899,
    rating: 4.9,
    inclusions: [
      '9 nights safari lodges',
      'All meals',
      'Daily game drives',
      'Safari vehicles',
      'Professional guides',
      'Park fees',
      'Maasai village visit',
      'Hot air balloon (optional)'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-2: Nairobi (Giraffe Centre, Elephant orphanage) • Day 3-5: Masai Mara (Game drives, Great Migration, Maasai culture) • Day 6-8: Serengeti (Big Five tracking, Bush walks) • Day 9-10: Ngorongoro Crater (Crater tour, Return)',
    highlights: [
      'Great Migration',
      'Big Five encounters',
      'Maasai village visit',
      'Ngorongoro Crater',
      'Balloon safari',
      'Sundowner drinks'
    ]
  },
  {
    name: 'South Africa Grand Tour',
    description: 'Comprehensive South Africa experience! Visit Cape Town, Garden Route, Kruger National Park, and Winelands. Safaris, beaches, wine, and cultural diversity.',
    image: 'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=800',
    images: [
      'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=800',
      'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800',
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800'
    ],
    destinations: ['Cape Town', 'Garden Route', 'Kruger', 'Winelands'],
    category: 'Safari & Culture',
    duration: 14,
    groupSize: 16,
    price: 4299,
    rating: 4.8,
    inclusions: [
      '13 nights accommodation',
      'Daily breakfast',
      '8 dinners',
      'Safari drives',
      'Wine tastings',
      'Table Mountain',
      'Penguin colony visit',
      'All transportation'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-4: Cape Town (Table Mountain, Cape Point, Waterfront, Township tour) • Day 5-7: Garden Route (Knysna, Plettenberg, Oudtshoorn) • Day 8-11: Kruger (Game drives, Big Five, Bush walks) • Day 12-14: Winelands (Stellenbosch, Franschhoek)',
    highlights: [
      'Table Mountain cable car',
      'Cape of Good Hope',
      'Penguin beach',
      'Big Five safari',
      'Wine country tours',
      'Garden Route scenery'
    ]
  },
  {
    name: 'Morocco Imperial Cities',
    description: 'Discover the magic of Morocco! Visit Marrakech, Fes, Sahara Desert, and Casablanca. Medinas, souks, camel treks, riads, and Moroccan cuisine.',
    image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
    images: [
      'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
      'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800',
      'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800'
    ],
    destinations: ['Marrakech', 'Fes', 'Sahara', 'Casablanca'],
    category: 'Cultural Tour',
    duration: 10,
    groupSize: 18,
    price: 2499,
    rating: 4.7,
    inclusions: [
      '9 nights accommodation',
      'Daily breakfast',
      '7 dinners',
      'All transportation',
      'Camel trek',
      'Desert camp',
      'Guided medina tours',
      'Cooking class'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-3: Marrakech (Jemaa el-Fnaa, Souks, Bahia Palace, Gardens) • Day 4-5: Fes (Medina, Tanneries, Koranic school) • Day 6-8: Sahara (Desert journey, Camel trek, Berber camp, Sunrise) • Day 9-10: Casablanca (Hassan II Mosque)',
    highlights: [
      'Jemaa el-Fnaa square',
      'Fes medina maze',
      'Sahara camel trek',
      'Desert camp overnight',
      'Berber villages',
      'Moroccan cooking class'
    ]
  },

  // Oceania & Pacific (2)
  {
    name: 'Australia & New Zealand Explorer',
    description: 'Experience the best of Down Under! Visit Sydney, Great Barrier Reef, Melbourne, Queenstown, and Milford Sound. Beaches, reefs, mountains, and adventure sports.',
    image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
    images: [
      'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
      'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
    ],
    destinations: ['Sydney', 'Cairns', 'Melbourne', 'Queenstown', 'Milford Sound'],
    category: 'Adventure & Nature',
    duration: 18,
    groupSize: 16,
    price: 5999,
    rating: 4.9,
    inclusions: [
      '17 nights accommodation',
      'Daily breakfast',
      '10 dinners',
      'All flights',
      'Great Barrier Reef dive',
      'Milford Sound cruise',
      'Adventure activities',
      'All transfers'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-4: Sydney (Opera House, Harbour Bridge, Bondi Beach) • Day 5-7: Cairns (Great Barrier Reef, Daintree Rainforest) • Day 8-10: Melbourne (City tour, Great Ocean Road) • Day 11-15: Queenstown (Bungee, Skiing, Adventure sports) • Day 16-18: Milford Sound',
    highlights: [
      'Sydney Opera House',
      'Great Barrier Reef diving',
      'Great Ocean Road',
      'Bungee jumping',
      'Milford Sound cruise',
      'Maori cultural experience'
    ]
  },
  {
    name: 'South Pacific Island Paradise',
    description: 'Ultimate tropical escape! Visit Fiji, Bora Bora, and Cook Islands. Overwater bungalows, pristine beaches, snorkeling, island culture, and pure relaxation.',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800'
    ],
    destinations: ['Fiji', 'Bora Bora', 'Cook Islands'],
    category: 'Beach & Relaxation',
    duration: 14,
    groupSize: 12,
    price: 6299,
    rating: 4.9,
    inclusions: [
      '13 nights luxury accommodation',
      'All meals',
      'Overwater bungalows',
      'Snorkeling trips',
      'Island hopping',
      'Spa treatments',
      'All transfers',
      'Traditional ceremonies'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1-5: Fiji (Yasawa Islands, Snorkeling, Village visits, Kava ceremony) • Day 6-10: Bora Bora (Overwater bungalows, Lagoon tours, Mt. Otemanu) • Day 11-14: Cook Islands (Aitutaki lagoon, Beach relaxation)',
    highlights: [
      'Yasawa Islands hopping',
      'Kava ceremony',
      'Bora Bora lagoon',
      'Overwater bungalows',
      'Aitutaki snorkeling',
      'Traditional island feast'
    ]
  },

  // Polar Expeditions (1)
  {
    name: 'Antarctica Expedition',
    description: 'Once-in-a-lifetime polar adventure! Cruise to Antarctica, see penguins, seals, whales, and massive icebergs. Zodiac landings, kayaking, and pristine wilderness.',
    image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800',
    images: [
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800',
      'https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ],
    destinations: ['Ushuaia', 'Drake Passage', 'Antarctic Peninsula'],
    category: 'Polar Expedition',
    duration: 12,
    groupSize: 100,
    price: 8999,
    rating: 5.0,
    inclusions: [
      '11 nights expedition ship',
      'All meals',
      'Zodiac landings',
      'Kayaking',
      'Expert guides',
      'Polar parkas',
      'Educational programs',
      'All equipment'
    ],
    exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
    itinerary: 'Day 1: Ushuaia embarkation • Day 2-3: Drake Passage crossing • Day 4-9: Antarctic Peninsula (Daily landings, Wildlife viewing, Ice formations) • Day 10-11: Return Drake Passage • Day 12: Ushuaia disembarkation',
    highlights: [
      'Penguin colonies',
      'Whale watching',
      'Zodiac cruises',
      'Kayaking among icebergs',
      'Research station visits',
      'Polar plunge (optional)'
    ]
  }
];

async function main() {
  console.log('🎒 Starting travel packages seeding...');

  // Find the first tenant
  const tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    console.error('❌ No tenant found. Please run the main seeder first.');
    return;
  }

  console.log(`✅ Found tenant: ${tenant.name}`);
  console.log(`📝 Creating ${packages.length} travel packages...\n`);

  let created = 0;
  let skipped = 0;

  for (const pkg of packages) {
    try {
      // Check if package already exists by name
      const existing = await prisma.package.findFirst({
        where: {
          name: pkg.name,
          tenantId: tenant.id
        }
      });

      if (existing) {
        console.log(`⏭️  Skipped: "${pkg.name}" (already exists)`);
        skipped++;
        continue;
      }

      await prisma.package.create({
        data: {
          ...pkg,
          tenantId: tenant.id
        }
      });

      console.log(`✅ Created: "${pkg.name}" (${pkg.destination}) - ${pkg.duration} days - $${pkg.price}`);
      created++;
    } catch (error) {
      console.error(`❌ Failed to create "${pkg.name}":`, error);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Seeding Summary:');
  console.log('='.repeat(60));

  const totalPackages = await prisma.package.count({ where: { tenantId: tenant.id } });
  const avgPrice = await prisma.package.aggregate({
    where: { tenantId: tenant.id },
    _avg: { price: true, rating: true, duration: true }
  });

  console.log(`Total packages in database: ${totalPackages}`);
  console.log(`Newly created: ${created}`);
  console.log(`Skipped (duplicates): ${skipped}`);
  console.log(`Average price: $${avgPrice._avg.price?.toFixed(2) || 'N/A'}`);
  console.log(`Average rating: ${avgPrice._avg.rating?.toFixed(2) || 'N/A'}`);
  console.log(`Average duration: ${avgPrice._avg.duration?.toFixed(1) || 'N/A'} days`);

  // Packages by category
  console.log('\n🗺️  Packages by category:');
  const packagesByCategory = await prisma.package.groupBy({
    by: ['category'],
    where: { tenantId: tenant.id },
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } }
  });

  packagesByCategory.forEach((group) => {
    console.log(`  ${group.category}: ${group._count.category} packages`);
  });

  // Duration ranges
  console.log('\n⏱️  Package duration distribution:');
  const short = await prisma.package.count({
    where: { tenantId: tenant.id, duration: { lt: 10 } }
  });
  const medium = await prisma.package.count({
    where: { tenantId: tenant.id, duration: { gte: 10, lt: 14 } }
  });
  const long = await prisma.package.count({
    where: { tenantId: tenant.id, duration: { gte: 14 } }
  });

  console.log(`  Short (<10 days): ${short} packages`);
  console.log(`  Medium (10-13 days): ${medium} packages`);
  console.log(`  Long (14+ days): ${long} packages`);

  // Price ranges
  console.log('\n💰 Price distribution:');
  const budget = await prisma.package.count({
    where: { tenantId: tenant.id, price: { lt: 3000 } }
  });
  const mid = await prisma.package.count({
    where: { tenantId: tenant.id, price: { gte: 3000, lt: 5000 } }
  });
  const luxury = await prisma.package.count({
    where: { tenantId: tenant.id, price: { gte: 5000 } }
  });

  console.log(`  Budget (<$3000): ${budget} packages`);
  console.log(`  Mid-range ($3000-$4999): ${mid} packages`);
  console.log(`  Luxury ($5000+): ${luxury} packages`);

  console.log('\n✨ Travel packages seeding completed!');
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('Error seeding packages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
