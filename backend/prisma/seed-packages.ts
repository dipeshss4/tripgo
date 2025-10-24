import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎒 Starting package seeding...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('❌ No tenant found.');
    return;
  }

  console.log(`✅ Found tenant: ${tenant.name}\n`);

  const packages = [
    { name: 'Grand European Explorer', destinations: ['Paris', 'Amsterdam', 'Berlin', 'Prague', 'Vienna', 'Rome'], duration: 15, price: 3299, rating: 4.8 },
    { name: 'Mediterranean Coastal Escape', destinations: ['Barcelona', 'Nice', 'Amalfi Coast', 'Santorini'], duration: 12, price: 4599, rating: 4.9 },
    { name: 'Scandinavian Adventure', destinations: ['Copenhagen', 'Stockholm', 'Oslo', 'Bergen'], duration: 10, price: 3799, rating: 4.7 },
    { name: 'British Isles Heritage Tour', destinations: ['London', 'Edinburgh', 'Scottish Highlands', 'Dublin'], duration: 14, price: 3899, rating: 4.8 },
    { name: 'Eastern Europe Discovery', destinations: ['Budapest', 'Krakow', 'Prague', 'Vienna'], duration: 11, price: 2799, rating: 4.7 },
    { name: 'Southeast Asia Highlights', destinations: ['Bangkok', 'Hanoi', 'Siem Reap', 'Singapore'], duration: 16, price: 2999, rating: 4.9 },
    { name: 'Japan Cultural Journey', destinations: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'], duration: 12, price: 4299, rating: 4.9 },
    { name: 'India Golden Triangle', destinations: ['Delhi', 'Agra', 'Jaipur'], duration: 8, price: 1799, rating: 4.8 },
    { name: 'Bali & Indonesia Paradise', destinations: ['Bali', 'Gili Islands', 'Yogyakarta'], duration: 14, price: 2599, rating: 4.8 },
    { name: 'Sri Lanka Complete Tour', destinations: ['Colombo', 'Kandy', 'Nuwara Eliya', 'Yala', 'Galle'], duration: 10, price: 2199, rating: 4.7 },
    { name: 'Peru Adventure', destinations: ['Lima', 'Cusco', 'Machu Picchu', 'Amazon'], duration: 12, price: 3499, rating: 4.9 },
    { name: 'Patagonia Explorer', destinations: ['Torres del Paine', 'El Calafate', 'Ushuaia'], duration: 10, price: 4199, rating: 4.8 },
    { name: 'Brazil Highlights Tour', destinations: ['Rio de Janeiro', 'Iguazu Falls', 'Amazon', 'Salvador'], duration: 14, price: 3799, rating: 4.7 },
    { name: 'Ecuador & Galapagos', destinations: ['Quito', 'Amazon', 'Galapagos Islands'], duration: 12, price: 5299, rating: 4.9 },
    { name: 'East African Safari', destinations: ['Nairobi', 'Masai Mara', 'Serengeti', 'Ngorongoro'], duration: 10, price: 4899, rating: 4.9 },
    { name: 'South Africa Grand Tour', destinations: ['Cape Town', 'Garden Route', 'Kruger', 'Winelands'], duration: 14, price: 4299, rating: 4.8 },
    { name: 'Morocco Imperial Cities', destinations: ['Marrakech', 'Fes', 'Sahara', 'Casablanca'], duration: 10, price: 2499, rating: 4.7 },
    { name: 'Australia & New Zealand', destinations: ['Sydney', 'Cairns', 'Melbourne', 'Queenstown', 'Milford Sound'], duration: 18, price: 5999, rating: 4.9 },
    { name: 'South Pacific Paradise', destinations: ['Fiji', 'Bora Bora', 'Cook Islands'], duration: 14, price: 6299, rating: 4.9 },
    { name: 'Antarctica Expedition', destinations: ['Ushuaia', 'Drake Passage', 'Antarctic Peninsula'], duration: 12, price: 8999, rating: 5.0 }
  ];

  let created = 0;

  for (const pkg of packages) {
    try {
      await prisma.package.create({
        data: {
          name: pkg.name,
          description: `Experience amazing destinations including ${pkg.destinations[0]}. ${pkg.duration}-day adventure with expert guides, accommodation, and unforgettable memories.`,
          image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
          images: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'],
          destinations: pkg.destinations,
          duration: pkg.duration,
          price: pkg.price,
          rating: pkg.rating,
          inclusions: ['Accommodation', 'Daily breakfast', 'Guided tours', 'Transportation', 'Entry fees'],
          exclusions: ['International flights', 'Travel insurance', 'Personal expenses', 'Visa fees'],
          itinerary: { days: pkg.duration, highlights: pkg.destinations },
          tenantId: tenant.id
        }
      });
      console.log(`✅ Created: ${pkg.name} (${pkg.duration} days, $${pkg.price})`);
      created++;
    } catch (error: any) {
      if (!error.message.includes('Unique')) {
        console.error(`❌ ${pkg.name}: ${error.message}`);
      }
    }
  }

  console.log(`\n✨ Created ${created} packages!\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
