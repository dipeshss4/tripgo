import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const videos = [
  {
    filename: 'sunset-cruise-magic.mp4',
    originalName: 'Sunset Cruise Magic',
    path: '/uploads/videos/sunset-cruise-magic.mp4',
    url: 'https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4',
    size: 15728640,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Sunset Cruise Magic',
    description: 'Golden hour sailing across the Mediterranean with breathtaking sunset views',
    alt: 'Sunset cruise video',
    tags: ['Relaxation', 'Sunset', 'Mediterranean', 'Featured'],
    folder: 'cruise-videos',
    width: 1920,
    height: 1080,
    duration: 52.5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'island-paradise.mp4',
    originalName: 'Island Paradise',
    path: '/uploads/videos/island-paradise.mp4',
    url: 'https://videos.pexels.com/video-files/2169307/2169307-uhd_2560_1440_30fps.mp4',
    size: 28672000,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Island Paradise',
    description: 'Crystal clear waters and tropical beaches - the ultimate island getaway',
    alt: 'Tropical island video',
    tags: ['Adventure', 'Tropical', 'Beach', 'Popular'],
    folder: 'cruise-videos',
    width: 2560,
    height: 1440,
    duration: 75.3,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'luxury-yacht-life.mp4',
    originalName: 'Luxury Yacht Life',
    path: '/uploads/videos/luxury-yacht-life.mp4',
    url: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
    size: 32505856,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Luxury Yacht Life',
    description: 'Experience ultimate sophistication at sea aboard our luxury vessels',
    alt: 'Luxury yacht video',
    tags: ['Luxury', 'Dining', 'Premium', 'Top Pick'],
    folder: 'cruise-videos',
    width: 2560,
    height: 1440,
    duration: 88.2,
    thumbnailUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'coastal-wonders.mp4',
    originalName: 'Coastal Wonders',
    path: '/uploads/videos/coastal-wonders.mp4',
    url: 'https://videos.pexels.com/video-files/2169542/2169542-uhd_2560_1440_30fps.mp4',
    size: 25165824,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Coastal Wonders',
    description: 'Breathtaking views of rugged coastlines and pristine shores',
    alt: 'Coastal scenery video',
    tags: ['Wellness', 'Nature', 'Scenic', 'Trending'],
    folder: 'cruise-videos',
    width: 2560,
    height: 1440,
    duration: 102.7,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'ocean-serenity.mp4',
    originalName: 'Ocean Serenity',
    path: '/uploads/videos/ocean-serenity.mp4',
    url: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4',
    size: 18874368,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Ocean Serenity',
    description: 'Peaceful waves and endless horizons - find your inner calm',
    alt: 'Ocean waves video',
    tags: ['Relaxation', 'Peaceful', 'Ocean', 'Featured'],
    folder: 'cruise-videos',
    width: 1920,
    height: 1080,
    duration: 116.8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'tropical-escape.mp4',
    originalName: 'Tropical Escape',
    path: '/uploads/videos/tropical-escape.mp4',
    url: 'https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4',
    size: 30408704,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Tropical Escape',
    description: 'Palm trees swaying in the island breeze - your tropical paradise awaits',
    alt: 'Tropical escape video',
    tags: ['Sports', 'Adventure', 'Tropical', 'Popular'],
    folder: 'cruise-videos',
    width: 2560,
    height: 1440,
    duration: 123.5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'harbor-sunset.mp4',
    originalName: 'Harbor Sunset',
    path: '/uploads/videos/harbor-sunset.mp4',
    url: 'https://videos.pexels.com/video-files/857251/857251-hd_1920_1080_24fps.mp4',
    size: 22020096,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Harbor Sunset',
    description: 'Docking at picturesque Mediterranean ports during golden hour',
    alt: 'Harbor sunset video',
    tags: ['Entertainment', 'Scenic', 'Port', 'New'],
    folder: 'cruise-videos',
    width: 1920,
    height: 1080,
    duration: 98.3,
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'beach-paradise.mp4',
    originalName: 'Beach Paradise',
    path: '/uploads/videos/beach-paradise.mp4',
    url: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_25fps.mp4',
    size: 19922944,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Beach Paradise',
    description: 'White sands and turquoise waters - the perfect beach destination',
    alt: 'Beach paradise video',
    tags: ['Adventure', 'Beach', 'Tropical', 'Top Pick'],
    folder: 'cruise-videos',
    width: 1920,
    height: 1080,
    duration: 82.4,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'caribbean-highlights.mp4',
    originalName: 'Caribbean Highlights',
    path: '/uploads/videos/caribbean-highlights.mp4',
    url: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
    size: 31457280,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Caribbean Highlights',
    description: 'Turquoise bays, sunset decks, and island hopping adventures',
    alt: 'Caribbean cruise video',
    tags: ['Featured', 'Caribbean', 'Adventure', 'Popular'],
    folder: 'cruise-videos',
    width: 2560,
    height: 1440,
    duration: 91.6,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'mediterranean-dreams.mp4',
    originalName: 'Mediterranean Dreams',
    path: '/uploads/videos/mediterranean-dreams.mp4',
    url: 'https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4',
    size: 29360128,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Mediterranean Dreams',
    description: 'From Amalfi cliffs to Greek isles - experience Mediterranean magic',
    alt: 'Mediterranean cruise video',
    tags: ['Editors\' Choice', 'Mediterranean', 'Luxury', 'Popular'],
    folder: 'cruise-videos',
    width: 2560,
    height: 1440,
    duration: 105.2,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526481280698-8fcc13fd87f8?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'cruise-ship-exterior.mp4',
    originalName: 'Cruise Ship Exterior',
    path: '/uploads/videos/cruise-ship-exterior.mp4',
    url: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4',
    size: 24117248,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Cruise Ship Exterior',
    description: 'Navigate through crystal blue waters aboard our world-class ships',
    alt: 'Cruise ship exterior video',
    tags: ['Featured', 'Ship', 'Ocean', 'New'],
    folder: 'cruise-videos',
    width: 1920,
    height: 1080,
    duration: 94.7,
    thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=60&auto=format&fit=crop',
  },
  {
    filename: 'deck-experience.mp4',
    originalName: 'Deck Experience',
    path: '/uploads/videos/deck-experience.mp4',
    url: 'https://videos.pexels.com/video-files/2169542/2169542-uhd_2560_1440_30fps.mp4',
    size: 27262976,
    mimetype: 'video/mp4',
    category: 'VIDEO' as const,
    title: 'Deck Experience',
    description: 'Enjoy stunning coastlines and pristine beaches from our premium decks',
    alt: 'Cruise deck video',
    tags: ['Wellness', 'Deck', 'Relaxation', 'Trending'],
    folder: 'cruise-videos',
    width: 2560,
    height: 1440,
    duration: 87.9,
    thumbnailUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200&q=60&auto=format&fit=crop',
  },
];

async function seedVideos() {
  console.log('🎬 Starting video seeding...\n');

  try {
    // Get the first tenant (or create a default one)
    const tenant = await prisma.tenant.findFirst();

    if (!tenant) {
      console.error('❌ No tenant found. Please run the tenant seeder first.');
      process.exit(1);
    }

    console.log(`✅ Using tenant: ${tenant.name} (${tenant.id})\n`);

    // Clear existing videos (optional)
    const deletedCount = await prisma.mediaFile.deleteMany({
      where: {
        category: 'VIDEO',
        tenantId: tenant.id,
      },
    });
    console.log(`🗑️  Deleted ${deletedCount.count} existing videos\n`);

    // Seed new videos
    let successCount = 0;
    for (const video of videos) {
      try {
        const createdVideo = await prisma.mediaFile.create({
          data: {
            ...video,
            tenantId: tenant.id,
          },
        });
        console.log(`✅ Created: ${createdVideo.title}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create ${video.title}:`, error);
      }
    }

    console.log(`\n🎉 Successfully seeded ${successCount}/${videos.length} videos!`);
    console.log(`📊 Total videos in database: ${await prisma.mediaFile.count({ where: { category: 'VIDEO' } })}`);

  } catch (error) {
    console.error('❌ Error during video seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedVideos()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
