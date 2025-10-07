import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tripgo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Default admin already exists');
      return existingAdmin;
    }

    // Get the main tenant
    const mainTenant = await prisma.tenant.findFirst({
      where: { name: 'TripGo Main' }
    });

    if (!mainTenant) {
      throw new Error('Main tenant not found. Please run tenant seeding first.');
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
        tenantId: mainTenant.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    });

    console.log('✅ Default admin created successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('🚨 Please change the password after first login!');

    return admin;
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    throw error;
  }
};

export const seedSampleData = async () => {
  try {
    // Create some sample cruises
    const sampleCruises = [
      {
        name: 'Mediterranean Explorer',
        description: 'Discover the beauty of the Mediterranean with stops in Italy, Greece, and Spain.',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        images: [
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
        ],
        duration: 7,
        capacity: 2000,
        amenities: ['Pool', 'Spa', 'Casino', 'Restaurants', 'Entertainment'],
        departure: 'Barcelona, Spain',
        destination: 'Mediterranean Sea',
        available: true,
        rating: 4.7
      },
      {
        name: 'Alaska Wildlife Expedition',
        description: 'Experience the pristine wilderness of Alaska with glacier views and wildlife spotting.',
        price: 1599,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
        ],
        duration: 8,
        capacity: 1200,
        amenities: ['Observatory Deck', 'Naturalist Guides', 'Heated Pool', 'Library'],
        departure: 'Seattle, WA',
        destination: 'Alaska',
        available: true,
        rating: 4.9
      }
    ];

    // Get the main tenant for assigning cruises
    const mainTenant = await prisma.tenant.findFirst({
      where: { name: 'TripGo Main' }
    });

    if (mainTenant) {
      for (const cruise of sampleCruises) {
        const existing = await prisma.cruise.findFirst({
          where: {
            name: cruise.name,
            tenantId: mainTenant.id
          }
        });

        if (!existing) {
          await prisma.cruise.create({
            data: {
              ...cruise,
              tenantId: mainTenant.id
            }
          });
          console.log(`✅ Created cruise: ${cruise.name}`);
        }
      }
    }

    // Create sample hotels
    const sampleHotels = [
      {
        name: 'Grand Ocean Resort',
        description: 'Luxury beachfront resort with world-class amenities.',
        price: 299,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
        ],
        location: 'Miami Beach, Florida',
        address: '123 Ocean Drive',
        city: 'Miami',
        country: 'USA',
        amenities: ['Beach Access', 'Spa', 'Pool', 'Restaurant', 'Gym'],
        roomTypes: [
          { type: 'Standard Room', price: 299, capacity: 2 },
          { type: 'Ocean View Suite', price: 499, capacity: 4 }
        ],
        available: true,
        rating: 4.6
      }
    ];

    if (mainTenant) {
      for (const hotel of sampleHotels) {
        const existing = await prisma.hotel.findFirst({
          where: {
            name: hotel.name,
            tenantId: mainTenant.id
          }
        });

        if (!existing) {
          await prisma.hotel.create({
            data: {
              ...hotel,
              tenantId: mainTenant.id
            }
          });
          console.log(`✅ Created hotel: ${hotel.name}`);
        }
      }
    }

    console.log('✅ Sample data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
};

// Run the seeding function if this file is executed directly
if (require.main === module) {
  createDefaultAdmin()
    .then(() => seedSampleData())
    .then(() => {
      console.log('🎉 Database seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}