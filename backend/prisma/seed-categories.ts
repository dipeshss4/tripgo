import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding cruise categories and departures...');

  // Get the first tenant for seeding
  const tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    console.error('❌ No tenant found. Please create a tenant first.');
    return;
  }

  console.log(`✓ Using tenant: ${tenant.name} (${tenant.id})`);

  // Create Categories
  const categories = await Promise.all([
    prisma.cruiseCategory.upsert({
      where: { slug: 'australian-cruises' },
      update: {},
      create: {
        name: 'Australian Cruises',
        slug: 'australian-cruises',
        description: 'Explore the stunning coastlines and vibrant cities of Australia',
        icon: '🦘',
        displayOrder: 1,
        isActive: true,
        tenantId: tenant.id,
      },
    }),
    prisma.cruiseCategory.upsert({
      where: { slug: 'caribbean-adventures' },
      update: {},
      create: {
        name: 'Caribbean Adventures',
        slug: 'caribbean-adventures',
        description: 'Discover tropical paradise in the Caribbean islands',
        icon: '🏝️',
        displayOrder: 2,
        isActive: true,
        tenantId: tenant.id,
      },
    }),
    prisma.cruiseCategory.upsert({
      where: { slug: 'mediterranean-delights' },
      update: {},
      create: {
        name: 'Mediterranean Delights',
        slug: 'mediterranean-delights',
        description: 'Experience the rich culture and history of the Mediterranean',
        icon: '🍝',
        displayOrder: 3,
        isActive: true,
        tenantId: tenant.id,
      },
    }),
    prisma.cruiseCategory.upsert({
      where: { slug: 'alaska-wilderness' },
      update: {},
      create: {
        name: 'Alaska Wilderness',
        slug: 'alaska-wilderness',
        description: 'Marvel at glaciers and wildlife in the Last Frontier',
        icon: '❄️',
        displayOrder: 4,
        isActive: true,
        tenantId: tenant.id,
      },
    }),
    prisma.cruiseCategory.upsert({
      where: { slug: 'asian-escapes' },
      update: {},
      create: {
        name: 'Asian Escapes',
        slug: 'asian-escapes',
        description: 'Journey through exotic destinations across Asia',
        icon: '🌸',
        displayOrder: 5,
        isActive: true,
        tenantId: tenant.id,
      },
    }),
  ]);

  console.log(`✓ Created ${categories.length} cruise categories`);

  // Get all cruises to add categories and departures
  const cruises = await prisma.cruise.findMany({
    where: { tenantId: tenant.id },
    take: 10,
  });

  if (cruises.length === 0) {
    console.log('⚠ No cruises found to update. Create cruises first.');
    return;
  }

  console.log(`✓ Found ${cruises.length} cruises to update`);

  // Assign cruises to categories in round-robin fashion
  for (let i = 0; i < cruises.length; i++) {
    const cruise = cruises[i];
    if (!cruise) continue;

    const category = categories[i % categories.length];
    if (!category) continue;

    await prisma.cruise.update({
      where: { id: cruise.id },
      data: { categoryId: category.id },
    });

    console.log(`✓ Assigned "${cruise.name}" to category "${category.name}"`);

    // Create multiple departures for each cruise
    const currentDate = new Date();
    const departures = [];

    // Create 6 departures over the next 6 months
    for (let monthOffset = 1; monthOffset <= 6; monthOffset++) {
      const departureDate = new Date(currentDate);
      departureDate.setMonth(departureDate.getMonth() + monthOffset);
      departureDate.setDate(15); // Depart on 15th of each month
      departureDate.setHours(10, 0, 0, 0);

      const returnDate = new Date(departureDate);
      returnDate.setDate(returnDate.getDate() + (cruise.duration || 7));
      returnDate.setHours(16, 0, 0, 0);

      // Determine price modifier based on month (peak/off-peak)
      let priceModifier = 1.0;
      const month = departureDate.getMonth();

      // Peak season (June-August, December-January): +20-30%
      if (month >= 5 && month <= 7) {
        priceModifier = 1.2 + (Math.random() * 0.1);
      } else if (month === 11 || month === 0) {
        priceModifier = 1.3;
      }
      // Shoulder season (April-May, September-October): base or +10%
      else if ([3, 4, 8, 9].includes(month)) {
        priceModifier = 1.0 + (Math.random() * 0.1);
      }
      // Off-peak (February-March, November): -10 to -20%
      else {
        priceModifier = 0.8 + (Math.random() * 0.1);
      }

      // Random availability (50-100% of capacity)
      const availableSeats = Math.floor(cruise.capacity * (0.5 + Math.random() * 0.5));

      // Determine status based on availability
      let status: 'AVAILABLE' | 'FILLING_FAST' | 'SOLD_OUT' = 'AVAILABLE';
      const percentageFull = ((cruise.capacity - availableSeats) / cruise.capacity) * 100;

      if (availableSeats === 0) {
        status = 'SOLD_OUT';
      } else if (percentageFull >= 90) {
        status = 'FILLING_FAST';
      }

      departures.push({
        cruiseId: cruise.id,
        departureDate,
        returnDate,
        availableSeats,
        priceModifier: parseFloat(priceModifier.toFixed(2)),
        status,
        notes: monthOffset === 1 ? 'Early bird special' : monthOffset === 6 ? 'Summer sailing' : null,
      });
    }

    // Bulk create departures
    const created = await prisma.cruiseDeparture.createMany({
      data: departures,
      skipDuplicates: true,
    });

    console.log(`  ✓ Created ${created.count} departures for "${cruise.name}"`);
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Categories created: ${categories.length}`);
  console.log(`  - Cruises updated: ${cruises.length}`);
  console.log(`  - Departures per cruise: 6`);
  console.log(`  - Total departures: ${cruises.length * 6}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });