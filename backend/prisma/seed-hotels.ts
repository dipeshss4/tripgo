import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏨 Starting hotel seeding...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('❌ No tenant found.');
    return;
  }

  console.log(`✅ Found tenant: ${tenant.name}\n`);

  const hotels = [
    { name: 'Paradise Bay Resort', city: 'Malé', country: 'Maldives', price: 850, rating: 4.9 },
    { name: 'Sunset Beach Resort', city: 'Cancun', country: 'Mexico', price: 420, rating: 4.7 },
    { name: 'Royal Palm Bali', city: 'Seminyak', country: 'Indonesia', price: 380, rating: 4.8 },
    { name: 'Azure Coast Resort', city: 'Nice', country: 'France', price: 650, rating: 4.9 },
    { name: 'Tropical Paradise Resort', city: 'Phuket', country: 'Thailand', price: 320, rating: 4.7 },
    { name: 'Metropolitan Boutique Hotel', city: 'Paris', country: 'France', price: 450, rating: 4.8 },
    { name: 'Urban Loft Hotel', city: 'Brooklyn', country: 'USA', price: 320, rating: 4.6 },
    { name: 'Heritage Boutique Hotel', city: 'Edinburgh', country: 'Scotland', price: 280, rating: 4.7 },
    { name: 'Zen Garden Hotel', city: 'Kyoto', country: 'Japan', price: 420, rating: 4.9 },
    { name: 'Alpine Peak Resort', city: 'Zermatt', country: 'Switzerland', price: 750, rating: 4.9 },
    { name: 'Rocky Mountain Lodge', city: 'Aspen', country: 'USA', price: 580, rating: 4.7 },
    { name: 'Himalayan Heights Resort', city: 'Pokhara', country: 'Nepal', price: 195, rating: 4.6 },
    { name: 'Serengeti Safari Lodge', city: 'Serengeti', country: 'Tanzania', price: 680, rating: 4.8 },
    { name: 'Rainforest Eco Lodge', city: 'Monteverde', country: 'Costa Rica', price: 285, rating: 4.7 },
    { name: 'Outback Wilderness Camp', city: 'Yulara', country: 'Australia', price: 520, rating: 4.8 },
    { name: 'Backpackers Paradise Hostel', city: 'Barcelona', country: 'Spain', price: 35, rating: 4.5 },
    { name: 'Nomad Inn', city: 'Bangkok', country: 'Thailand', price: 45, rating: 4.4 },
    { name: 'Palace Heritage Hotel', city: 'Jaipur', country: 'India', price: 350, rating: 4.8 },
    { name: 'Colonial Manor Hotel', city: 'Cartagena', country: 'Colombia', price: 220, rating: 4.7 },
    { name: 'Executive Business Hotel', city: 'Singapore', country: 'Singapore', price: 280, rating: 4.6 },
    { name: 'City Center Tower Hotel', city: 'Dubai', country: 'UAE', price: 420, rating: 4.8 }
  ];

  let created = 0;
  
  for (const h of hotels) {
    try {
      await prisma.hotel.create({
        data: {
          name: h.name,
          description: `Luxury accommodation in ${h.city}, ${h.country}. Experience world-class service and amenities.`,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
          location: h.city,
          address: `${h.city} Central`,
          city: h.city,
          country: h.country,
          rating: h.rating,
          price: h.price,
          amenities: ['WiFi', 'Pool', 'Restaurant', 'Gym', 'Spa'],
          roomTypes: [{ type: 'Standard', price: h.price }, { type: 'Deluxe', price: h.price * 1.3 }],
          tenantId: tenant.id
        }
      });
      console.log(`✅ Created: ${h.name} (${h.city}, ${h.country}) - $${h.price}/night`);
      created++;
    } catch (error: any) {
      if (!error.message.includes('Unique')) {
        console.error(`❌ ${h.name}: ${error.message}`);
      }
    }
  }

  console.log(`\n✨ Created ${created} hotels!\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
