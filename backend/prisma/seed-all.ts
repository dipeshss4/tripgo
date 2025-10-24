import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 TRIPGO COMPLETE DATA SEEDING');
  console.log('='.repeat(70) + '\n');

  // Check if tenant exists
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('❌ No tenant found. Please run the main seeder first to create a tenant.');
    console.log('\n💡 Run: npx tsx prisma/seed.ts\n');
    process.exit(1);
  }

  console.log(`✅ Tenant found: ${tenant.name}`);
  console.log(`📧 Tenant domain: ${tenant.domain}\n`);

  const seeders = [
    { name: 'Blogs', file: 'seed-blogs.ts', emoji: '📝' },
    { name: 'Cruises', file: 'seed-cruises.ts', emoji: '🚢' },
    { name: 'Hotels', file: 'seed-hotels.ts', emoji: '🏨' },
    { name: 'Travel Packages', file: 'seed-packages.ts', emoji: '🎒' }
  ];

  const results: { name: string; status: 'success' | 'error' | 'skipped'; message?: string }[] = [];

  for (let i = 0; i < seeders.length; i++) {
    const seeder = seeders[i];
    console.log('='.repeat(70));
    console.log(`${seeder.emoji} STEP ${i + 1}/${seeders.length}: Seeding ${seeder.name}`);
    console.log('='.repeat(70) + '\n');

    try {
      execSync(`npx tsx prisma/${seeder.file}`, {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      results.push({ name: seeder.name, status: 'success' });
      console.log(`\n✅ ${seeder.name} seeding completed!\n`);
    } catch (error) {
      console.error(`\n❌ ${seeder.name} seeding failed!\n`);
      results.push({
        name: seeder.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL SEEDING SUMMARY');
  console.log('='.repeat(70) + '\n');

  // Display results
  results.forEach((result) => {
    const emoji = result.status === 'success' ? '✅' : '❌';
    console.log(`${emoji} ${result.name}: ${result.status.toUpperCase()}`);
    if (result.message) {
      console.log(`   └─ ${result.message}`);
    }
  });

  // Database statistics
  console.log('\n' + '-'.repeat(70));
  console.log('📈 DATABASE STATISTICS');
  console.log('-'.repeat(70) + '\n');

  try {
    const [blogsCount, cruisesCount, hotelsCount, packagesCount] = await Promise.all([
      prisma.blog.count({ where: { tenantId: tenant.id } }),
      prisma.cruise.count({ where: { tenantId: tenant.id } }),
      prisma.hotel.count({ where: { tenantId: tenant.id } }),
      prisma.package.count({ where: { tenantId: tenant.id } })
    ]);

    console.log(`📝 Total Blogs: ${blogsCount}`);
    console.log(`🚢 Total Cruises: ${cruisesCount}`);
    console.log(`🏨 Total Hotels: ${hotelsCount}`);
    console.log(`🎒 Total Packages: ${packagesCount}`);
    console.log(`\n📊 GRAND TOTAL: ${blogsCount + cruisesCount + hotelsCount + packagesCount} records\n`);

    // Success/failure summary
    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'error').length;

    console.log('-'.repeat(70));
    if (failureCount === 0) {
      console.log('🎉 ALL SEEDERS COMPLETED SUCCESSFULLY!');
    } else {
      console.log(`⚠️  ${successCount} succeeded, ${failureCount} failed`);
    }
    console.log('-'.repeat(70));

    // Next steps
    console.log('\n💡 NEXT STEPS:\n');
    console.log('1. Verify data in your database');
    console.log('2. Check the admin panel: http://localhost:5173/admin');
    console.log('3. Test the API endpoints:');
    console.log('   - GET http://localhost:4000/api/blog');
    console.log('   - GET http://localhost:4000/api/cruise');
    console.log('   - GET http://localhost:4000/api/hotel');
    console.log('   - GET http://localhost:4000/api/package');
    console.log('\n4. To deploy to production:');
    console.log('   - Copy seeders to server: scp prisma/seed-*.ts root@75.119.151.132:/var/www/tripgo/backend/prisma/');
    console.log('   - SSH to server: ssh root@75.119.151.132');
    console.log('   - Run in Docker: docker exec -it tripgo-backend npx tsx prisma/seed-all.ts');

    console.log('\n' + '='.repeat(70) + '\n');
  } catch (error) {
    console.error('Error generating statistics:', error);
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
