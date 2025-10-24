import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hotels = [
  {
    name: 'Paradise Bay Resort & Spa',
    description: 'Indulge in ultimate luxury at this 5-star beachfront resort in Maldives. Features private villas with infinity pools, world-class spa, multiple gourmet restaurants, and pristine white sand beaches.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
    location: 'Maldives',
    address: 'North Malé Atoll, Maldives',
    city: 'Malé',
    country: 'Maldives',
    rating: 4.9,
    price: 850,
    amenities: ['Private Beach', 'Infinity Pool', 'Spa & Wellness Center', 'Fine Dining Restaurants', 'Water Sports', 'Butler Service'],
    roomTypes: [{ type: 'Ocean Villa', price: 850 }, { type: 'Beach Suite', price: 950 }, { type: 'Overwater Bungalow', price: 1200 }]
  },
  {
    name: 'Sunset Beach Resort',
    description: 'Experience Caribbean luxury with stunning ocean views, all-inclusive dining, and endless entertainment in Cancun.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'],
    location: 'Cancun',
    address: 'Hotel Zone, Cancun',
    city: 'Cancun',
    country: 'Mexico',
    rating: 4.7,
    price: 420,
    amenities: ['All-Inclusive', 'Multiple Pools', 'Private Beach', 'Golf Course', 'Spa', 'Kids Activities'],
    roomTypes: [{ type: 'Standard Ocean View', price: 420 }, { type: 'Junior Suite', price: 520 }]
  },
  {
    name: 'Royal Palm Resort Bali',
    description: 'Premier beachfront resort in Bali offering authentic Balinese hospitality. Luxury villas with private pools and traditional spa treatments.',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
    images: ['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
    location: 'Seminyak, Bali',
    address: 'Seminyak Beach, Bali',
    city: 'Seminyak',
    country: 'Indonesia',
    rating: 4.8,
    price: 380,
    amenities: ['Private Villas', 'Beachfront', 'Balinese Spa', 'Infinity Pool', 'Cooking Classes', 'Yoga Studio'],
    roomTypes: [{ type: 'Garden Villa', price: 380 }, { type: 'Pool Villa', price: 480 }]
  },
  {
    name: 'Azure Coast Resort',
    description: 'Stunning Mediterranean resort on the French Riviera. Elegant rooms with sea views, Michelin-star restaurant, and private yacht club.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
    location: 'Nice',
    address: 'Promenade des Anglais, Nice',
    city: 'Nice',
    country: 'France',
    rating: 4.9,
    price: 650,
    amenities: ['Michelin Star Restaurant', 'Private Yacht Club', 'Luxury Spa', 'Rooftop Pool', 'Concierge Service'],
    roomTypes: [{ type: 'Deluxe Sea View', price: 650 }, { type: 'Penthouse Suite', price: 950 }]
  },
  {
    name: 'Tropical Paradise Resort',
    description: 'Secluded island resort in Thailand offering ultimate relaxation. Traditional Thai architecture, overwater bungalows, and pristine beaches.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
    location: 'Phuket',
    address: 'Patong Beach, Phuket',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.7,
    price: 320,
    amenities: ['Overwater Bungalows', 'Thai Spa', 'Snorkeling', 'Beach Volleyball', 'Cooking Classes', 'Island Tours'],
    roomTypes: [{ type: 'Beach Bungalow', price: 320 }, { type: 'Overwater Villa', price: 450 }]
  },
  {
    name: 'The Metropolitan Boutique Hotel',
    description: 'Chic boutique hotel in the heart of Paris. Art Deco design, rooftop terrace with Eiffel Tower views, and personalized concierge service.',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
    location: 'Paris',
    address: '7th Arrondissement, Paris',
    city: 'Paris',
    country: 'France',
    rating: 4.8,
    price: 450,
    amenities: ['Rooftop Terrace', 'Eiffel Tower View', 'Artisan Breakfast', 'Concierge Service', 'Wine Bar', 'Library'],
    roomTypes: [{ type: 'Classic Room', price: 450 }, { type: 'Tower View Suite', price: 650 }]
  },
  {
    name: 'Urban Loft Hotel',
    description: 'Modern design hotel in trendy Brooklyn. Industrial-chic rooms, rooftop bar, farm-to-table restaurant, and walking distance to major attractions.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    location: 'Brooklyn, New York',
    address: 'Williamsburg, Brooklyn, NY',
    city: 'Brooklyn',
    country: 'USA',
    rating: 4.6,
    price: 320,
    amenities: ['Rooftop Bar', 'Restaurant', 'Gym', 'Meeting Rooms', 'Bike Rentals', 'Co-working Space', 'Pet Friendly'],
    roomTypes: [{ type: 'Loft Room', price: 320 }, { type: 'Studio Suite', price: 420 }]
  },
  {
    name: 'Heritage Boutique Hotel',
    description: 'Historic building transformed into luxury boutique hotel in Edinburgh. Period features, modern amenities, and traditional Scottish hospitality.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
    location: 'Edinburgh',
    address: 'Royal Mile, Edinburgh',
    city: 'Edinburgh',
    country: 'Scotland',
    rating: 4.7,
    price: 280,
    amenities: ['Whisky Bar', 'Fine Dining', 'Library', 'Afternoon Tea', 'Concierge', 'Free WiFi', 'Scottish Breakfast'],
    roomTypes: [{ type: 'Classic Room', price: 280 }, { type: 'Castle View Suite', price: 380 }]
  },
  {
    name: 'Zen Garden Hotel',
    description: 'Tranquil boutique hotel in Kyoto blending traditional Japanese aesthetics with modern luxury. Zen gardens, kaiseki dining, and onsen baths.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    location: 'Kyoto',
    address: 'Higashiyama District, Kyoto',
    city: 'Kyoto',
    country: 'Japan',
    rating: 4.9,
    price: 420,
    amenities: ['Onsen Bath', 'Zen Garden', 'Kaiseki Dining', 'Tea Ceremony', 'Tatami Rooms', 'Meditation Room', 'Kimono Experience'],
    roomTypes: [{ type: 'Traditional Tatami', price: 420 }, { type: 'Zen Suite', price: 550 }]
  },
  {
    name: 'Alpine Peak Resort',
    description: 'Premier ski resort in the Swiss Alps. Ski-in/ski-out access, luxury chalets, Michelin-star dining, and world-class skiing.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
    location: 'Zermatt',
    address: 'Matterhorn View, Zermatt',
    city: 'Zermatt',
    country: 'Switzerland',
    rating: 4.9,
    price: 750,
    amenities: ['Ski-In/Ski-Out', 'Ski School', 'Spa & Wellness', 'Heated Pool', 'Fine Dining', 'Ski Equipment Rental', 'Kids Club'],
    roomTypes: [{ type: 'Mountain View Room', price: 750 }, { type: 'Luxury Chalet', price: 1200 }]
  },
  {
    name: 'Rocky Mountain Lodge',
    description: 'Rustic luxury lodge in Colorado Rockies. Log cabin architecture, outdoor adventures, craft brewery, and hot tubs with mountain views.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    location: 'Aspen',
    address: 'Aspen Mountain, CO',
    city: 'Aspen',
    country: 'USA',
    rating: 4.7,
    price: 580,
    amenities: ['Craft Brewery', 'Hot Tubs', 'Hiking Trails', 'Mountain Bikes', 'Wildlife Tours', 'BBQ Area', 'Fire Pits', 'Game Room'],
    roomTypes: [{ type: 'Lodge Room', price: 580 }, { type: 'Luxury Cabin', price: 780 }]
  },
  {
    name: 'Himalayan Heights Resort',
    description: 'Spectacular mountain resort in Nepal with panoramic Himalayan views. Traditional Nepali hospitality, yoga retreats, and trekking expeditions.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    location: 'Pokhara',
    address: 'Lakeside, Pokhara',
    city: 'Pokhara',
    country: 'Nepal',
    rating: 4.6,
    price: 195,
    amenities: ['Mountain Views', 'Yoga Studio', 'Trekking Guides', 'Organic Farm', 'Meditation Center', 'Spa', 'Cultural Shows'],
    roomTypes: [{ type: 'Mountain View Room', price: 195 }, { type: 'Himalayan Suite', price: 295 }]
  },
  {
    name: 'Serengeti Safari Lodge',
    description: 'Luxury tented camp in the heart of Serengeti. Witness the Great Migration, guided game drives, and authentic African safari experience.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
    location: 'Serengeti National Park',
    address: 'Central Serengeti, Tanzania',
    city: 'Serengeti',
    country: 'Tanzania',
    rating: 4.8,
    price: 680,
    amenities: ['Game Drives', 'Professional Guides', 'All-Inclusive Meals', 'Sundowner Bar', 'Campfire', 'Bush Walks', 'Photography Tours'],
    roomTypes: [{ type: 'Safari Tent', price: 680 }, { type: 'Deluxe Tent', price: 880 }]
  },
  {
    name: 'Rainforest Eco Lodge',
    description: 'Sustainable eco-lodge deep in Costa Rican rainforest. Treehouse accommodations, zip-lining, wildlife tours, and carbon-neutral operations.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    location: 'Monteverde',
    address: 'Cloud Forest Reserve, Monteverde',
    city: 'Monteverde',
    country: 'Costa Rica',
    rating: 4.7,
    price: 285,
    amenities: ['Treehouse Rooms', 'Zip-Lining', 'Wildlife Tours', 'Organic Restaurant', 'Nature Trails', 'Bird Watching', 'Solar Powered'],
    roomTypes: [{ type: 'Standard Cabin', price: 285 }, { type: 'Treehouse Suite', price: 385 }]
  },
  {
    name: 'Outback Wilderness Camp',
    description: 'Remote luxury camp in Australian Outback. Stargazing, Aboriginal cultural experiences, guided bushwalks, and gourmet bush tucker dining.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    location: 'Uluru',
    address: 'Uluru-Kata Tjuta National Park',
    city: 'Yulara',
    country: 'Australia',
    rating: 4.8,
    price: 520,
    amenities: ['Stargazing Tours', 'Aboriginal Culture', 'Bush Walks', 'Gourmet Dining', 'Wildlife Viewing', 'Telescope Access', 'Campfire Stories'],
    roomTypes: [{ type: 'Outback Tent', price: 520 }, { type: 'Desert Suite', price: 720 }]
  },
  {
    name: 'Backpackers Paradise Hostel',
    description: 'Social hostel in vibrant Barcelona. Clean dorms and private rooms, rooftop terrace, free walking tours, and nightly events.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'],
    location: 'Barcelona',
    address: 'Gothic Quarter, Barcelona',
    city: 'Barcelona',
    country: 'Spain',
    rating: 4.5,
    price: 35,
    amenities: ['Rooftop Terrace', 'Free Walking Tours', 'Communal Kitchen', 'Social Events', 'Free WiFi', 'Laundry', 'Lockers', 'Bar'],
    roomTypes: [{ type: '4-Bed Dorm', price: 35 }, { type: 'Private Room', price: 75 }]
  },
  {
    name: 'Nomad Inn',
    description: 'Modern budget hotel in Bangkok. Clean, compact rooms, rooftop pool, street food tours, bike rentals, and excellent location near BTS.',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    location: 'Bangkok',
    address: 'Sukhumvit Road, Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.4,
    price: 45,
    amenities: ['Rooftop Pool', 'Street Food Tours', 'Bike Rentals', 'Free WiFi', 'Café', 'Laundry Service', 'Tour Desk', 'Near BTS'],
    roomTypes: [{ type: 'Single Room', price: 45 }, { type: 'Double Room', price: 65 }]
  },
  {
    name: 'Palace Heritage Hotel',
    description: 'Former royal palace converted into luxury heritage hotel in Rajasthan. Opulent rooms, traditional Rajasthani cuisine, and cultural performances.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    location: 'Jaipur',
    address: 'Old City, Jaipur',
    city: 'Jaipur',
    country: 'India',
    rating: 4.8,
    price: 350,
    amenities: ['Palace Architecture', 'Royal Dining', 'Cultural Shows', 'Heritage Tours', 'Spa', 'Swimming Pool', 'Elephant Rides', 'Traditional Music'],
    roomTypes: [{ type: 'Heritage Room', price: 350 }, { type: 'Maharaja Suite', price: 650 }]
  },
  {
    name: 'Colonial Manor Hotel',
    description: 'Restored colonial-era mansion in Cartagena. Period furnishings, courtyard garden, rooftop pool, and Colombian coffee bar.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'],
    location: 'Cartagena',
    address: 'Old Town, Cartagena',
    city: 'Cartagena',
    country: 'Colombia',
    rating: 4.7,
    price: 220,
    amenities: ['Colonial Architecture', 'Courtyard Garden', 'Rooftop Pool', 'Coffee Bar', 'Library', 'Concierge', 'Free WiFi', 'Breakfast Included'],
    roomTypes: [{ type: 'Classic Room', price: 220 }, { type: 'Colonial Suite', price: 320 }]
  },
  {
    name: 'Executive Business Hotel',
    description: 'Modern business hotel in Singapore CBD. High-speed WiFi, meeting rooms, executive lounge, 24-hour gym, and near MRT station.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
    location: 'Singapore',
    address: 'CBD, Marina Bay, Singapore',
    city: 'Singapore',
    country: 'Singapore',
    rating: 4.6,
    price: 280,
    amenities: ['Meeting Rooms', 'Executive Lounge', '24-Hour Gym', 'Business Center', 'Express Laundry', 'Airport Shuttle', 'High-Speed WiFi'],
    roomTypes: [{ type: 'Deluxe Room', price: 280 }, { type: 'Business Suite', price: 380 }]
  },
  {
    name: 'City Center Tower Hotel',
    description: 'Contemporary hotel in Dubai Financial District. Sky-high rooms, infinity pool, rooftop restaurant, luxury spa, and stunning skyline views.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    location: 'Dubai',
    address: 'DIFC, Dubai',
    city: 'Dubai',
    country: 'UAE',
    rating: 4.8,
    price: 420,
    amenities: ['Infinity Pool', 'Rooftop Restaurant', 'Luxury Spa', 'Meeting Facilities', 'Valet Parking', 'Chauffeur Service', 'Executive Lounge'],
    roomTypes: [{ type: 'Deluxe City View', price: 420 }, { type: 'Presidential Suite', price: 850 }]
  }
];

