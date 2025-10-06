import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Static route data from frontend to migrate
const ROUTE_DATA = {
  "cruise-royal-caribbean": {
    routeNames: ["Miami", "Nassau", "Cozumel", "Key West", "Miami"],
    routeGeo: [
      { name: "Miami", lat: 25.7617, lng: -80.1918 },
      { name: "Nassau", lat: 25.047, lng: -77.3554 },
      { name: "Cozumel", lat: 20.422, lng: -86.92 },
      { name: "Key West", lat: 24.5551, lng: -81.78 },
      { name: "Miami", lat: 25.7617, lng: -80.1918 },
    ],
    highlights: ["Island excursions", "Sunset deck", "Live music"],
    videos: {
      poster: "https://images.unsplash.com/photo-1526481280698-8fcc13fd87f8?w=1600&q=60&auto=format&fit=crop",
      main: "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4",
      teasers: [
        { title: "Sail Away", src: "https://cdn.coverr.co/videos/coverr-slow-waves-7284/1080p.mp4" },
        { title: "Island Dock", src: "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4" },
        { title: "Blue Hour", src: "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4" },
      ],
      gallery: [
        "https://cdn.coverr.co/videos/coverr-ocean-waves-1595/1080p.mp4",
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4",
      ]
    }
  },
  "cruise-mediterranean-odyssey": {
    routeNames: ["Barcelona", "Cannes", "Rome", "Santorini", "Athens"],
    routeGeo: [
      { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
      { name: "Cannes", lat: 43.5528, lng: 7.0174 },
      { name: "Rome", lat: 41.9028, lng: 12.4964 },
      { name: "Santorini", lat: 36.3932, lng: 25.4615 },
      { name: "Athens", lat: 37.9755, lng: 23.7348 },
    ],
    highlights: ["Historical ports", "Fine dining", "Cultural excursions"],
    videos: {
      poster: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f8?w=1600&q=60&auto=format&fit=crop",
      main: "https://cdn.coverr.co/videos/coverr-mediterranean-sea-8933/1080p.mp4",
      teasers: [
        { title: "Ancient Ports", src: "https://cdn.coverr.co/videos/coverr-mediterranean-sea-8933/1080p.mp4" },
        { title: "Greek Isles", src: "https://cdn.coverr.co/videos/coverr-sailing-ship-9243/1080p.mp4" },
      ],
      gallery: []
    }
  },
  "cruise-alaska-wilderness": {
    routeNames: ["Seattle", "Juneau", "Skagway", "Ketchikan", "Seattle"],
    routeGeo: [
      { name: "Seattle", lat: 47.6062, lng: -122.3321 },
      { name: "Juneau", lat: 58.3019, lng: -134.4197 },
      { name: "Skagway", lat: 59.4600, lng: -135.3109 },
      { name: "Ketchikan", lat: 55.3422, lng: -131.6461 },
      { name: "Seattle", lat: 47.6062, lng: -122.3321 },
    ],
    highlights: ["Glacier viewing", "Wildlife spotting", "Nature tours"],
    videos: {
      poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=60&auto=format&fit=crop",
      main: "https://cdn.coverr.co/videos/coverr-snow-mountain-4919/1080p.mp4",
      teasers: [
        { title: "Glacial Views", src: "https://cdn.coverr.co/videos/coverr-snow-mountain-4919/1080p.mp4" },
      ],
      gallery: []
    }
  }
};

async function migrateRouteData() {
  try {
    console.log('🚀 Starting route data migration...');

    for (const [cruiseId, data] of Object.entries(ROUTE_DATA)) {
      console.log(`📍 Updating cruise: ${cruiseId}`);

      const cruise = await prisma.cruise.findUnique({
        where: { id: cruiseId }
      });

      if (cruise) {
        await prisma.cruise.update({
          where: { id: cruiseId },
          data: {
            routeGeo: data.routeGeo,
            routeNames: data.routeNames,
            highlights: data.highlights,
            videos: data.videos
          }
        });
        console.log(`✅ Updated ${cruiseId} with route data`);
      } else {
        console.log(`⚠️  Cruise ${cruiseId} not found in database`);
      }
    }

    console.log('🎉 Route data migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateRouteData()
    .then(() => {
      console.log('Migration finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateRouteData };