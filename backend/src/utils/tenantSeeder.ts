import { PrismaClient, TenantPlan, TenantStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateTenantToken } from '@/middleware/tenantAuth';

const prisma = new PrismaClient();

export const seedTenants = async () => {
  try {
    console.log('🏢 Seeding tenants...');

    // Define the three tenants
    const tenants = [
      {
        name: 'TripGo Main',
        slug: 'tripgo-main',
        domain: 'tripgo.com',
        subdomain: 'main',
        plan: TenantPlan.ENTERPRISE,
        settings: {
          theme: 'default',
          allowRegistration: true,
          defaultCurrency: 'USD',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        }
      },
      {
        name: 'TripGo Cruises',
        slug: 'tripgo-cruises',
        domain: 'cruises.tripgo.com',
        subdomain: 'cruises',
        plan: TenantPlan.PREMIUM,
        settings: {
          theme: 'cruise',
          allowRegistration: true,
          defaultCurrency: 'USD',
          focusArea: 'cruises',
          primaryColor: '#0EA5E9',
          secondaryColor: '#0284C7'
        }
      },
      {
        name: 'TripGo Hotels',
        slug: 'tripgo-hotels',
        domain: 'hotels.tripgo.com',
        subdomain: 'hotels',
        plan: TenantPlan.PREMIUM,
        settings: {
          theme: 'hotel',
          allowRegistration: true,
          defaultCurrency: 'USD',
          focusArea: 'hotels',
          primaryColor: '#10B981',
          secondaryColor: '#059669'
        }
      }
    ];

    const createdTenants = [];

    for (const tenantData of tenants) {
      // Check if tenant already exists
      const existingTenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { slug: tenantData.slug },
            { domain: tenantData.domain },
            { subdomain: tenantData.subdomain }
          ]
        }
      });

      if (existingTenant) {
        console.log(`✅ Tenant ${tenantData.name} already exists`);
        createdTenants.push(existingTenant);
        continue;
      }

      // Create tenant
      const tenant = await prisma.tenant.create({
        data: tenantData
      });

      console.log(`✅ Created tenant: ${tenant.name} (${tenant.subdomain})`);
      createdTenants.push(tenant);

      // Create admin user for each tenant
      const adminEmail = `admin@${tenant.subdomain}.tripgo.com`;
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

      const existingAdmin = await prisma.user.findFirst({
        where: { email: adminEmail, tenantId: tenant.id }
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        const adminUser = await prisma.user.create({
          data: {
            tenantId: tenant.id,
            email: adminEmail,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.ADMIN,
            isActive: true,
          }
        });

        console.log(`✅ Created admin user for ${tenant.name}: ${adminEmail}`);

        // Seed default site settings for each tenant
        await seedTenantSettings(tenant.id, tenant.name, tenant.slug);

        // Seed sample data for each tenant
        await seedSampleData(tenant.id, tenant.slug);
      }
    }

    return createdTenants;
  } catch (error) {
    console.error('❌ Error seeding tenants:', error);
    throw error;
  }
};

const seedTenantSettings = async (tenantId: string, tenantName: string, tenantSlug: string) => {
  const settings = [
    // Site Information
    { key: 'site_name', value: tenantName, type: 'TEXT', category: 'general', description: 'Site Name' },
    { key: 'site_description', value: `Welcome to ${tenantName} - Your travel companion`, type: 'TEXTAREA', category: 'general', description: 'Site Description' },
    { key: 'site_logo', value: '', type: 'IMAGE', category: 'general', description: 'Site Logo' },

    // Contact Information
    { key: 'contact_email', value: `contact@${tenantSlug}.tripgo.com`, type: 'TEXT', category: 'contact', description: 'Contact Email' },
    { key: 'contact_phone', value: '+1-234-567-8900', type: 'TEXT', category: 'contact', description: 'Contact Phone' },

    // Hero Section
    { key: 'hero_title', value: `Discover Amazing ${tenantSlug === 'cruises' ? 'Cruises' : tenantSlug === 'hotels' ? 'Hotels' : 'Adventures'}`, type: 'TEXT', category: 'hero', description: 'Hero Title' },
    { key: 'hero_subtitle', value: `Book the best ${tenantSlug === 'cruises' ? 'cruise experiences' : tenantSlug === 'hotels' ? 'hotel stays' : 'travel packages'}`, type: 'TEXTAREA', category: 'hero', description: 'Hero Subtitle' },

    // Business Settings
    { key: 'currency', value: 'USD', type: 'TEXT', category: 'business', description: 'Default Currency' },
    { key: 'timezone', value: 'America/New_York', type: 'TEXT', category: 'business', description: 'Default Timezone' },
  ];

  for (const setting of settings) {
    const existing = await prisma.siteSetting.findFirst({
      where: { tenantId, key: setting.key }
    });

    if (!existing) {
      await prisma.siteSetting.create({
        data: {
          tenantId,
          ...setting
        }
      });
    }
  }

  console.log(`✅ Seeded settings for ${tenantName}`);
};

