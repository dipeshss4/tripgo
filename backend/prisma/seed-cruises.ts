import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cruises = [
  // Caribbean Cruises
  {
    name: "Caribbean Paradise - 7 Day Cruise",
    description: "Experience the ultimate Caribbean getaway with stops at pristine beaches, vibrant ports, and tropical islands. Enjoy world-class dining, entertainment, and relaxation aboard our luxury vessel.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800"
    ],
    rating: 4.8,
    price: 1299.00,
    duration: 7,
    capacity: 3000,
    available: true,
    departure: "Miami, Florida",
    destination: "Eastern Caribbean",
    routeNames: ["Miami", "Nassau", "St. Thomas", "San Juan", "Miami"],
    highlights: ["Private beach access", "Unlimited dining", "Broadway shows", "Water park"],
    amenities: ["Pool", "Spa", "Casino", "Fitness Center", "Kids Club", "Wi-Fi", "Restaurants", "Bars"]
  },
  {
    name: "Western Caribbean Adventure",
    description: "Discover ancient Mayan ruins, pristine beaches, and vibrant cultures on this exciting Western Caribbean cruise featuring Cozumel, Jamaica, and Grand Cayman.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
    ],
    rating: 4.7,
    price: 1199.00,
    duration: 7,
    capacity: 2500,
    available: true,
    departure: "Fort Lauderdale, Florida",
    destination: "Western Caribbean",
    routeNames: ["Fort Lauderdale", "Cozumel", "Grand Cayman", "Jamaica", "Fort Lauderdale"],
    highlights: ["Mayan ruins tours", "Snorkeling adventures", "Beach parties", "Duty-free shopping"],
    amenities: ["Pool", "Spa", "Casino", "Theater", "Kids Club", "Wi-Fi", "Multiple Restaurants"]
  },
  {
    name: "Southern Caribbean Explorer",
    description: "Explore the exotic southern islands including Aruba, Curaçao, and Barbados. Experience unique cultures, stunning beaches, and unforgettable adventures.",
    image: "https://images.unsplash.com/photo-1583149577728-9297b8dc95f2?w=800",
    images: [
      "https://images.unsplash.com/photo-1583149577728-9297b8dc95f2?w=800",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"
    ],
    rating: 4.9,
    price: 1599.00,
    duration: 10,
    capacity: 3500,
    available: true,
    departure: "San Juan, Puerto Rico",
    destination: "Southern Caribbean",
    routeNames: ["San Juan", "St. Lucia", "Barbados", "Grenada", "Aruba", "Curaçao", "San Juan"],
    highlights: ["Island hopping", "Cultural experiences", "Perfect weather", "Crystal waters"],
    amenities: ["Infinity Pool", "Luxury Spa", "Casino", "Fine Dining", "Entertainment", "Wi-Fi"]
  },

  // Mediterranean Cruises
  {
    name: "Mediterranean Treasures - Barcelona to Rome",
    description: "Sail through the Mediterranean visiting iconic cities including Barcelona, Monaco, Florence, and Rome. Immerse yourself in art, history, and world-class cuisine.",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
    images: [
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
      "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800"
    ],
    rating: 4.9,
    price: 2299.00,
    duration: 10,
    capacity: 2800,
    available: true,
    departure: "Barcelona, Spain",
    destination: "Rome, Italy",
    routeNames: ["Barcelona", "Monaco", "Florence", "Rome"],
    highlights: ["UNESCO World Heritage sites", "Gourmet cuisine", "Wine tastings", "Historic tours"],
    amenities: ["Pool", "Spa", "Fine Dining", "Wine Bar", "Library", "Fitness Center", "Wi-Fi"]
  },
  {
    name: "Greek Islands Paradise",
    description: "Discover the magic of Greece with stops at Santorini, Mykonos, Crete, and Athens. Experience ancient history, stunning sunsets, and authentic Greek hospitality.",
    image: "https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800",
    images: [
      "https://images.unsplash.com/photo-1601581987809-a874a81309c9?w=800",
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800"
    ],
    rating: 5.0,
    price: 1899.00,
    duration: 7,
    capacity: 2000,
    available: true,
    departure: "Athens, Greece",
    destination: "Greek Islands",
    routeNames: ["Athens", "Santorini", "Mykonos", "Crete", "Rhodes", "Athens"],
    highlights: ["White-washed villages", "Ancient ruins", "Sunset views", "Greek cuisine"],
    amenities: ["Pool", "Spa", "Greek Restaurant", "Deck Bar", "Entertainment", "Wi-Fi"]
  },
  {
    name: "Italian Riviera & French Riviera",
    description: "Experience the glamour of the Mediterranean's most stunning coastlines. Visit Portofino, Cinque Terre, Nice, and Monaco on this luxurious voyage.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800"
    ],
    rating: 4.8,
    price: 2599.00,
    duration: 7,
    capacity: 1800,
    available: true,
    departure: "Genoa, Italy",
    destination: "Monaco",
    routeNames: ["Genoa", "Portofino", "Cinque Terre", "Nice", "Cannes", "Monaco"],
    highlights: ["Luxury shopping", "Michelin dining", "Casino de Monte Carlo", "Coastal beauty"],
    amenities: ["Infinity Pool", "Luxury Spa", "Fine Dining", "Casino", "Boutiques", "Wi-Fi"]
  },

  // Alaska Cruises
  {
    name: "Alaska Inside Passage - Glacier Explorer",
    description: "Witness breathtaking glaciers, abundant wildlife, and pristine wilderness. Visit Juneau, Skagway, and Ketchikan while cruising through stunning fjords.",
    image: "https://images.unsplash.com/photo-1517639493569-5666a7556f5c?w=800",
    images: [
      "https://images.unsplash.com/photo-1517639493569-5666a7556f5c?w=800",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
    ],
    rating: 4.9,
    price: 1799.00,
    duration: 7,
    capacity: 2200,
    available: true,
    departure: "Seattle, Washington",
    destination: "Alaska Inside Passage",
    routeNames: ["Seattle", "Juneau", "Skagway", "Ketchikan", "Glacier Bay", "Seattle"],
    highlights: ["Glacier viewing", "Wildlife spotting", "Native culture", "Scenic cruising"],
    amenities: ["Heated Pool", "Spa", "Observatory", "Theater", "Restaurants", "Wi-Fi"]
  },
  {
    name: "Ultimate Alaska Adventure",
    description: "The most comprehensive Alaska cruise featuring all major ports, Glacier Bay National Park, and Hubbard Glacier. Perfect for nature lovers and photographers.",
    image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800",
    images: [
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800",
      "https://images.unsplash.com/photo-1517639493569-5666a7556f5c?w=800"
    ],
    rating: 5.0,
    price: 2499.00,
    duration: 14,
    capacity: 2500,
    available: true,
    departure: "Vancouver, Canada",
    destination: "Alaska",
    routeNames: ["Vancouver", "Juneau", "Skagway", "Glacier Bay", "Hubbard Glacier", "Sitka", "Ketchikan", "Vancouver"],
    highlights: ["Two glacier visits", "Extended port stays", "Wildlife expeditions", "Photography workshops"],
    amenities: ["Pool", "Spa", "Theater", "Observatory", "Fitness Center", "Multiple Restaurants", "Wi-Fi"]
  },

  // Pacific & Asia Cruises
  {
    name: "Hawaiian Islands Paradise",
    description: "Explore all major Hawaiian islands including Oahu, Maui, Kauai, and the Big Island. Experience luaus, volcanoes, and pristine beaches.",
    image: "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800",
    images: [
      "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
    ],
    rating: 4.8,
    price: 2199.00,
    duration: 7,
    capacity: 2000,
    available: true,
    departure: "Honolulu, Hawaii",
    destination: "Hawaiian Islands",
    routeNames: ["Honolulu", "Maui", "Kauai", "Big Island", "Honolulu"],
    highlights: ["Luau experiences", "Volcano tours", "Snorkeling", "Beach time"],
    amenities: ["Pool", "Spa", "Hawaiian Restaurant", "Entertainment", "Fitness Center", "Wi-Fi"]
  },
  {
    name: "Asia Discovery - Japan & South Korea",
    description: "Immerse yourself in Asian culture visiting Tokyo, Kyoto, Osaka, Seoul, and Busan. Experience temples, technology, and traditional cuisine.",
    image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800",
    images: [
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800",
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800"
    ],
    rating: 4.7,
    price: 2899.00,
    duration: 12,
    capacity: 2400,
    available: true,
    departure: "Tokyo, Japan",
    destination: "East Asia",
    routeNames: ["Tokyo", "Kyoto", "Osaka", "Seoul", "Busan", "Tokyo"],
    highlights: ["Temple visits", "Tech tours", "Traditional shows", "Asian cuisine"],
    amenities: ["Pool", "Spa", "Asian Restaurants", "Tea Room", "Theater", "Wi-Fi"]
  },

  // Northern Europe Cruises
  {
    name: "Norwegian Fjords Explorer",
    description: "Cruise through Norway's spectacular fjords visiting Bergen, Geiranger, and the North Cape. Witness waterfalls, mountains, and Nordic villages.",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800",
    images: [
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800",
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800"
    ],
    rating: 4.9,
    price: 2299.00,
    duration: 10,
    capacity: 1800,
    available: true,
    departure: "Copenhagen, Denmark",
    destination: "Norwegian Fjords",
    routeNames: ["Copenhagen", "Bergen", "Geiranger", "Trondheim", "Tromsø", "North Cape", "Copenhagen"],
    highlights: ["Fjord cruising", "Northern Lights", "Viking history", "Scenic beauty"],
    amenities: ["Pool", "Spa", "Nordic Restaurant", "Observatory", "Library", "Wi-Fi"]
  },
  {
    name: "Baltic Capitals & St. Petersburg",
    description: "Discover the cultural treasures of Northern Europe including Stockholm, Helsinki, Tallinn, and the magnificent St. Petersburg palaces.",
    image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800",
    images: [
      "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800",
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800"
    ],
    rating: 4.8,
    price: 2199.00,
    duration: 9,
    capacity: 2200,
    available: true,
    departure: "Stockholm, Sweden",
    destination: "Baltic Sea",
    routeNames: ["Stockholm", "Helsinki", "St. Petersburg", "Tallinn", "Riga", "Stockholm"],
    highlights: ["Palace tours", "Medieval old towns", "Baltic cuisine", "Cultural shows"],
    amenities: ["Pool", "Spa", "Fine Dining", "Theater", "Library", "Wi-Fi"]
  },

  // Exotic & Adventure Cruises
  {
    name: "Panama Canal Transit",
    description: "Experience one of the world's greatest engineering marvels. Transit the Panama Canal while visiting Costa Rica and Colombia's Caribbean coast.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
    ],
    rating: 4.7,
    price: 1999.00,
    duration: 8,
    capacity: 2600,
    available: true,
    departure: "Miami, Florida",
    destination: "Panama Canal",
    routeNames: ["Miami", "Cartagena", "Panama Canal", "Costa Rica", "Miami"],
    highlights: ["Canal transit", "Rainforest tours", "Colonial cities", "Wildlife viewing"],
    amenities: ["Pool", "Spa", "Casino", "Restaurants", "Theater", "Wi-Fi"]
  },
  {
    name: "South Pacific Islands Paradise",
    description: "Discover remote tropical paradises including Fiji, Tahiti, and Bora Bora. Experience overwater bungalows views, coral reefs, and Polynesian culture.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ],
    rating: 5.0,
    price: 3299.00,
    duration: 14,
    capacity: 1500,
    available: true,
    departure: "Papeete, Tahiti",
    destination: "South Pacific",
    routeNames: ["Papeete", "Bora Bora", "Moorea", "Fiji", "Papeete"],
    highlights: ["Island paradise", "Snorkeling", "Polynesian culture", "Overwater views"],
    amenities: ["Infinity Pool", "Luxury Spa", "Fine Dining", "Water Sports", "Entertainment", "Wi-Fi"]
  },
  {
    name: "Antarctica Expedition Cruise",
    description: "The ultimate adventure to the white continent. Experience penguins, icebergs, and pristine wilderness on this expedition-style cruise.",
    image: "https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800",
    images: [
      "https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
    ],
    rating: 5.0,
    price: 5999.00,
    duration: 12,
    capacity: 200,
    available: true,
    departure: "Ushuaia, Argentina",
    destination: "Antarctica",
    routeNames: ["Ushuaia", "Drake Passage", "Antarctic Peninsula", "South Shetland Islands", "Ushuaia"],
    highlights: ["Penguin colonies", "Zodiac landings", "Expedition team", "Wildlife photography"],
    amenities: ["Heated Pool", "Spa", "Restaurant", "Lecture Hall", "Observatory", "Library"]
  },

  // Luxury & Theme Cruises
  {
    name: "Luxury World Cruise - 180 Days",
    description: "The ultimate bucket-list journey visiting 6 continents, 60+ ports, and experiencing the world's most iconic destinations in unparalleled luxury.",
    image: "https://images.unsplash.com/photo-1583149577728-9297b8dc95f2?w=800",
    images: [
      "https://images.unsplash.com/photo-1583149577728-9297b8dc95f2?w=800",
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800"
    ],
    rating: 5.0,
    price: 45999.00,
    duration: 180,
    capacity: 800,
    available: true,
    departure: "New York, USA",
    destination: "World Tour",
    routeNames: ["New York", "Caribbean", "South America", "Antarctica", "South Pacific", "Asia", "Europe", "Africa", "New York"],
    highlights: ["World circumnavigation", "VIP experiences", "Exclusive events", "All-inclusive luxury"],
    amenities: ["Multiple Pools", "Luxury Spa", "Fine Dining", "Theater", "Casino", "Library", "Boutiques", "Wi-Fi"]
  },
  {
    name: "Music Festival at Sea",
    description: "A unique cruise featuring live performances from top artists, DJ sets, and music workshops. Perfect for music lovers and festival enthusiasts.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
    ],
    rating: 4.6,
    price: 1499.00,
    duration: 5,
    capacity: 3000,
    available: true,
    departure: "Miami, Florida",
    destination: "Bahamas",
    routeNames: ["Miami", "Nassau", "Private Island", "Miami"],
    highlights: ["Live concerts", "Meet & greets", "DJ pool parties", "Music workshops"],
    amenities: ["Multiple Stages", "Pool", "Bars", "Restaurants", "Dance Floors", "Wi-Fi"]
  },
  {
    name: "Culinary Excellence Cruise",
    description: "A gourmet journey featuring Michelin-star chefs, cooking classes, wine tastings, and food tours at Mediterranean ports.",
    image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800",
    images: [
      "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800",
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800"
    ],
    rating: 4.9,
    price: 3299.00,
    duration: 10,
    capacity: 600,
    available: true,
    departure: "Barcelona, Spain",
    destination: "Mediterranean",
    routeNames: ["Barcelona", "Monaco", "Florence", "Rome", "Marseille", "Barcelona"],
    highlights: ["Celebrity chefs", "Cooking classes", "Wine tastings", "Market tours"],
    amenities: ["Gourmet Restaurants", "Cooking Studio", "Wine Bar", "Pool", "Spa", "Wi-Fi"]
  },

  // Family & Adventure Cruises
  {
    name: "Ultimate Family Fun Cruise",
    description: "Perfect for families with kids of all ages. Features water parks, kids clubs, character meet-and-greets, and family-friendly entertainment.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    images: [
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"
    ],
    rating: 4.8,
    price: 1199.00,
    duration: 7,
    capacity: 4000,
    available: true,
    departure: "Port Canaveral, Florida",
    destination: "Eastern Caribbean",
    routeNames: ["Port Canaveral", "Nassau", "Private Island", "Port Canaveral"],
    highlights: ["Water slides", "Kids clubs", "Family shows", "Beach day"],
    amenities: ["Water Park", "Kids Club", "Teen Club", "Pool", "Restaurants", "Theater", "Wi-Fi"]
  },
  {
    name: "Adults Only Luxury Escape",
    description: "An adults-only retreat featuring tranquil pools, spa experiences, gourmet dining, and sophisticated entertainment. Perfect for couples.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ],
    rating: 4.9,
    price: 2299.00,
    duration: 7,
    capacity: 1200,
    available: true,
    departure: "Barcelona, Spain",
    destination: "Mediterranean",
    routeNames: ["Barcelona", "Nice", "Rome", "Barcelona"],
    highlights: ["Adults-only", "Spa experiences", "Fine dining", "Quiet zones"],
    amenities: ["Infinity Pool", "Luxury Spa", "Fine Dining", "Wine Bar", "Library", "Fitness Center", "Wi-Fi"]
  },

  // More Regional Cruises
  {
    name: "New England & Canada Fall Foliage",
    description: "Experience stunning autumn colors while visiting Boston, Bar Harbor, Quebec, and Montreal. Perfect timing for leaf-peeping season.",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800",
    images: [
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800",
      "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800"
    ],
    rating: 4.7,
    price: 1599.00,
    duration: 7,
    capacity: 2000,
    available: true,
    departure: "New York, USA",
    destination: "New England",
    routeNames: ["New York", "Boston", "Bar Harbor", "Halifax", "Quebec", "Montreal", "New York"],
    highlights: ["Fall foliage", "Historic cities", "Lighthouses", "Lobster feasts"],
    amenities: ["Pool", "Spa", "Restaurants", "Theater", "Fitness Center", "Wi-Fi"]
  },
  {
    name: "Australia & New Zealand Discovery",
    description: "Explore Down Under visiting Sydney, Melbourne, Auckland, and Milford Sound. Experience unique wildlife, stunning landscapes, and vibrant cities.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800"
    ],
    rating: 4.8,
    price: 2899.00,
    duration: 14,
    capacity: 2500,
    available: true,
    departure: "Sydney, Australia",
    destination: "Australia & NZ",
    routeNames: ["Sydney", "Melbourne", "Tasmania", "Milford Sound", "Auckland", "Sydney"],
    highlights: ["Great Barrier Reef", "Fjord cruising", "Wildlife encounters", "Wine regions"],
    amenities: ["Pool", "Spa", "Fine Dining", "Theater", "Fitness Center", "Library", "Wi-Fi"]
  }
];

async function main() {
  console.log('🚢 Starting cruise seeding...');

  const tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    throw new Error('No tenant found. Please create a tenant first.');
  }

  console.log(`✅ Found tenant: ${tenant.name}`);
  console.log(`🚢 Creating ${cruises.length} cruises...`);

  let created = 0;
  let skipped = 0;

  for (const cruise of cruises) {
    try {
      await prisma.cruise.create({
        data: {
          ...cruise,
          tenantId: tenant.id
        }
      });
      created++;
      console.log(`✅ Created: "${cruise.name}"`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        skipped++;
        console.log(`⏭️  Skipped (exists): "${cruise.name}"`);
      } else {
        console.error(`❌ Error creating "${cruise.name}":`, error.message);
      }
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`✅ Created: ${created} cruises`);
  console.log(`⏭️  Skipped: ${skipped} cruises`);

  const total = await prisma.cruise.count();
  console.log(`📦 Total cruises in database: ${total}`);

  console.log('\n✨ Cruise seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
