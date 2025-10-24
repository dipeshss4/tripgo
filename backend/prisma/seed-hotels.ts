import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hotels = [
  // Luxury Beach Resorts (5)
  {
    name: 'Paradise Bay Resort & Spa',
    description: 'Indulge in ultimate luxury at this 5-star beachfront resort. Features private villas with infinity pools, world-class spa, multiple gourmet restaurants, and pristine white sand beaches. Perfect for romantic getaways and luxury vacations.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    ],
    location: 'Maldives',
    address: 'North Malé Atoll, Maldives',
    city: 'Malé',
    address: 'North Malé Atoll, Maldives',
    city: 'Malé',
    country: 'Maldives',
    rating: 4.9,
    price: 850,
    amenities: [
      'Private Beach',
      'Infinity Pool',
      'Spa & Wellness Center',
      'Fine Dining Restaurants',
      'Water Sports',
      'Butler Service',
      'Airport Transfer',
      'Kids Club'
    ],
    roomTypes: ['Ocean Villa', 'Beach Suite', 'Overwater Bungalow', 'Presidential Suite'],
    location: 'Cancun',
    address: 'Hotel Zone, Cancun',
    city: 'Cancun',
    country: 'Mexico',
    rating: 4.7,
    price: 420,
    amenities: [
      'All-Inclusive',
      'Multiple Pools',
      'Private Beach',
      'Golf Course',
      'Spa',
      'Gym',
      'Kids Activities',
      'Nightclub'
    ],
    roomTypes: ['Standard Ocean View', 'Junior Suite', 'Swim-Up Suite', 'Presidential Suite'],
    location: 'Seminyak, Bali',
    country: 'Indonesia',
    rating: 4.8,
    price: 380,
    amenities: [
      'Private Villas',
      'Beachfront',
      'Balinese Spa',
      'Infinity Pool',
      'Cooking Classes',
      'Yoga Studio',
      'Beach Club',
      'Cultural Tours'
    ],
    roomTypes: ['Garden Villa', 'Pool Villa', 'Beach Villa', 'Royal Suite'],
    location: 'Nice',
    address: 'Promenade des Anglais, Nice',
    city: 'Nice',
    country: 'France',
    rating: 4.9,
    price: 650,
    amenities: [
      'Michelin Star Restaurant',
      'Private Yacht Club',
      'Luxury Spa',
      'Rooftop Pool',
      'Concierge Service',
      'Valet Parking',
      'Wine Cellar',
      'Private Beach'
    ],
    roomTypes: ['Deluxe Sea View', 'Junior Suite', 'Penthouse Suite', 'Villa'],
    location: 'Phuket',
    address: 'Patong Beach, Phuket',
    city: 'Phuket',
    country: 'Thailand',
    rating: 4.7,
    price: 320,
    amenities: [
      'Overwater Bungalows',
      'Thai Spa',
      'Snorkeling',
      'Beach Volleyball',
      'Cooking Classes',
      'Island Tours',
      'Beach Bar',
      'Kayaking'
    ],
    roomTypes: ['Beach Bungalow', 'Overwater Villa', 'Garden Suite', 'Family Villa'],
    location: 'Paris',
    address: '7th Arrondissement, Paris',
    city: 'Paris',
    country: 'France',
    rating: 4.8,
    price: 450,
    amenities: [
      'Rooftop Terrace',
      'Eiffel Tower View',
      'Artisan Breakfast',
      'Concierge Service',
      'Wine Bar',
      'Library',
      'Art Gallery',
      'Free WiFi'
    ],
    roomTypes: ['Classic Room', 'Deluxe Room', 'Tower View Suite', 'Penthouse'],
    location: 'Brooklyn, New York',
    country: 'USA',
    rating: 4.6,
    price: 320,
    amenities: [
      'Rooftop Bar',
      'Restaurant',
      'Gym',
      'Meeting Rooms',
      'Bike Rentals',
      'Coffee Shop',
      'Co-working Space',
      'Pet Friendly'
    ],
    roomTypes: ['Loft Room', 'Studio Suite', 'Corner Suite', 'Skyline Penthouse'],
    location: 'Edinburgh',
    address: 'Royal Mile, Edinburgh',
    city: 'Edinburgh',
    country: 'Scotland',
    rating: 4.7,
    price: 280,
    amenities: [
      'Whisky Bar',
      'Fine Dining',
      'Library',
      'Afternoon Tea',
      'Concierge',
      'Free WiFi',
      'Scottish Breakfast',
      'Historic Features'
    ],
    roomTypes: ['Classic Room', 'Feature Room', 'Junior Suite', 'Castle View Suite'],
    location: 'Kyoto',
    address: 'Higashiyama District, Kyoto',
    city: 'Kyoto',
    country: 'Japan',
    rating: 4.9,
    price: 420,
    amenities: [
      'Onsen Bath',
      'Zen Garden',
      'Kaiseki Dining',
      'Tea Ceremony',
      'Tatami Rooms',
      'Meditation Room',
      'Kimono Experience',
      'Garden Views'
    ],
    roomTypes: ['Traditional Tatami', 'Zen Suite', 'Garden Villa', 'Imperial Suite'],
    location: 'Zermatt',
    address: 'Matterhorn View, Zermatt',
    city: 'Zermatt',
    country: 'Switzerland',
    rating: 4.9,
    price: 750,
    amenities: [
      'Ski-In/Ski-Out',
      'Ski School',
      'Spa & Wellness',
      'Heated Pool',
      'Fine Dining',
      'Ski Equipment Rental',
      'Kids Club',
      'Mountain Guides'
    ],
    roomTypes: ['Mountain View Room', 'Junior Suite', 'Luxury Chalet', 'Presidential Chalet'],
    location: 'Aspen',
    address: 'Aspen Mountain, CO',
    city: 'Aspen',
    country: 'USA',
    rating: 4.7,
    price: 580,
    amenities: [
      'Craft Brewery',
      'Hot Tubs',
      'Hiking Trails',
      'Mountain Bikes',
      'Wildlife Tours',
      'BBQ Area',
      'Fire Pits',
      'Game Room'
    ],
    roomTypes: ['Lodge Room', 'Cabin Suite', 'Luxury Cabin', 'Alpine Villa'],
    location: 'Pokhara',
    address: 'Lakeside, Pokhara',
    city: 'Pokhara',
    country: 'Nepal',
    rating: 4.6,
    price: 195,
    amenities: [
      'Mountain Views',
      'Yoga Studio',
      'Trekking Guides',
      'Organic Farm',
      'Meditation Center',
      'Spa',
      'Cultural Shows',
      'Cooking Classes'
    ],
    roomTypes: ['Mountain View Room', 'Deluxe Room', 'Himalayan Suite', 'Villa'],
    location: 'Serengeti National Park',
    country: 'Tanzania',
    rating: 4.8,
    price: 680,
    amenities: [
      'Game Drives',
      'Professional Guides',
      'All-Inclusive Meals',
      'Sundowner Bar',
      'Campfire',
      'Bush Walks',
      'Photography Tours',
      'Luxury Tents'
    ],
    roomTypes: ['Safari Tent', 'Deluxe Tent', 'Family Tent', 'Honeymoon Suite'],
    location: 'Monteverde',
    address: 'Cloud Forest Reserve, Monteverde',
    city: 'Monteverde',
    country: 'Costa Rica',
    rating: 4.7,
    price: 285,
    amenities: [
      'Treehouse Rooms',
      'Zip-Lining',
      'Wildlife Tours',
      'Organic Restaurant',
      'Nature Trails',
      'Bird Watching',
      'Solar Powered',
      'Sustainable Practices'
    ],
    roomTypes: ['Standard Cabin', 'Treehouse Suite', 'Canopy Villa', 'Family Lodge'],
    location: 'Uluru',
    address: 'Uluru-Kata Tjuta National Park',
    city: 'Yulara',
    country: 'Australia',
    rating: 4.8,
    price: 520,
    amenities: [
      'Stargazing Tours',
      'Aboriginal Culture',
      'Bush Walks',
      'Gourmet Dining',
      'Wildlife Viewing',
      'Telescope Access',
      'Campfire Stories',
      'Luxury Tents'
    ],
    roomTypes: ['Outback Tent', 'Deluxe Pavilion', 'Desert Suite', 'Star Gazer Suite'],
    location: 'Barcelona',
    address: 'Gothic Quarter, Barcelona',
    city: 'Barcelona',
    country: 'Spain',
    rating: 4.5,
    price: 35,
    amenities: [
      'Rooftop Terrace',
      'Free Walking Tours',
      'Communal Kitchen',
      'Social Events',
      'Free WiFi',
      'Laundry',
      'Lockers',
      'Bar'
    ],
    roomTypes: ['4-Bed Dorm', '6-Bed Dorm', '8-Bed Dorm', 'Private Room'],
    location: 'Bangkok',
    address: 'Sukhumvit Road, Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    rating: 4.4,
    price: 45,
    amenities: [
      'Rooftop Pool',
      'Street Food Tours',
      'Bike Rentals',
      'Free WiFi',
      'Café',
      'Laundry Service',
      'Tour Desk',
      'Near BTS'
    ],
    roomTypes: ['Single Room', 'Double Room', 'Twin Room', 'Family Room'],
    location: 'Jaipur',
    address: 'Old City, Jaipur',
    city: 'Jaipur',
    country: 'India',
    rating: 4.8,
    price: 350,
    amenities: [
      'Palace Architecture',
      'Royal Dining',
      'Cultural Shows',
      'Heritage Tours',
      'Spa',
      'Swimming Pool',
      'Elephant Rides',
      'Traditional Music'
    ],
    roomTypes: ['Heritage Room', 'Royal Suite', 'Palace Suite', 'Maharaja Suite'],
    location: 'Cartagena',
    address: 'Old Town, Cartagena',
    city: 'Cartagena',
    country: 'Colombia',
    rating: 4.7,
    price: 220,
    amenities: [
      'Colonial Architecture',
      'Courtyard Garden',
      'Rooftop Pool',
      'Coffee Bar',
      'Library',
      'Concierge',
      'Free WiFi',
      'Breakfast Included'
    ],
    roomTypes: ['Classic Room', 'Courtyard Suite', 'Colonial Suite', 'Penthouse'],
    location: 'Singapore',
    address: 'CBD, Marina Bay, Singapore',
    city: 'Singapore',
    country: 'Singapore',
    rating: 4.6,
    price: 280,
    amenities: [
      'Meeting Rooms',
      'Executive Lounge',
      '24-Hour Gym',
      'Business Center',
      'Express Laundry',
      'Airport Shuttle',
      'High-Speed WiFi',
      'Concierge'
    ],
    roomTypes: ['Deluxe Room', 'Executive Room', 'Business Suite', 'Club Floor'],
    location: 'Dubai',
    address: 'DIFC, Dubai',
    city: 'Dubai',
    country: 'UAE',
    rating: 4.8,
    price: 420,
    amenities: [
      'Infinity Pool',
      'Rooftop Restaurant',
      'Luxury Spa',
      'Meeting Facilities',
      'Valet Parking',
      'Chauffeur Service',
      'Executive Lounge',
      'Personal Butler'
    ],
    roomTypes: ['Deluxe City View', 'Executive Suite', 'Club Suite', 'Presidential Suite'],
    where: { tenantId: tenant.id },
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } }
  });

  hotelsByCountry.forEach((group) => {
    console.log(`  ${group.country}: ${group._count.country} hotels`);
  });

  // Price ranges
  console.log('\n💰 Price distribution:');
  const budget = await prisma.hotel.count({
    where: { tenantId: tenant.id, price: { lt: 100 } }
  });
  const mid = await prisma.hotel.count({
    where: { tenantId: tenant.id, price: { gte: 100, lt: 400 } }
  });
  const luxury = await prisma.hotel.count({
    where: { tenantId: tenant.id, price: { gte: 400 } }
  });

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
