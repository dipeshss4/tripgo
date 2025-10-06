import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create tenants
  const mainTenant = await prisma.tenant.upsert({
    where: { subdomain: 'main' },
    update: {},
    create: {
      name: 'TripGo Main',
      slug: 'tripgo-main',
      domain: 'main.tripgo.local',
      subdomain: 'main',
      status: 'ACTIVE',
      plan: 'PREMIUM',
      settings: {
        theme: 'blue',
        currency: 'USD',
        timezone: 'UTC',
      },
    },
  })

  const cruisesTenant = await prisma.tenant.upsert({
    where: { subdomain: 'cruises' },
    update: {},
    create: {
      name: 'TripGo Cruises',
      slug: 'tripgo-cruises',
      domain: 'cruises.tripgo.local',
      subdomain: 'cruises',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      settings: {
        theme: 'ocean',
        currency: 'USD',
        timezone: 'UTC',
      },
    },
  })

  const hotelsTenant = await prisma.tenant.upsert({
    where: { subdomain: 'hotels' },
    update: {},
    create: {
      name: 'TripGo Hotels',
      slug: 'tripgo-hotels',
      domain: 'hotels.tripgo.local',
      subdomain: 'hotels',
      status: 'ACTIVE',
      plan: 'PREMIUM',
      settings: {
        theme: 'green',
        currency: 'USD',
        timezone: 'UTC',
      },
    },
  })

  console.log('✅ Tenants created')

  // Create admin users for each tenant
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const mainAdmin = await prisma.user.upsert({
    where: { email: 'admin@main.tripgo.com' },
    update: {},
    create: {
      email: 'admin@main.tripgo.com',
      password: hashedPassword,
      firstName: 'Main',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
      tenantId: mainTenant.id,
    },
  })

  const cruisesAdmin = await prisma.user.upsert({
    where: { email: 'admin@cruises.tripgo.com' },
    update: {},
    create: {
      email: 'admin@cruises.tripgo.com',
      password: hashedPassword,
      firstName: 'Cruises',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
      tenantId: cruisesTenant.id,
    },
  })

  const hotelsAdmin = await prisma.user.upsert({
    where: { email: 'admin@hotels.tripgo.com' },
    update: {},
    create: {
      email: 'admin@hotels.tripgo.com',
      password: hashedPassword,
      firstName: 'Hotels',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
      tenantId: hotelsTenant.id,
    },
  })

  // For demonstration, create individual tenant admins that can switch
  // In production, you'd modify the schema to support proper multi-tenant users

  console.log('✅ Admin users created')

  // Create some sample customers
  const customerPassword = await bcrypt.hash('customer123', 10)

  await prisma.user.upsert({
    where: { email: 'john.doe@email.com' },
    update: {},
    create: {
      email: 'john.doe@email.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      isActive: true,
      tenantId: mainTenant.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'jane.smith@email.com' },
    update: {},
    create: {
      email: 'jane.smith@email.com',
      password: customerPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'CUSTOMER',
      isActive: true,
      tenantId: cruisesTenant.id,
    },
  })

  console.log('✅ Sample customers created')

  // Create sample cruises
  await prisma.cruise.upsert({
    where: { id: 'cruise-1' },
    update: {},
    create: {
      id: 'cruise-1',
      name: 'Caribbean Paradise',
      description: 'Explore the beautiful Caribbean islands with luxury amenities.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80'],
      rating: 4.8,
      price: 1299.99,
      duration: 7,
      capacity: 2000,
      available: true,
      amenities: ['Pool', 'Spa', 'Theater', 'Casino', 'Multiple Restaurants'],
      departure: 'Miami, FL',
      destination: 'Caribbean Islands',
      itinerary: {
        days: [
          {
            day: 1,
            port: 'Miami, FL',
            arrival: 'Embarkation',
            departure: '5:00 PM',
            activities: ['Ship Orientation', 'Welcome Dinner'],
          },
          {
            day: 2,
            port: 'Nassau, Bahamas',
            arrival: '8:00 AM',
            departure: '5:00 PM',
            activities: ['Beach Excursion', 'Paradise Island', 'Local Market'],
          },
        ],
      },
      tenantId: cruisesTenant.id,
    },
  })

  await prisma.cruise.upsert({
    where: { id: 'cruise-2' },
    update: {},
    create: {
      id: 'cruise-2',
      name: 'Mediterranean Delight',
      description: 'Discover the charm of Mediterranean coastal cities.',
      image: '/images/cruise-mediterranean.jpg',
      images: ['/images/cruise-med-1.jpg'],
      rating: 4.6,
      price: 1899.99,
      duration: 10,
      capacity: 1500,
      available: true,
      amenities: ['Pool', 'Library', 'Wine Bar', 'Cooking Classes'],
      departure: 'Barcelona, Spain',
      destination: 'Mediterranean Coast',
      itinerary: {
        days: [
          {
            day: 1,
            port: 'Barcelona, Spain',
            arrival: 'Embarkation',
            departure: '7:00 PM',
            activities: ['City Tour', 'Tapas Dinner'],
          },
        ],
      },
      tenantId: cruisesTenant.id,
    },
  })

  console.log('✅ Sample cruises created')

  // Create sample hotels
  await prisma.hotel.upsert({
    where: { id: 'hotel-1' },
    update: {},
    create: {
      id: 'hotel-1',
      name: 'Ocean View Resort',
      description: 'Luxury beachfront resort with stunning ocean views.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'],
      rating: 4.7,
      price: 299.99,
      location: 'Miami Beach',
      address: '1234 Ocean Drive',
      city: 'Miami',
      country: 'USA',
      amenities: ['Beach Access', 'Pool', 'Spa', 'Restaurant', 'Gym'],
      roomTypes: [
        { type: 'Standard Room', capacity: 2, price: 299.99 },
        { type: 'Ocean Suite', capacity: 4, price: 599.99 },
      ],
      available: true,
      tenantId: hotelsTenant.id,
    },
  })

  console.log('✅ Sample hotels created')

  // Create sample packages
  await prisma.package.upsert({
    where: { id: 'package-1' },
    update: {},
    create: {
      id: 'package-1',
      name: 'European Adventure',
      description: 'Complete European tour covering major cities.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'],
      rating: 4.5,
      price: 2999.99,
      duration: 14,
      destinations: ['Paris', 'Rome', 'Barcelona', 'Amsterdam'],
      inclusions: ['Flights', 'Hotels', 'Meals', 'Tours', 'Transportation'],
      exclusions: ['Travel Insurance', 'Personal Expenses', 'Tips'],
      itinerary: {
        days: [
          {
            day: 1,
            city: 'Paris',
            activities: ['Arrival', 'Eiffel Tower', 'Seine River Cruise'],
          },
        ],
      },
      available: true,
      tenantId: mainTenant.id,
    },
  })

  console.log('✅ Sample packages created')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })