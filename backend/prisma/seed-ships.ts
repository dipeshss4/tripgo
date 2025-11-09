import { PrismaClient, DepartureStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedShips() {
  try {
    console.log('🚢 Starting ships seed...\n');

    // Get the first tenant
    const tenant = await prisma.tenant.findFirst();

    if (!tenant) {
      console.error('❌ No tenant found. Please create a tenant first.');
      process.exit(1);
    }

    console.log(`✅ Using tenant: ${tenant.name}\n`);

    // ======================
    // SEED SHIP CATEGORIES
    // ======================
    console.log('📦 Seeding ship categories...');

    const shipCategories = await Promise.all([
      prisma.shipCategory.upsert({
        where: { slug: 'luxury-yachts' },
        update: {},
        create: {
          name: 'Luxury Yachts',
          slug: 'luxury-yachts',
          description: 'Experience ultimate luxury on our premium yacht collection',
          image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800',
          icon: '🛥️',
          displayOrder: 0,
          isActive: true,
          tenantId: tenant.id
        }
      }),
      prisma.shipCategory.upsert({
        where: { slug: 'cargo-ships' },
        update: {},
        create: {
          name: 'Cargo Ships',
          slug: 'cargo-ships',
          description: 'Reliable cargo shipping solutions worldwide',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          icon: '🚢',
          displayOrder: 1,
          isActive: true,
          tenantId: tenant.id
        }
      }),
      prisma.shipCategory.upsert({
        where: { slug: 'ferry-services' },
        update: {},
        create: {
          name: 'Ferry Services',
          slug: 'ferry-services',
          description: 'Convenient and affordable ferry transportation',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
          icon: '⛴️',
          displayOrder: 2,
          isActive: true,
          tenantId: tenant.id
        }
      }),
      prisma.shipCategory.upsert({
        where: { slug: 'expedition-vessels' },
        update: {},
        create: {
          name: 'Expedition Vessels',
          slug: 'expedition-vessels',
          description: 'Adventure ships for remote destinations',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          icon: '🧭',
          displayOrder: 3,
          isActive: true,
          tenantId: tenant.id
        }
      })
    ]);

    console.log(`✅ Created ${shipCategories.length} ship categories\n`);

    // ======================
    // SEED SHIPS
    // ======================
    console.log('🛳️  Seeding ships...');

    const ships = [
      // Luxury Yachts
      {
        name: 'Azure Dream',
        slug: 'azure-dream',
        description: 'Experience unparalleled luxury aboard the Azure Dream, a state-of-the-art superyacht featuring world-class amenities, gourmet dining, and personalized service. Perfect for exclusive Mediterranean voyages.',
        summary: 'Luxury superyacht with premium amenities and gourmet dining',
        image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200',
        images: [
          'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200',
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200'
        ],
        posterImage: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920',
        rating: 4.9,
        price: 12500.00,
        duration: 7,
        capacity: 24,
        available: true,
        isActive: true,
        type: 'Luxury',
        departure: 'Monaco',
        departurePort: 'Port Hercules, Monaco',
        destination: 'French Riviera',
        routeNames: ['Monaco', 'Saint-Tropez', 'Cannes', 'Nice', 'Portofino', 'Monaco'],
        highlights: [
          'Private chef and gourmet dining',
          'Spacious sun deck with Jacuzzi',
          'Water sports equipment included',
          'Butler service',
          'Luxury staterooms with ocean views',
          'Cinema room and spa'
        ],
        amenities: [
          'Gourmet Restaurant',
          'Spa & Wellness Center',
          'Jacuzzi & Pool',
          'Water Sports',
          'Cinema Room',
          'Wine Cellar',
          'Helipad',
          'Gym'
        ],
        inclusions: [
          'All meals and premium beverages',
          'Butler and concierge service',
          'Water sports equipment',
          'Shore excursions',
          'Spa treatments',
          'Wi-Fi'
        ],
        videos: {
          teaser: {
            title: 'Azure Dream - Luxury Yacht Experience',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=640'
          },
          gallery: [
            {
              title: 'Ship Tour',
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
            },
            {
              title: 'Onboard Amenities',
              url: 'https://www.youtube.com/embed/jNQXAC9IVRw'
            },
            {
              title: 'Mediterranean Journey',
              url: 'https://www.youtube.com/embed/0J2QdDbelmY'
            }
          ]
        },
        badge: 'Premium',
        categoryId: shipCategories[0].id,
        tenantId: tenant.id
      },
      {
        name: 'Oceanic Princess',
        slug: 'oceanic-princess',
        description: 'The Oceanic Princess combines elegance with adventure. This magnificent yacht offers an intimate cruising experience with top-tier amenities, perfect for exploring the Caribbean islands in style.',
        summary: 'Elegant yacht for Caribbean island exploration',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
        images: [
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'
        ],
        rating: 4.8,
        price: 9800.00,
        duration: 5,
        capacity: 18,
        available: true,
        type: 'Luxury',
        departure: 'Miami',
        destination: 'Caribbean Islands',
        routeNames: ['Miami', 'Nassau', 'St. Thomas', 'St. Maarten', 'Miami'],
        highlights: [
          'Island hopping adventure',
          'Snorkeling and diving excursions',
          'Private beach access',
          'Gourmet seafood cuisine',
          'Sunset cocktail cruises'
        ],
        amenities: [
          'Fine Dining',
          'Diving Equipment',
          'Beach Access',
          'Bar & Lounge',
          'Sun Deck',
          'Water Sports'
        ],
        inclusions: [
          'All meals',
          'Diving equipment',
          'Beach excursions',
          'Transfers',
          'Beverages'
        ],
        videos: {
          teaser: {
            title: 'Oceanic Princess - Caribbean Adventure',
            url: 'https://www.youtube.com/embed/6v2L2UGZJAM',
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=640'
          },
          gallery: [
            {
              title: 'Caribbean Islands Tour',
              url: 'https://www.youtube.com/embed/6v2L2UGZJAM'
            }
          ]
        },
        badge: 'Popular',
        categoryId: shipCategories[0].id,
        tenantId: tenant.id
      },
      {
        name: 'Serenity Sailing',
        slug: 'serenity-sailing',
        description: 'Discover pure relaxation on Serenity Sailing, a boutique luxury yacht designed for intimate escapes. With spacious decks and personalized service, experience the Mediterranean at its finest.',
        summary: 'Boutique luxury yacht for intimate Mediterranean escapes',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200',
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200'],
        rating: 4.7,
        price: 8500.00,
        duration: 6,
        capacity: 16,
        available: true,
        type: 'Luxury',
        departure: 'Barcelona',
        destination: 'Balearic Islands',
        routeNames: ['Barcelona', 'Ibiza', 'Formentera', 'Mallorca', 'Menorca', 'Barcelona'],
        highlights: [
          'Intimate yacht experience',
          'Michelin-star chef',
          'Private island visits',
          'Wellness and yoga sessions',
          'Champagne sunset views'
        ],
        amenities: [
          'Michelin Dining',
          'Yoga Deck',
          'Spa Services',
          'Pool',
          'Water Toys',
          'Library'
        ],
        inclusions: [
          'Gourmet meals',
          'Premium drinks',
          'Spa sessions',
          'Yoga classes',
          'Excursions'
        ],
        badge: 'Boutique',
        categoryId: shipCategories[0].id,
        tenantId: tenant.id
      },

      // Ferry Services
      {
        name: 'Island Hopper Express',
        slug: 'island-hopper-express',
        description: 'Fast and comfortable ferry service connecting Greek islands. Modern amenities, spacious seating, and spectacular views make your journey as enjoyable as your destination.',
        summary: 'Fast ferry connecting beautiful Greek islands',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200'],
        rating: 4.6,
        price: 85.00,
        duration: 1,
        capacity: 500,
        available: true,
        type: 'Ferry',
        departure: 'Athens',
        destination: 'Santorini',
        routeNames: ['Athens (Piraeus)', 'Mykonos', 'Paros', 'Naxos', 'Santorini'],
        highlights: [
          'High-speed service',
          'Comfortable seating',
          'Onboard cafe',
          'Scenic ocean views',
          'Reliable schedule'
        ],
        amenities: [
          'Cafe & Snacks',
          'Air Conditioning',
          'Outdoor Deck',
          'Luggage Storage',
          'Wi-Fi'
        ],
        inclusions: [
          'One-way ticket',
          'Luggage allowance',
          'Wi-Fi access'
        ],
        badge: 'Fast',
        categoryId: shipCategories[2].id,
        tenantId: tenant.id
      },
      {
        name: 'Nordic Sea Link',
        slug: 'nordic-sea-link',
        description: 'Cruise ferry connecting Scandinavia with comfort and style. Features restaurants, shopping, entertainment, and comfortable cabins for overnight journeys.',
        summary: 'Overnight cruise ferry across Scandinavian waters',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'],
        rating: 4.7,
        price: 145.00,
        duration: 1,
        capacity: 800,
        available: true,
        type: 'Ferry',
        departure: 'Stockholm',
        destination: 'Helsinki',
        routeNames: ['Stockholm', 'Åland Islands', 'Helsinki'],
        highlights: [
          'Comfortable cabins',
          'Multiple restaurants',
          'Duty-free shopping',
          'Entertainment venues',
          'Spa & sauna'
        ],
        amenities: [
          'Restaurants',
          'Cabins',
          'Shopping',
          'Spa',
          'Conference Rooms',
          'Kids Play Area'
        ],
        inclusions: [
          'Ferry ticket',
          'Breakfast buffet',
          'Entertainment',
          'Wi-Fi'
        ],
        badge: 'Family Friendly',
        categoryId: shipCategories[2].id,
        tenantId: tenant.id
      },

      // Expedition Vessels
      {
        name: 'Arctic Explorer',
        slug: 'arctic-explorer',
        description: 'Expedition vessel designed for polar adventures. Experience the Arctic wilderness with expert guides, zodiac landings, and comfortable accommodations in one of Earth\'s most remote regions.',
        summary: 'Polar expedition with expert guides and zodiacs',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'],
        rating: 4.9,
        price: 8500.00,
        duration: 10,
        capacity: 120,
        available: true,
        type: 'Expedition',
        departure: 'Reykjavik',
        destination: 'Svalbard',
        routeNames: ['Reykjavik', 'Greenland Coast', 'Jan Mayen', 'Svalbard'],
        highlights: [
          'Polar bear sightings',
          'Glacier kayaking',
          'Expert naturalist guides',
          'Zodiac excursions',
          'Northern lights viewing',
          'Photography workshops'
        ],
        amenities: [
          'Observation Deck',
          'Lecture Hall',
          'Library',
          'Gym',
          'Sauna',
          'Restaurant',
          'Zodiacs'
        ],
        inclusions: [
          'All meals',
          'Zodiac excursions',
          'Expert guides',
          'Kayaking',
          'Lectures',
          'Photography workshops'
        ],
        badge: 'Adventure',
        categoryId: shipCategories[3].id,
        tenantId: tenant.id
      },
      {
        name: 'Galapagos Discovery',
        slug: 'galapagos-discovery',
        description: 'Explore the unique wildlife of the Galapagos Islands aboard our purpose-built expedition vessel. Small-ship experience with naturalist guides and daily island excursions.',
        summary: 'Wildlife expedition in the enchanted Galapagos',
        image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200',
        images: ['https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200'],
        rating: 4.9,
        price: 6800.00,
        duration: 8,
        capacity: 48,
        available: true,
        type: 'Expedition',
        departure: 'Baltra Island',
        destination: 'Galapagos Islands',
        routeNames: ['Baltra', 'Santa Cruz', 'Isabela', 'Fernandina', 'Santiago', 'Genovesa'],
        highlights: [
          'Giant tortoise encounters',
          'Snorkeling with sea lions',
          'Blue-footed booby colonies',
          'Marine iguana viewing',
          'Expert naturalist guides',
          'Small group excursions'
        ],
        amenities: [
          'Observation Lounge',
          'Dive Equipment',
          'Kayaks',
          'Library',
          'Sun Deck',
          'Restaurant'
        ],
        inclusions: [
          'All meals',
          'Daily excursions',
          'Snorkeling gear',
          'Naturalist guides',
          'Kayaking',
          'National park fees'
        ],
        badge: 'Eco-Friendly',
        categoryId: shipCategories[3].id,
        tenantId: tenant.id
      }
    ];

    for (const shipData of ships) {
      await prisma.ship.upsert({
        where: { slug: shipData.slug },
        update: {},
        create: shipData
      });
    }

    console.log(`✅ Created ${ships.length} ships\n`);

    // ======================
    // SEED SHIP DEPARTURES
    // ======================
    console.log('📅 Seeding ship departures...');

    const allShips = await prisma.ship.findMany();
    let departureCount = 0;

    for (const ship of allShips) {
      // Create 5 departures for each ship
      const departures = [];
      for (let i = 0; i < 5; i++) {
        const departureDate = new Date();
        departureDate.setDate(departureDate.getDate() + (i * 14) + 7); // Every 2 weeks

        const returnDate = new Date(departureDate);
        returnDate.setDate(returnDate.getDate() + ship.duration);

        departures.push({
          shipId: ship.id,
          departureDate,
          returnDate,
          availableSeats: Math.floor(ship.capacity * 0.7), // 70% available
          priceModifier: 1.0 + (i * 0.05), // Slight price increase for later dates
          status: i === 0 ? DepartureStatus.FILLING_FAST : DepartureStatus.AVAILABLE
        });
      }

      await prisma.shipDeparture.createMany({
        data: departures,
        skipDuplicates: true
      });

      departureCount += departures.length;
    }

    console.log(`✅ Created ${departureCount} ship departures\n`);

    // ======================
    // SUMMARY
    // ======================
    console.log('\n🎉 SHIPS SEED COMPLETED!\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`🚢 Ship Categories: ${shipCategories.length}`);
    console.log(`🛳️  Ships: ${ships.length}`);
    console.log(`📅 Ship Departures: ${departureCount}`);
    console.log('═══════════════════════════════════════\n');

    console.log('📋 Ships Created:');
    ships.forEach((ship, index) => {
      console.log(`   ${index + 1}. ${ship.name} - $${ship.price} (${ship.type})`);
    });

    console.log('\n✅ Ships data seeded successfully!');
    console.log('🌐 Visit http://localhost:3000/ships to see the ships\n');

  } catch (error) {
    console.error('❌ Error seeding ships:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedShips()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