const seedSampleData = async (tenantId: string, tenantSlug: string) => {
  // Seed sample cruises for cruise-focused tenant
  if (tenantSlug === 'tripgo-cruises' || tenantSlug === 'tripgo-main') {
    const cruises = [
      {
        tenantId,
        title: 'Mediterranean Explorer',
        description: 'Discover the beauty of the Mediterranean with stops in Italy, Greece, and Spain.',
        slug: 'mediterranean-explorer',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
        duration: 7,
        type: 'Ocean Cruise',
        capacity: 2000,
        amenities: ['Pool', 'Spa', 'Casino', 'Restaurants'],
        departure: 'Barcelona, Spain',
        destination: 'Mediterranean Sea',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-08'),
        available: true,
        rating: 4.7
      },
      {
        tenantId,
        title: 'Alaska Wildlife Expedition',
        description: 'Experience the pristine wilderness of Alaska with glacier views.',
        slug: 'alaska-wildlife-expedition',
        price: 1599,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
        duration: 8,
        type: 'Expedition',
        capacity: 1200,
        amenities: ['Observatory Deck', 'Naturalist Guides', 'Heated Pool'],
        departure: 'Seattle, WA',
        destination: 'Alaska',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-23'),
        available: true,
        rating: 4.9
      }
    ];

    for (const cruise of cruises) {
      const existing = await prisma.cruise.findFirst({
        where: { tenantId, slug: cruise.slug }
      });

      if (!existing) {
        await prisma.cruise.create({ data: cruise });
      }
    }

    console.log(`✅ Seeded cruises for ${tenantSlug}`);
  }

  // Seed sample hotels for hotel-focused tenant
  if (tenantSlug === 'tripgo-hotels' || tenantSlug === 'tripgo-main') {
    const hotels = [
      {
        tenantId,
        name: 'Grand Ocean Resort',
        description: 'Luxury beachfront resort with world-class amenities.',
        slug: 'grand-ocean-resort',
        pricePerNight: 299,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        address: '123 Ocean Drive',
        city: 'Miami',
        country: 'USA',
        amenities: ['Beach Access', 'Spa', 'Pool', 'Restaurant'],
        roomTypes: [
          { type: 'Standard Room', price: 299, capacity: 2 },
          { type: 'Ocean View Suite', price: 499, capacity: 4 }
        ],
        available: true,
        rating: 4.6
      },
      {
        tenantId,
        name: 'Mountain View Lodge',
        description: 'Cozy mountain retreat with stunning views.',
        slug: 'mountain-view-lodge',
        pricePerNight: 199,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
        address: '456 Mountain Road',
        city: 'Aspen',
        country: 'USA',
        amenities: ['Ski Access', 'Fireplace', 'Hot Tub', 'Restaurant'],
        roomTypes: [
          { type: 'Standard Room', price: 199, capacity: 2 },
          { type: 'Mountain Suite', price: 349, capacity: 4 }
        ],
        available: true,
        rating: 4.4
      }
    ];

    for (const hotel of hotels) {
      const existing = await prisma.hotel.findFirst({
        where: { tenantId, slug: hotel.slug }
      });

      if (!existing) {
        await prisma.hotel.create({ data: hotel });
      }
    }

    console.log(`✅ Seeded hotels for ${tenantSlug}`);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedTenants()
    .then(() => {
      console.log('🎉 Multi-tenant seeding completed!');
      // Only exit if not in Docker container environment
      if (!process.env.DOCKER_CONTAINER) {
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('💥 Multi-tenant seeding failed:', error);
      // Only exit if not in Docker container environment
      if (!process.env.DOCKER_CONTAINER) {
        process.exit(1);
      }
    })
    .finally(() => {
      // Disconnect Prisma client
      prisma.$disconnect();
    });
}