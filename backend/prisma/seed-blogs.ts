import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const blogPosts = [
  // CRUISE POSTS
  {
    title: "Top 10 Caribbean Cruise Destinations for 2025",
    slug: "top-10-caribbean-cruise-destinations-2025",
    excerpt: "Discover the most breathtaking islands and ports of call in the Caribbean that you absolutely must visit on your next cruise adventure.",
    content: "The Caribbean remains one of the world's most popular cruise destinations, and for good reason. With crystal-clear waters, pristine beaches, and vibrant cultures, these islands offer unforgettable experiences.\n\n1. **St. Lucia** - Famous for its iconic Pitons and lush rainforests\n2. **Grand Cayman** - Home to Seven Mile Beach and world-class diving\n3. **Cozumel, Mexico** - Ancient Mayan ruins and stunning coral reefs\n4. **Aruba** - Perfect weather and pristine beaches\n5. **Barbados** - Rich history and beautiful coastlines\n6. **St. Thomas** - Duty-free shopping and Magens Bay\n7. **Jamaica** - Reggae culture and Dunn's River Falls\n8. **Bahamas** - Swimming with pigs and blue holes\n9. **Antigua** - 365 beaches, one for each day\n10. **Puerto Rico** - Colonial architecture and El Yunque rainforest\n\nEach destination offers unique excursions, from snorkeling in vibrant coral reefs to exploring historic forts and sampling local cuisine.",
    category: "Cruise Destinations",
    tags: ["caribbean", "cruise", "destinations", "islands", "travel"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
  },
  {
    title: "Mediterranean Cruise Guide: Barcelona to Athens",
    slug: "mediterranean-cruise-guide-barcelona-to-athens",
    excerpt: "Explore ancient civilizations, stunning coastlines, and world-class cuisine on the perfect Mediterranean cruise itinerary.",
    content: "A Mediterranean cruise offers an incredible journey through history, culture, and natural beauty. This classic route from Barcelona to Athens covers some of Europe's most iconic destinations.\n\n**Barcelona, Spain** - Start your journey in this vibrant Catalan city. Visit La Sagrada Familia, stroll Las Ramblas, and enjoy authentic tapas.\n\n**French Riviera** - Experience the glamour of Monaco and Nice. Walk the Promenade des Anglais and visit charming hilltop villages.\n\n**Rome, Italy** - Explore the Colosseum, Vatican City, and Trevi Fountain in the Eternal City.\n\n**Santorini, Greece** - White-washed buildings and blue domes create perfect photo backdrops. Watch the sunset in Oia.\n\n**Athens, Greece** - End your journey at the Acropolis, explore Plaka neighborhood, and discover Greek history.",
    category: "Cruise Destinations",
    tags: ["mediterranean", "cruise", "europe", "greece", "italy", "spain"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800"
  },
  {
    title: "Alaska Cruise: Ultimate Wildlife and Scenic Adventure",
    slug: "alaska-cruise-ultimate-wildlife-scenic-adventure",
    excerpt: "Experience the raw beauty of America's last frontier with glaciers, wildlife, and breathtaking landscapes.",
    content: "An Alaska cruise offers one of the most spectacular voyages in the world, combining wildlife viewing, glacier exploration, and stunning natural scenery.\n\n**Best Time:** May through September, with each month offering unique advantages.\n\n**Popular Stops:**\n- **Juneau** - Visit Mendenhall Glacier and go whale watching\n- **Ketchikan** - Discover Creek Street and watch salmon\n- **Skagway** - Ride the White Pass Railroad\n- **Glacier Bay** - See calving glaciers and spot whales\n\n**Wildlife:** Humpback whales, orcas, bald eagles, bears, sea otters, and more.\n\n**What to Pack:** Layers, waterproof jacket, binoculars, good walking shoes, camera with zoom lens.",
    category: "Cruise Destinations",
    tags: ["alaska", "cruise", "wildlife", "glaciers", "adventure", "nature"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1517639493569-5666a7556f5c?w=800"
  },
  {
    title: "River Cruises vs Ocean Cruises: Complete Comparison",
    slug: "river-cruises-vs-ocean-cruises-comparison",
    excerpt: "Compare river and ocean cruising to discover which type of cruise vacation best matches your travel style.",
    content: "Choosing between a river cruise and an ocean cruise depends on your preferences:\n\n**River Cruises:**\n- Intimate experience (100-200 passengers)\n- Dock in city centers\n- All-inclusive pricing\n- Cultural immersion\n- Minimal motion\n- Popular routes: Danube, Rhine, Seine, Nile\n\n**Ocean Cruises:**\n- More variety in entertainment\n- Multiple dining options\n- Larger facilities\n- Better for families\n- Exotic destinations\n- Popular routes: Caribbean, Mediterranean, Alaska\n\n**Choose River If:** You prioritize destinations, prefer smaller ships, want all-inclusive convenience.\n\n**Choose Ocean If:** You want resort-style amenities, traveling with kids, prefer tropical islands.",
    category: "Cruise Destinations",
    tags: ["river-cruise", "ocean-cruise", "comparison", "travel-planning"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
  },
  {
    title: "Luxury Cruise Lines: Ultimate Guide to Premium Sailing",
    slug: "luxury-cruise-lines-ultimate-guide",
    excerpt: "Discover the world's finest cruise lines offering unparalleled service, gourmet dining, and exclusive experiences.",
    content: "Luxury cruising elevates travel to an art form with exceptional service, fine dining, and curated experiences.\n\n**Top Luxury Cruise Lines:**\n\n**Regent Seven Seas** - All-inclusive luxury with spacious suites and unlimited shore excursions.\n\n**Seabourn** - Intimate ships with personal service and Michelin-inspired cuisine.\n\n**Crystal Cruises** - Award-winning service with Broadway-style entertainment.\n\n**Silversea** - Ultra-luxury with butler service in every suite.\n\n**What to Expect:**\n- Suite accommodations\n- Personalized service\n- Gourmet dining\n- Included beverages and gratuities\n- Enrichment programs\n- Exclusive shore excursions\n- Spa and wellness facilities\n\n**Investment:** While premium prices, the all-inclusive nature often provides better value than adding extras on mainstream lines.",
    category: "Cruise Destinations",
    tags: ["luxury-cruise", "premium", "high-end", "travel", "vacation"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1583149577728-9297b8dc95f2?w=800"
  },

  // HOTEL POSTS
  {
    title: "Luxury Hotel Trends: What to Expect in 2025",
    slug: "luxury-hotel-trends-2025",
    excerpt: "The hospitality industry is evolving rapidly. Discover the latest trends shaping luxury hotels worldwide.",
    content: "The luxury hotel industry is constantly innovating to meet modern traveler demands.\n\n**Top Trends for 2025:**\n\n**1. Sustainable Luxury** - Eco-friendly without sacrificing comfort: solar power, water conservation, organic amenities, zero-waste initiatives.\n\n**2. Wellness-Focused** - Holistic wellness is central: on-site nutritionists, meditation programs, sleep optimization, advanced spa treatments.\n\n**3. Technology Integration** - Contactless check-in, AI personalization, voice-activated controls, virtual concierge.\n\n**4. Experiential Travel** - Unique local experiences: private cooking classes, cultural tours, adventure activities.\n\n**5. Flexible Spaces** - Workation packages, private dining, outdoor events, extended stays.\n\n**6. Hyper-Personalization** - AI-driven preferences, customized settings, tailored recommendations.",
    category: "Hotels & Accommodation",
    tags: ["luxury-hotels", "trends", "hospitality", "wellness", "sustainability"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
  },
  {
    title: "Best Boutique Hotels in Europe: Hidden Gems",
    slug: "best-boutique-hotels-europe-hidden-gems",
    excerpt: "Skip the chain hotels and discover unique boutique properties that offer character, charm, and unforgettable stays.",
    content: "Europe is home to some of the world's most charming boutique hotels.\n\n**Top Picks:**\n\n**Paris - Hôtel Providence** - Intimate hotel in the trendy 10th arrondissement with eclectic décor and cozy bar.\n\n**Lisbon - The Lumiares Hotel** - Restored 18th-century palace in Bairro Alto with rooftop terrace.\n\n**Copenhagen - Hotel Sanders** - Luxurious Scandinavian design near the waterfront.\n\n**Barcelona - Cotton House Hotel** - Former textile headquarters blending history with contemporary design.\n\n**Rome - The First Dolce** - Boutique luxury near Via Veneto with personalized service.\n\n**Amsterdam - Pulitzer Amsterdam** - 25 canal houses combined with art-filled interiors.\n\n**What Makes Great Boutique Hotels:** Unique design, personalized service, local art integration, under 100 rooms, central locations.",
    category: "Hotels & Accommodation",
    tags: ["boutique-hotels", "europe", "luxury", "unique-stays"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
  },
  {
    title: "Eco-Friendly Hotels: Sustainable Luxury Around the World",
    slug: "eco-friendly-hotels-sustainable-luxury",
    excerpt: "Experience guilt-free luxury at these environmentally conscious hotels leading the green hospitality revolution.",
    content: "Sustainable travel doesn't mean sacrificing comfort. These eco-friendly hotels prove luxury and environmental responsibility go hand in hand.\n\n**Leading Eco-Hotels:**\n\n**Whitepod, Switzerland** - Geodesic pods with minimal environmental impact in the Swiss Alps.\n\n**Soneva Fushi, Maldives** - Solar-powered luxury with organic gardens and coral regeneration.\n\n**Campi ya Kanzi, Kenya** - Community-owned eco-lodge supporting Maasai culture and wildlife.\n\n**Tierra Patagonia, Chile** - Energy-efficient design with carbon offset programs.\n\n**Sustainable Features:**\n- Renewable energy sources\n- Water conservation systems\n- Organic, locally-sourced food\n- Plastic-free initiatives\n- Wildlife conservation programs\n- Community support\n- Green certifications\n\n**Why Choose Eco-Hotels:** Reduce environmental impact while enjoying luxury, support local communities, inspire sustainable practices.",
    category: "Hotels & Accommodation",
    tags: ["eco-hotels", "sustainable", "green-travel", "luxury", "environment"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"
  },
  {
    title: "Beach Resorts: Top All-Inclusive Destinations 2025",
    slug: "beach-resorts-top-all-inclusive-2025",
    excerpt: "Unwind at the world's best all-inclusive beach resorts where everything is taken care of for the perfect vacation.",
    content: "All-inclusive beach resorts offer the ultimate stress-free vacation experience.\n\n**Top All-Inclusive Beach Resorts:**\n\n**Jade Mountain, St. Lucia** - Infinity pool sanctuaries with Piton views. Gourmet dining and spa included.\n\n**Excellence Playa Mujeres, Mexico** - Adults-only luxury on pristine Caribbean beach.\n\n**Club Med Finolhu Villas, Maldives** - Overwater villas with diving and water sports included.\n\n**Sandals Royal Caribbean, Jamaica** - Couples-only with private island and offshore bar.\n\n**Beaches Turks & Caicos** - Family-friendly with water park and kids' programs.\n\n**What's Included:**\n- Unlimited food and beverages\n- Water sports and activities\n- Entertainment and shows\n- Fitness classes\n- Kids clubs (family resorts)\n- Airport transfers\n\n**Benefits:** Budget certainty, no wallet needed, variety of activities, perfect for families.",
    category: "Hotels & Accommodation",
    tags: ["beach-resorts", "all-inclusive", "vacation", "luxury", "family-travel"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
  },
  {
    title: "City Hotels: Best Urban Accommodations for Business and Leisure",
    slug: "city-hotels-best-urban-accommodations",
    excerpt: "From rooftop bars to meeting rooms, discover hotels that perfectly balance business needs with leisure amenities.",
    content: "Urban hotels cater to both business travelers and city explorers seeking comfort and convenience.\n\n**Top City Hotels by Destination:**\n\n**New York - The Plaza** - Iconic luxury on Fifth Avenue with Central Park views.\n\n**London - The Savoy** - Historic Thames-side luxury with afternoon tea tradition.\n\n**Tokyo - Aman Tokyo** - Minimalist zen in the heart of the financial district.\n\n**Dubai - Burj Al Arab** - Sail-shaped ultra-luxury with helicopter landing pad.\n\n**Paris - Le Bristol** - Palace hotel near Champs-Élysées with 3-Michelin-star dining.\n\n**What Business Travelers Need:**\n- Fast WiFi\n- Business centers\n- Meeting rooms\n- 24-hour services\n- Airport shuttles\n- Fitness facilities\n\n**Leisure Amenities:**\n- Rooftop bars\n- Spa services\n- Concierge recommendations\n- Central locations\n- Cultural programs",
    category: "Hotels & Accommodation",
    tags: ["city-hotels", "urban", "business-travel", "luxury", "metropolitan"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
  },

  // TRAVEL & TOURS POSTS
  {
    title: "Budget Travel: Explore the World Without Breaking the Bank",
    slug: "budget-travel-explore-world-without-breaking-bank",
    excerpt: "Traveling doesn't have to be expensive. Learn proven strategies to see the world on a budget.",
    content: "Dream of traveling the world but worried about costs? Here's how to make it happen on any budget.\n\n**Accommodation Hacks:**\n- Hostels with private rooms\n- House-sitting or home exchanges\n- Book apartments for longer stays\n- Free breakfast hotels\n\n**Transportation Savings:**\n- Book flights 6-8 weeks in advance\n- Use budget airlines\n- Travel during shoulder season\n- Walk or bike instead of taxis\n\n**Food & Dining:**\n- Shop at local markets\n- Cook some meals\n- Eat where locals eat\n- Try street food\n\n**Best Budget Destinations:**\n- Southeast Asia (Thailand, Vietnam)\n- Eastern Europe (Poland, Hungary)\n- Central America (Guatemala, Nicaragua)\n- India\n- Portugal\n\n**Money-Saving Tips:** Travel to countries with favorable exchange rates, use no-fee credit cards, withdraw larger amounts, book packages, travel in groups.",
    category: "Travel & Tours",
    tags: ["budget-travel", "tips", "backpacking", "money-saving", "adventure"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
  },
  {
    title: "Solo Travel Safety: Complete Guide for Independent Travelers",
    slug: "solo-travel-safety-complete-guide",
    excerpt: "Traveling alone can be rewarding. Here's how to stay safe and confident while exploring solo.",
    content: "Solo travel offers unparalleled freedom, but safety should always be a priority.\n\n**Before You Go:**\n- Research destination safety\n- Know local customs and laws\n- Identify safe neighborhoods\n- Learn basic phrases\n- Share itinerary with contacts\n\n**While Traveling:**\n- Stay aware of surroundings\n- Use official taxis/ride-sharing\n- Keep valuables secure\n- Trust your instincts\n- Meet people in public places\n\n**Best Solo Destinations:**\n- Japan - Safe, efficient, welcoming\n- New Zealand - Adventure and safety\n- Iceland - Low crime, stunning nature\n- Singapore - Clean, safe, organized\n- Portugal - Affordable and safe\n\n**Emergency Preparedness:**\n- Save local emergency numbers\n- Keep embassy contacts\n- Have 24/7 insurance hotline\n- Backup communication methods\n\n**Benefits:** Personal growth, freedom, easier to meet locals, self-discovery.",
    category: "Travel & Tours",
    tags: ["solo-travel", "safety", "tips", "independent", "adventure"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800"
  },
  {
    title: "Digital Nomad Guide: Best Cities for Remote Work 2025",
    slug: "digital-nomad-guide-best-cities-remote-work-2025",
    excerpt: "Discover top destinations offering the perfect blend of work infrastructure, lifestyle, and adventure.",
    content: "The digital nomad lifestyle continues to grow. Here are the best cities for remote workers.\n\n**Top Digital Nomad Cities:**\n\n**Lisbon, Portugal** - Excellent internet, affordable, vibrant expat community. Monthly cost: $1,500-2,500\n\n**Bali, Indonesia** - Tropical paradise, very affordable, strong nomad community. Monthly cost: $1,000-1,800\n\n**Mexico City, Mexico** - Great culture, food scene, similar US time zones. Monthly cost: $1,200-2,000\n\n**Chiang Mai, Thailand** - Low cost, established hub, excellent food. Monthly cost: $800-1,500\n\n**Medellín, Colombia** - Perfect weather, affordable, growing tech scene. Monthly cost: $1,000-1,800\n\n**Essential Considerations:**\n- Internet speed (minimum 25 Mbps)\n- Time zone overlap\n- Cost breakdown\n- Community presence\n- Visa requirements\n\n**Success Tips:** Start with shorter stays, research visas, get travel insurance, maintain work-life balance, build connections.",
    category: "Travel & Tours",
    tags: ["digital-nomad", "remote-work", "work-travel", "lifestyle"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800"
  },
  {
    title: "Essential Travel Packing Guide: Never Forget Anything Again",
    slug: "essential-travel-packing-guide",
    excerpt: "Master the art of packing with our comprehensive checklist covering every type of trip and destination.",
    content: "Packing efficiently is an art. Here's your ultimate guide to packing smart for any trip.\n\n**Universal Essentials:**\n- Passport and travel documents\n- Credit cards and cash\n- Phone and chargers\n- Medications and prescriptions\n- Travel insurance documents\n- Copies of important documents\n\n**Clothing Basics:**\n- Versatile mix-and-match pieces\n- Layers for temperature changes\n- Comfortable walking shoes\n- One dressy outfit\n- Underwear and socks\n- Swimwear (if applicable)\n\n**Toiletries:**\n- TSA-compliant containers\n- Toothbrush and toothpaste\n- Sunscreen\n- Personal hygiene items\n- Prescription medications\n- First-aid kit basics\n\n**Tech & Entertainment:**\n- Phone charger and power bank\n- Universal adapter\n- Headphones\n- E-reader or book\n- Camera (optional)\n\n**Packing Tips:**\n- Roll clothes to save space\n- Use packing cubes\n- Wear bulkiest items on travel day\n- Check airline baggage limits\n- Leave room for souvenirs\n\n**Climate-Specific:** Beach (swimwear, sunhat), Snow (layers, boots), City (comfortable shoes, day bag), Adventure (hiking gear, sturdy footwear).",
    category: "Travel & Tours",
    tags: ["packing", "travel-tips", "preparation", "checklist"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800"
  },
  {
    title: "Adventure Travel: Thrilling Destinations for Adrenaline Junkies",
    slug: "adventure-travel-thrilling-destinations-adrenaline",
    excerpt: "Push your limits and create unforgettable memories at these action-packed adventure destinations.",
    content: "For those seeking adrenaline-pumping experiences, these destinations deliver unforgettable adventures.\n\n**Top Adventure Destinations:**\n\n**New Zealand** - Bungee jumping birthplace, skydiving, skiing, hiking.\nActivities: Queenstown adventures, Milford Sound kayaking, glacier hiking.\n\n**Costa Rica** - Zip-lining, surfing, volcano hiking, white-water rafting.\nActivities: Arenal adventures, Manuel Antonio wildlife, Pacific coast surfing.\n\n**Nepal** - Everest trekking, paragliding, mountain biking.\nActivities: Annapurna Circuit, Pokhara paragliding, Kathmandu culture.\n\n**Iceland** - Glacier hiking, volcano tours, ice caving, snorkeling.\nActivities: Golden Circle, South Coast adventures, Northern Lights.\n\n**Peru** - Machu Picchu treks, sandboarding, Amazon expeditions.\nActivities: Inca Trail, Colca Canyon, Sacred Valley.\n\n**Adventure Activities:**\n- Mountain climbing and trekking\n- Water sports (diving, surfing, rafting)\n- Extreme sports (skydiving, bungee)\n- Wildlife safaris\n- Desert adventures\n\n**Safety First:** Always use certified operators, get proper insurance, know your limits, prepare physically, follow local guidelines.",
    category: "Travel & Tours",
    tags: ["adventure-travel", "extreme-sports", "adrenaline", "outdoors"],
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
  }
];

async function main() {
  console.log('🌱 Starting blog posts seeding...');

  // Get the first admin user for authorId and tenantId
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    throw new Error('No admin user found. Please create an admin user first.');
  }

  console.log(`✅ Found admin user: ${admin.email}`);
  console.log(`📝 Creating ${blogPosts.length} blog posts...`);

  for (const post of blogPosts) {
    try {
      const created = await prisma.blog.create({
        data: {
          ...post,
          authorId: admin.id,
          tenantId: admin.tenantId,
          publishedAt: post.published ? new Date() : null
        }
      });
      console.log(`✅ Created: "${created.title}" (${created.category})`);
    } catch (error: any) {
      console.error(`❌ Error creating "${post.title}":`, error.message);
    }
  }

  console.log('\n📊 Seeding Summary:');
  const total = await prisma.blog.count();
  const published = await prisma.blog.count({ where: { published: true } });
  console.log(`Total blogs in database: ${total}`);
  console.log(`Published blogs: ${published}`);

  const byCategory = await prisma.blog.groupBy({
    by: ['category'],
    _count: true
  });

  console.log('\n📂 Blogs by category:');
  byCategory.forEach(cat => {
    console.log(`  ${cat.category}: ${cat._count} posts`);
  });

  console.log('\n✨ Blog seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
