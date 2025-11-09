import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHeroSettings() {
  try {
    console.log('🎬 Starting hero settings seed...\n');

    // Get the first tenant
    const tenant = await prisma.tenant.findFirst();

    if (!tenant) {
      console.error('❌ No tenant found. Please create a tenant first.');
      process.exit(1);
    }

    console.log(`✅ Using tenant: ${tenant.name}\n`);

    const heroSettings = [
      // Home Page Hero
      {
        page: 'home',
        videoUrl: 'https://www.youtube.com/embed/FlsCjmMhFmw', // Ocean/travel video
        videoType: 'url',
        videoPoster: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920',
        videoLoop: true,
        videoAutoplay: true,
        videoMuted: true,
        fallbackImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920',
        overlayOpacity: 0.4,
        overlayColor: '#000000',
        title: 'Discover Your Next Adventure',
        subtitle: 'Explore the world with luxury cruises, ships, and unforgettable travel packages',
        ctaText: 'Start Exploring',
        ctaLink: '/cruises',
        isActive: true,
        displayOrder: 0,
        tenantId: tenant.id
      },

      // Cruises Page Hero
      {
        page: 'cruises',
        videoUrl: 'https://www.youtube.com/embed/JB9ztAHK5x0', // Cruise ship video
        videoType: 'url',
        videoPoster: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920',
        videoLoop: true,
        videoAutoplay: true,
        videoMuted: true,
        fallbackImage: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920',
        overlayOpacity: 0.5,
        overlayColor: '#000033',
        title: 'Luxury Cruise Experiences',
        subtitle: 'Sail away to exotic destinations in ultimate comfort and style',
        ctaText: 'View All Cruises',
        ctaLink: '/cruises',
        isActive: true,
        displayOrder: 1,
        tenantId: tenant.id
      },

      // Ships Page Hero
      {
        page: 'ships',
        videoUrl: 'https://www.youtube.com/embed/YuEy3JzB2g4', // Yacht/ship video
        videoType: 'url',
        videoPoster: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920',
        videoLoop: true,
        videoAutoplay: true,
        videoMuted: true,
        fallbackImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920',
        overlayOpacity: 0.45,
        overlayColor: '#001a33',
        title: 'Explore Our Fleet',
        subtitle: 'From luxury yachts to expedition vessels - find your perfect ship',
        ctaText: 'Browse Ships',
        ctaLink: '/ships',
        isActive: true,
        displayOrder: 2,
        tenantId: tenant.id
      },

      // Hotels Page Hero
      {
        page: 'hotels',
        videoUrl: 'https://www.youtube.com/embed/iGpysoUjkqU', // Luxury hotel video
        videoType: 'url',
        videoPoster: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920',
        videoLoop: true,
        videoAutoplay: true,
        videoMuted: true,
        fallbackImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920',
        overlayOpacity: 0.4,
        overlayColor: '#1a0000',
        title: 'Premium Hotels & Resorts',
        subtitle: 'Stay in the finest accommodations around the world',
        ctaText: 'Find Hotels',
        ctaLink: '/hotels',
        isActive: true,
        displayOrder: 3,
        tenantId: tenant.id
      },

      // Packages Page Hero
      {
        page: 'packages',
        videoUrl: 'https://www.youtube.com/embed/M4rzyIIrLAc', // Travel montage video
        videoType: 'url',
        videoPoster: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920',
        videoLoop: true,
        videoAutoplay: true,
        videoMuted: true,
        fallbackImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920',
        overlayOpacity: 0.5,
        overlayColor: '#000000',
        title: 'Complete Travel Packages',
        subtitle: 'All-inclusive packages combining cruises, accommodations, and experiences',
        ctaText: 'Explore Packages',
        ctaLink: '/packages',
        isActive: true,
        displayOrder: 4,
        tenantId: tenant.id
      }
    ];

    console.log('📝 Creating hero settings...\n');

    for (const heroData of heroSettings) {
      await prisma.heroSettings.upsert({
        where: { page: heroData.page },
        update: heroData,
        create: heroData
      });
      console.log(`✅ Created/updated hero settings for: ${heroData.page}`);
    }

    console.log('\n🎉 HERO SETTINGS SEED COMPLETED!\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`🎬 Hero Pages: ${heroSettings.length}`);
    console.log('═══════════════════════════════════════\n');

    console.log('📋 Pages with Hero Settings:');
    heroSettings.forEach((hero, index) => {
      console.log(`   ${index + 1}. ${hero.page.toUpperCase()} - "${hero.title}"`);
    });

    console.log('\n✅ Hero settings seeded successfully!');
    console.log('🌐 API endpoints:');
    console.log('   - GET /api/hero/home');
    console.log('   - GET /api/hero/cruises');
    console.log('   - GET /api/hero/ships');
    console.log('   - GET /api/hero/hotels');
    console.log('   - GET /api/hero/packages\n');

  } catch (error) {
    console.error('❌ Error seeding hero settings:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedHeroSettings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