async function main() {
  console.log('🏨 Starting hotel seeding...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('❌ No tenant found. Please run the main seeder first.');
    return;
  }

  console.log(`✅ Found tenant: ${tenant.name}`);
  console.log(`📝 Creating ${hotels.length} hotels...\n`);

  let created = 0;
  let skipped = 0;

  for (const hotel of hotels) {
    try {
      const existing = await prisma.hotel.findFirst({
        where: { name: hotel.name, tenantId: tenant.id }
      });

      if (existing) {
        console.log(`⏭️  Skipped: "${hotel.name}" (already exists)`);
        skipped++;
        continue;
      }

      await prisma.hotel.create({
        data: { ...hotel, tenantId: tenant.id }
      });

      console.log(`✅ Created: "${hotel.name}" (${hotel.city}, ${hotel.country}) - $${hotel.price}/night`);
      created++;
    } catch (error: any) {
      console.error(`❌ Failed to create "${hotel.name}":`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Seeding Summary:');
  console.log('='.repeat(60));

  const totalHotels = await prisma.hotel.count({ where: { tenantId: tenant.id } });
  const avgRating = await prisma.hotel.aggregate({
    where: { tenantId: tenant.id },
    _avg: { rating: true }
  });

  console.log(`Total hotels in database: ${totalHotels}`);
  console.log(`Newly created: ${created}`);
  console.log(`Skipped (duplicates): ${skipped}`);
  console.log(`Average rating: ${avgRating._avg.rating?.toFixed(2) || 'N/A'}`);

  const hotelsByCountry = await prisma.hotel.groupBy({
    by: ['country'],
    where: { tenantId: tenant.id },
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } }
  });

  console.log('\n🌍 Hotels by country:');
  hotelsByCountry.forEach((group) => {
    console.log(`  ${group.country}: ${group._count.country} hotels`);
  });

  const budget = await prisma.hotel.count({
    where: { tenantId: tenant.id, price: { lt: 100 } }
  });
  const mid = await prisma.hotel.count({
    where: { tenantId: tenant.id, price: { gte: 100, lt: 400 } }
  });
  const luxury = await prisma.hotel.count({
    where: { tenantId: tenant.id, price: { gte: 400 } }
  });

  console.log('\n💰 Price distribution:');
  console.log(`  Budget (<$100): ${budget} hotels`);
  console.log(`  Mid-range ($100-$399): ${mid} hotels`);
  console.log(`  Luxury ($400+): ${luxury} hotels`);

  console.log('\n✨ Hotel seeding completed!');
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('Error seeding hotels:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
