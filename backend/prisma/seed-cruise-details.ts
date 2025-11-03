import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cabinTypes = [
  { name: "Interior", size: "16–18 m²", perks: ["Queen/Twin", "Smart TV"] },
  { name: "Oceanview", size: "18–20 m²", perks: ["Sea window", "Mini bar"] },
  { name: "Balcony", size: "20–24 m²", perks: ["Private balcony", "Sofa"] },
  { name: "Suite", size: "30–45 m²", perks: ["Concierge", "Lounge access"] },
];

const faqItems = [
  { q: "Do I need a passport?", a: "International ports typically require a passport. Check your local requirements." },
  { q: "What dining is included?", a: "Main dining room and buffet are included. Specialty venues have a surcharge." },
  { q: "Is Wi-Fi available?", a: "Yes, Wi-Fi packages are available for purchase onboard at various pricing tiers." },
  { q: "What should I pack?", a: "Comfortable clothing for daytime, formal attire for evening dining, swimwear, sunscreen, and any necessary medications." },
];

const inclusionsList = [
  "All meals in main dining & buffet",
  "Evening entertainment & shows",
  "Pools & fitness center access",
  "Kids & teens programs",
  "Port taxes & fees",
  "Welcome cocktail party",
];

// Video URLs for different cruise types
const videoData = {
  caribbean: {
    teasers: [
      { title: "Sail Away", src: "https://cdn.coverr.co/videos/coverr-slow-waves-7284/1080p.mp4" },
      { title: "Island Dock", src: "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4" },
      { title: "Blue Hour", src: "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4" },
    ],
    gallery: [
      "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4",
      "https://www.w3schools.com/html/mov_bbb.mp4",
      "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4",
    ],
  },
  mediterranean: {
    teasers: [
      { title: "Harbor Mornings", src: "https://cdn.coverr.co/videos/coverr-sunset-over-the-harbor-6138/1080p.mp4" },
      { title: "Coastal Run", src: "https://cdn.coverr.co/videos/coverr-coastline-5241/1080p.mp4" },
    ],
    gallery: [
      "https://cdn.coverr.co/videos/coverr-coastal-waves-2078/1080p.mp4",
      "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4",
    ],
  },
  alaska: {
    teasers: [
      { title: "Fjord Glide", src: "https://cdn.coverr.co/videos/coverr-icebergs-ice-3961/1080p.mp4" },
      { title: "Wild North", src: "https://cdn.coverr.co/videos/coverr-mountain-lake-3585/1080p.mp4" },
    ],
    gallery: [
      "https://cdn.coverr.co/videos/coverr-icebergs-ice-3961/1080p.mp4",
      "https://cdn.coverr.co/videos/coverr-waterfall-valley-2076/1080p.mp4",
    ],
  },
  default: {
    teasers: [
      { title: "Open Sea", src: "https://cdn.coverr.co/videos/coverr-slow-waves-7284/1080p.mp4" },
      { title: "Golden Hour", src: "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4" },
    ],
    gallery: [
      "https://www.w3schools.com/html/mov_bbb.mp4",
      "https://cdn.coverr.co/videos/coverr-slow-waves-7284/1080p.mp4",
    ],
  },
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getCruiseTypeFromName(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('luxury') || nameLower.includes('premium')) return 'Luxury';
  if (nameLower.includes('family') || nameLower.includes('kids')) return 'Family';
  if (nameLower.includes('adventure') || nameLower.includes('expedition')) return 'Adventure';
  if (nameLower.includes('romantic') || nameLower.includes('couples')) return 'Romantic';
  return 'Standard';
}

function getVideosForCategory(categoryName: string) {
  const catLower = categoryName.toLowerCase();
  if (catLower.includes('caribbean')) return videoData.caribbean;
  if (catLower.includes('mediterranean')) return videoData.mediterranean;
  if (catLower.includes('alaska')) return videoData.alaska;
  return videoData.default;
}

async function main() {
  console.log('🚀 Starting cruise details seeding...');

  // Get all cruises
  const cruises = await prisma.cruise.findMany({
    include: {
      category: true,
    },
  });

  console.log(`Found ${cruises.length} cruises to update`);

  for (const cruise of cruises) {
    const slug = generateSlug(cruise.name);
    const cruiseType = getCruiseTypeFromName(cruise.name);
    const videos = cruise.category
      ? getVideosForCategory(cruise.category.name)
      : videoData.default;

    // Get route data from existing fields or create default
    const routeGeo = cruise.routeGeo || [
      { name: "Embark", lat: 25.7617, lng: -80.1918 },
      { name: "At Sea", lat: 24.0, lng: -78.0 },
      { name: "Port", lat: 23.1, lng: -81.2 },
      { name: "Return", lat: 25.7617, lng: -80.1918 },
    ];

    const routeNames = cruise.routeNames.length > 0
      ? cruise.routeNames
      : ["Embark", "At Sea", "Port", "Return"];

    const highlights = cruise.highlights.length > 0
      ? cruise.highlights
      : ["Luxury accommodations", "World-class dining", "Entertainment"];

    const amenities = cruise.amenities.length > 0
      ? cruise.amenities
      : ["Pool", "Spa", "Theater", "Dining", "Gym", "Casino", "Kids Club"];

    // Update cruise with dynamic data
    await prisma.cruise.update({
      where: { id: cruise.id },
      data: {
        slug,
        summary: `Experience ${cruise.duration} unforgettable days sailing through ${cruise.destination}`,
        type: cruiseType,
        departurePort: cruise.departure,
        routeGeo,
        routeNames,
        highlights,
        amenities,
        inclusions: inclusionsList,
        cabins: cabinTypes,
        faq: faqItems,
        videos,
        posterImage: cruise.image, // Use main image as poster
      },
    });

    console.log(`✅ Updated cruise: ${cruise.name} (slug: ${slug})`);
  }

  console.log('🎉 Cruise details seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding cruise details:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });