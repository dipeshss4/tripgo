import { PrismaClient, UserRole, BookingStatus, EmployeeStatus, AttendanceStatus, LeaveStatus, PayrollStatus, SettingType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdminData() {
  console.log('🌱 Starting comprehensive admin data seeding...');

  try {
    // Get default tenant
    const defaultTenant = await prisma.tenant.findFirst({
      where: { slug: 'tripgo-dev' }
    });

    if (!defaultTenant) {
      console.error('❌ Default tenant not found');
      return;
    }

    // 1. SEED CRUISES WITH IMAGES AND DETAILS
    console.log('🚢 Seeding cruise data...');
    const cruises = [
      {
        id: 'cruise-royal-caribbean',
        name: 'Royal Caribbean Adventure',
        description: 'Experience the ultimate luxury cruise through the stunning Caribbean waters. Visit exotic islands, enjoy world-class dining, and relax in our premium spa facilities.',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        images: [
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
          'https://images.unsplash.com/photo-1544737151672-6e4e999de2a1?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
        ],
        rating: 4.9,
        price: 2599.99,
        duration: 14,
        capacity: 3500,
        available: true,
        itinerary: {
          days: [
            { day: 1, port: 'Miami, FL', arrival: 'Embarkation', departure: '6:00 PM', activities: ['Welcome Aboard', 'Safety Drill', 'Captain\'s Reception'] },
            { day: 2, port: 'At Sea', arrival: 'Full Day', departure: 'Full Day', activities: ['Pool Parties', 'Live Shows', 'Cooking Classes'] },
            { day: 3, port: 'Cozumel, Mexico', arrival: '8:00 AM', departure: '6:00 PM', activities: ['Mayan Ruins Tour', 'Snorkeling', 'Beach Time'] },
            { day: 4, port: 'Belize City, Belize', arrival: '7:00 AM', departure: '4:00 PM', activities: ['Jungle Adventure', 'Cave Tubing', 'Local Markets'] },
            { day: 5, port: 'Roatan, Honduras', arrival: '8:00 AM', departure: '5:00 PM', activities: ['Zip Lining', 'Dolphin Encounter', 'Beach Resort'] }
          ]
        },
        amenities: ['Multiple Pools', 'Full-Service Spa', '15 Restaurants', 'Theater Shows', 'Casino', 'Rock Climbing', 'Mini Golf', 'Kids Club'],
        departure: 'Miami, Florida',
        destination: 'Western Caribbean',
        tenantId: defaultTenant.id
      },
      {
        id: 'cruise-mediterranean-odyssey',
        name: 'Mediterranean Odyssey',
        description: 'Discover ancient civilizations and stunning coastlines on this luxurious Mediterranean cruise. From historic Rome to beautiful Greek islands.',
        image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
        images: [
          'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          'https://images.unsplash.com/photo-1544737152-6e4e999de2a1?w=800',
          'https://images.unsplash.com/photo-1570190244633-b810a0b0e3a5?w=800'
        ],
        rating: 4.8,
        price: 3299.99,
        duration: 12,
        capacity: 2800,
        available: true,
        itinerary: {
          days: [
            { day: 1, port: 'Barcelona, Spain', arrival: 'Embarkation', departure: '7:00 PM', activities: ['Embarkation', 'Welcome Dinner'] },
            { day: 2, port: 'Monte Carlo, Monaco', arrival: '8:00 AM', departure: '6:00 PM', activities: ['Casino Visit', 'Palace Tour', 'Shopping'] },
            { day: 3, port: 'Rome (Civitavecchia), Italy', arrival: '7:00 AM', departure: '7:00 PM', activities: ['Vatican Tour', 'Colosseum', 'Roman Forum'] },
            { day: 4, port: 'Florence (Livorno), Italy', arrival: '8:00 AM', departure: '6:00 PM', activities: ['Uffizi Gallery', 'Duomo', 'Tuscan Wine'] }
          ]
        },
        amenities: ['Infinity Pool', 'Wine Bar', 'Michelin Star Dining', 'Art Gallery', 'Library', 'Fitness Center', 'Boutique Shopping'],
        departure: 'Barcelona, Spain',
        destination: 'Mediterranean Sea',
        tenantId: defaultTenant.id
      },
      {
        id: 'cruise-alaska-wilderness',
        name: 'Alaska Wilderness Explorer',
        description: 'Journey through the pristine wilderness of Alaska. Witness glaciers, wildlife, and breathtaking natural beauty on this unforgettable adventure.',
        image: 'https://images.unsplash.com/photo-1610207231761-8b7834f7e97b?w=800',
        images: [
          'https://images.unsplash.com/photo-1610207231761-8b7834f7e97b?w=800',
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
        ],
        rating: 4.7,
        price: 2899.99,
        duration: 10,
        capacity: 2200,
        available: true,
        itinerary: {
          days: [
            { day: 1, port: 'Seattle, WA', arrival: 'Embarkation', departure: '5:00 PM', activities: ['Embarkation', 'Glacier Bay Preparation'] },
            { day: 2, port: 'Inside Passage', arrival: 'Scenic Cruising', departure: 'Scenic Cruising', activities: ['Wildlife Viewing', 'Photography Workshop'] },
            { day: 3, port: 'Juneau, Alaska', arrival: '1:00 PM', departure: '9:00 PM', activities: ['Mendenhall Glacier', 'Whale Watching', 'Local Culture'] },
            { day: 4, port: 'Skagway, Alaska', arrival: '7:00 AM', departure: '8:00 PM', activities: ['White Pass Railway', 'Gold Rush History', 'Dog Sledding'] }
          ]
        },
        amenities: ['Observation Decks', 'Naturalist Guides', 'Hot Tubs', 'Specialty Restaurant', 'Photo Lab', 'Lecture Hall'],
        departure: 'Seattle, Washington',
        destination: 'Alaska Inside Passage',
        tenantId: defaultTenant.id
      }
    ];

    for (const cruise of cruises) {
      await prisma.cruise.upsert({
        where: { id: cruise.id },
        update: cruise,
        create: cruise
      });
    }

    // 2. SEED HOTELS WITH IMAGES AND DETAILS
    console.log('🏨 Seeding hotel data...');
    const hotels = [
      {
        id: 'hotel-grand-resort-bali',
        name: 'Grand Resort Bali Paradise',
        description: 'Luxury beachfront resort in Bali with stunning ocean views, world-class spa, and authentic Indonesian hospitality. Perfect for romantic getaways and family vacations.',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
        ],
        rating: 4.9,
        price: 450.00,
        location: 'Seminyak, Bali',
        address: 'Jl. Kayu Aya No. 9X, Seminyak Beach',
        city: 'Seminyak',
        country: 'Indonesia',
        amenities: ['Private Beach', 'Infinity Pool', 'Spa & Wellness', 'Fine Dining', 'Airport Transfer', 'WiFi', 'Concierge', 'Fitness Center'],
        roomTypes: [
          { type: 'Ocean View Suite', size: 65, amenities: ['King Bed', 'Ocean View', 'Balcony', 'Mini Bar'], price: 450 },
          { type: 'Beachfront Villa', size: 120, amenities: ['Private Pool', 'Beach Access', 'Butler Service', 'Jacuzzi'], price: 850 },
          { type: 'Presidential Suite', size: 200, amenities: ['Private Chef', 'Helicopter Pad', 'Personal Butler', 'Private Beach'], price: 1500 }
        ],
        available: true,
        tenantId: defaultTenant.id
      },
      {
        id: 'hotel-swiss-alpine-lodge',
        name: 'Swiss Alpine Grand Lodge',
        description: 'Nestled in the heart of the Swiss Alps, this luxury mountain resort offers breathtaking views, world-class skiing, and authentic Swiss hospitality.',
        image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800',
        images: [
          'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'
        ],
        rating: 4.8,
        price: 680.00,
        location: 'Zermatt, Swiss Alps',
        address: 'Bahnhofstrasse 55, 3920 Zermatt',
        city: 'Zermatt',
        country: 'Switzerland',
        amenities: ['Ski-in/Ski-out', 'Alpine Spa', 'Michelin Restaurant', 'Heated Pool', 'Mountain Guides', 'Equipment Rental', 'Helicopter Tours'],
        roomTypes: [
          { type: 'Alpine Classic', size: 45, amenities: ['Mountain View', 'Fireplace', 'Balcony', 'Mini Bar'], price: 680 },
          { type: 'Matterhorn Suite', size: 80, amenities: ['Matterhorn View', 'Jacuzzi', 'Private Terrace', 'Butler Service'], price: 1200 },
          { type: 'Presidential Chalet', size: 150, amenities: ['Private Chef', 'Ski Room', 'Wine Cellar', 'Sauna'], price: 2200 }
        ],
        available: true,
        tenantId: defaultTenant.id
      },
      {
        id: 'hotel-tokyo-luxury-tower',
        name: 'Tokyo Luxury Tower Hotel',
        description: 'Ultra-modern luxury hotel in the heart of Tokyo with panoramic city views, Michelin-starred dining, and unparalleled service in Japan\'s capital.',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1520637836862-4d197d17c86a?w=800'
        ],
        rating: 4.9,
        price: 580.00,
        location: 'Shibuya, Tokyo',
        address: '2-15-1 Shibuya, Shibuya City, Tokyo 150-8512',
        city: 'Tokyo',
        country: 'Japan',
        amenities: ['City Views', 'Michelin Restaurant', 'Rooftop Bar', 'Spa', 'Business Center', 'Cultural Concierge', 'Airport Limousine'],
        roomTypes: [
          { type: 'Tokyo Skyline', size: 55, amenities: ['City View', 'Smart TV', 'Rain Shower', 'Minibar'], price: 580 },
          { type: 'Executive Suite', size: 90, amenities: ['Panoramic View', 'Separate Living', 'Premium Amenities', 'Club Access'], price: 980 },
          { type: 'Imperial Suite', size: 180, amenities: ['Private Elevator', 'Personal Butler', 'Dining Room', 'Private Terrace'], price: 2800 }
        ],
        available: true,
        tenantId: defaultTenant.id
      },
      {
        id: 'hotel-maldives-overwater',
        name: 'Maldives Overwater Paradise',
        description: 'Exclusive overwater bungalows in the pristine Maldives. Crystal clear waters, vibrant coral reefs, and unmatched luxury in paradise.',
        image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
        images: [
          'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
        ],
        rating: 5.0,
        price: 1200.00,
        location: 'South Malé Atoll',
        address: 'Nalaguraidhoo Island, South Malé Atoll',
        city: 'Nalaguraidhoo',
        country: 'Maldives',
        amenities: ['Overwater Bungalows', 'Private Beach', 'Diving Center', 'Seaplane Transfer', 'Spa Treatments', 'Water Sports', 'Marine Biologist'],
        roomTypes: [
          { type: 'Overwater Bungalow', size: 100, amenities: ['Glass Floor', 'Direct Ocean Access', 'Sun Deck', 'Outdoor Shower'], price: 1200 },
          { type: 'Sunset Water Villa', size: 150, amenities: ['Infinity Pool', 'Sunset View', 'Butler Service', 'Wine Cellar'], price: 1800 },
          { type: 'Presidential Water Suite', size: 300, amenities: ['Private Island', 'Personal Chef', 'Yacht Access', 'Helicopter Pad'], price: 4500 }
        ],
        available: true,
        tenantId: defaultTenant.id
      }
    ];

    for (const hotel of hotels) {
      await prisma.hotel.upsert({
        where: { id: hotel.id },
        update: hotel,
        create: hotel
      });
    }

    // 3. SEED PACKAGES WITH IMAGES AND DETAILS
    console.log('📦 Seeding package data...');
    const packages = [
      {
        id: 'package-european-grand-tour',
        name: 'European Grand Tour - 21 Days',
        description: 'Experience the best of Europe in 21 unforgettable days. Visit iconic cities like Paris, Rome, Barcelona, and Amsterdam with luxury accommodations and expert guides.',
        image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
        images: [
          'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
          'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800',
          'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
          'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800'
        ],
        price: 6999.99,
        duration: 21,
        destinations: ['Paris', 'Barcelona', 'Rome', 'Amsterdam', 'Prague', 'Vienna', 'London'],
        inclusions: [
          '20 nights luxury hotel accommodation',
          'All domestic flights within Europe',
          'High-speed train tickets (Eurail Pass)',
          'Daily breakfast and 10 dinners',
          'Professional tour guide',
          'All museum and attraction entries',
          'Airport transfers',
          '24/7 concierge service'
        ],
        exclusions: [
          'International flights to/from Europe',
          'Travel insurance',
          'Personal expenses',
          'Lunch meals (except specified)',
          'Optional activities',
          'Visa fees'
        ],
        itinerary: {
          days: [
            { day: '1-3', location: 'Paris, France', activities: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Versailles Day Trip'] },
            { day: '4-6', location: 'Barcelona, Spain', activities: ['Sagrada Familia', 'Park Güell', 'Gothic Quarter', 'Flamenco Show'] },
            { day: '7-9', location: 'Rome, Italy', activities: ['Colosseum', 'Vatican Museums', 'Trevi Fountain', 'Tuscany Day Trip'] },
            { day: '10-12', location: 'Amsterdam, Netherlands', activities: ['Canal Cruise', 'Anne Frank House', 'Keukenhof Gardens', 'Bike Tour'] },
            { day: '13-15', location: 'Prague, Czech Republic', activities: ['Prague Castle', 'Charles Bridge', 'Old Town Square', 'Beer Tasting'] },
            { day: '16-18', location: 'Vienna, Austria', activities: ['Schönbrunn Palace', 'Mozart Concert', 'Danube Valley', 'Coffee Culture'] },
            { day: '19-21', location: 'London, England', activities: ['Big Ben', 'Tower of London', 'British Museum', 'West End Show'] }
          ]
        },
        available: true,
        tenantId: defaultTenant.id
      },
      {
        id: 'package-african-safari-adventure',
        name: 'Ultimate African Safari Adventure',
        description: 'Embark on the adventure of a lifetime through Kenya and Tanzania. Witness the Great Migration, see the Big Five, and experience authentic African culture.',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
        images: [
          'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
          'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800'
        ],
        price: 8499.99,
        duration: 14,
        destinations: ['Kenya', 'Tanzania', 'Masai Mara', 'Serengeti', 'Zanzibar'],
        inclusions: [
          '13 nights luxury safari lodges',
          'All domestic flights',
          '4x4 Safari vehicles with professional guides',
          'All meals and beverages',
          'Park entry fees',
          'Cultural village visits',
          'Hot air balloon safari',
          'Professional photography support'
        ],
        exclusions: [
          'International flights',
          'Travel insurance',
          'Visa fees',
          'Personal expenses',
          'Tips and gratuities',
          'Optional activities'
        ],
        itinerary: {
          days: [
            { day: '1-3', location: 'Masai Mara, Kenya', activities: ['Game Drives', 'Hot Air Balloon', 'Masai Village Visit', 'Great Migration'] },
            { day: '4-6', location: 'Lake Nakuru, Kenya', activities: ['Flamingo Viewing', 'Rhino Sanctuary', 'Baboon Cliff', 'Bird Watching'] },
            { day: '7-9', location: 'Serengeti, Tanzania', activities: ['Big Five Safari', 'Wildebeest Migration', 'Kopjes Exploration', 'Night Drives'] },
            { day: '10-12', location: 'Ngorongoro Crater, Tanzania', activities: ['Crater Floor Safari', 'Olduvai Gorge', 'Cultural Center', 'Conservation Area'] },
            { day: '13-14', location: 'Zanzibar, Tanzania', activities: ['Stone Town', 'Spice Tour', 'Beach Relaxation', 'Sunset Dhow Cruise'] }
          ]
        },
        available: true,
        tenantId: defaultTenant.id
      },
      {
        id: 'package-asia-cultural-journey',
        name: 'Asia Cultural Journey - Japan & Thailand',
        description: 'Immerse yourself in the rich cultures of Japan and Thailand. From ancient temples to modern cities, experience the perfect blend of tradition and innovation.',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
        images: [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
          'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'
        ],
        price: 5799.99,
        duration: 16,
        destinations: ['Japan', 'Thailand', 'Tokyo', 'Kyoto', 'Bangkok', 'Chiang Mai'],
        inclusions: [
          '15 nights premium accommodation',
          'International flights between countries',
          'JR Rail Pass (Japan)',
          'Cultural workshops and classes',
          'Temple visits with monks',
          'Cooking classes',
          'Professional cultural guides',
          'Traditional performances'
        ],
        exclusions: [
          'International flights',
          'Travel insurance',
          'Visa fees',
          'Personal expenses',
          'Tips and gratuities',
          'Optional activities'
        ],
        itinerary: {
          days: [
            { day: '1-4', location: 'Tokyo, Japan', activities: ['Sensoji Temple', 'Sushi Making Class', 'Shibuya Crossing', 'Mount Fuji Day Trip'] },
            { day: '5-8', location: 'Kyoto, Japan', activities: ['Fushimi Inari', 'Tea Ceremony', 'Bamboo Grove', 'Geisha District'] },
            { day: '9-12', location: 'Bangkok, Thailand', activities: ['Grand Palace', 'Floating Market', 'Thai Cooking Class', 'River Cruise'] },
            { day: '13-16', location: 'Chiang Mai, Thailand', activities: ['Elephant Sanctuary', 'Temple Hopping', 'Night Bazaar', 'Hill Tribe Visit'] }
          ]
        },
        available: true,
        tenantId: defaultTenant.id
      }
    ];

    for (const pkg of packages) {
      await prisma.package.upsert({
        where: { id: pkg.id },
        update: pkg,
        create: pkg
      });
    }

    // 4. SEED ADDITIONAL USERS
    console.log('👥 Seeding additional users...');
    const additionalUsers = [
      {
        email: 'john.manager@tripgo.com',
        password: await bcrypt.hash('Manager123!', 12),
        firstName: 'John',
        lastName: 'Manager',
        role: UserRole.HR_MANAGER,
        phone: '+1-555-0101',
        isActive: true,
        tenantId: defaultTenant.id
      },
      {
        email: 'sarah.employee@tripgo.com',
        password: await bcrypt.hash('Employee123!', 12),
        firstName: 'Sarah',
        lastName: 'Employee',
        role: UserRole.EMPLOYEE,
        phone: '+1-555-0102',
        isActive: true,
        tenantId: defaultTenant.id
      },
      {
        email: 'mike.customer@tripgo.com',
        password: await bcrypt.hash('Customer123!', 12),
        firstName: 'Mike',
        lastName: 'Johnson',
        role: UserRole.CUSTOMER,
        phone: '+1-555-0103',
        isActive: true,
        tenantId: defaultTenant.id
      },
      {
        email: 'emma.customer@tripgo.com',
        password: await bcrypt.hash('Customer123!', 12),
        firstName: 'Emma',
        lastName: 'Wilson',
        role: UserRole.CUSTOMER,
        phone: '+1-555-0104',
        isActive: true,
        tenantId: defaultTenant.id
      },
      {
        email: 'david.customer@tripgo.com',
        password: await bcrypt.hash('Customer123!', 12),
        firstName: 'David',
        lastName: 'Brown',
        role: UserRole.CUSTOMER,
        phone: '+1-555-0105',
        isActive: true,
        tenantId: defaultTenant.id
      }
    ];

    for (const user of additionalUsers) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      });
    }

    // 5. SEED DEPARTMENTS
    console.log('🏢 Seeding departments...');
    const departments = [
      {
        id: 'dept-operations',
        name: 'Operations',
        description: 'Oversees daily operations, cruise coordination, and service delivery',
        tenantId: defaultTenant.id
      },
      {
        id: 'dept-customer-service',
        name: 'Customer Service',
        description: 'Handles customer inquiries, bookings, and support services',
        tenantId: defaultTenant.id
      },
      {
        id: 'dept-marketing',
        name: 'Marketing & Sales',
        description: 'Manages marketing campaigns, sales strategies, and brand promotion',
        tenantId: defaultTenant.id
      },
      {
        id: 'dept-finance',
        name: 'Finance & Accounting',
        description: 'Handles financial planning, accounting, and revenue management',
        tenantId: defaultTenant.id
      }
    ];

    for (const dept of departments) {
      await prisma.department.upsert({
        where: { id: dept.id },
        update: dept,
        create: dept
      });
    }

    // 6. SEED EMPLOYEES
    console.log('👔 Seeding employees...');
    const employees = [
      {
        id: 'emp-john-manager',
        employeeId: 'EMP001',
        userId: (await prisma.user.findUnique({ where: { email: 'john.manager@tripgo.com' } }))?.id!,
        departmentId: 'dept-operations',
        position: 'Operations Manager',
        salary: 75000,
        hireDate: new Date('2023-01-15'),
        status: EmployeeStatus.ACTIVE,
        manager: 'Operations Director',
        emergencyContact: {
          name: 'Jane Manager',
          relationship: 'Spouse',
          phone: '+1-555-0201'
        },
        address: {
          street: '123 Manager St',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA'
        },
        notes: 'Excellent performance, eligible for promotion'
      },
      {
        id: 'emp-sarah-employee',
        employeeId: 'EMP002',
        userId: (await prisma.user.findUnique({ where: { email: 'sarah.employee@tripgo.com' } }))?.id!,
        departmentId: 'dept-customer-service',
        position: 'Customer Service Representative',
        salary: 45000,
        hireDate: new Date('2023-06-01'),
        status: EmployeeStatus.ACTIVE,
        manager: 'Customer Service Manager',
        emergencyContact: {
          name: 'Tom Employee',
          relationship: 'Brother',
          phone: '+1-555-0202'
        },
        address: {
          street: '456 Service Ave',
          city: 'Miami',
          state: 'FL',
          zipCode: '33102',
          country: 'USA'
        },
        notes: 'Great customer service skills, multilingual'
      }
    ];

    for (const emp of employees) {
      const { userId, departmentId, tenantId, address, notes, ...empData } = emp;
      const createData: any = {
        ...empData,
        address: typeof address === 'object' ? JSON.stringify(address) : address,
        user: {
          connect: { id: userId }
        },
        tenant: {
          connect: { id: tenantId || defaultTenant.id }
        }
      };

      if (departmentId) {
        createData.departmentRef = {
          connect: { id: departmentId }
        };
      }

      await prisma.employee.upsert({
        where: { id: emp.id },
        update: {
          ...empData,
          departmentId: departmentId,
          address: typeof address === 'object' ? JSON.stringify(address) : address
        },
        create: createData
      });
    }

    // 7. SEED ATTENDANCE RECORDS
    console.log('📅 Seeding attendance records...');
    const employees_list = await prisma.employee.findMany();
    const today = new Date();

    for (const emp of employees_list) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const checkIn = new Date(date);
        checkIn.setHours(9, Math.floor(Math.random() * 30), 0, 0);

        const checkOut = new Date(checkIn);
        checkOut.setHours(17, Math.floor(Math.random() * 60), 0, 0);

        await prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: emp.id,
              date: date
            }
          },
          update: {},
          create: {
            employeeId: emp.id,
            date: date,
            checkIn: checkIn,
            checkOut: checkOut,
            status: Math.random() > 0.1 ? AttendanceStatus.PRESENT : AttendanceStatus.LATE,
            notes: Math.random() > 0.8 ? 'Traffic delay' : undefined
          }
        });
      }
    }

    // 8. SEED SITE SETTINGS
    console.log('⚙️ Seeding site settings...');
    const siteSettings = [
      {
        key: 'site_name',
        value: 'TripGo - Ultimate Travel Experience',
        type: SettingType.TEXT,
        description: 'The main site name displayed across the platform',
        tenantId: defaultTenant.id
      },
      {
        key: 'site_description',
        value: 'Discover amazing destinations with our premium cruise, hotel, and travel packages',
        type: SettingType.TEXT,
        description: 'Site description for SEO and marketing',
        tenantId: defaultTenant.id
      },
      {
        key: 'contact_email',
        value: 'support@tripgo.com',
        type: SettingType.TEXT,
        description: 'Main contact email for customer support',
        tenantId: defaultTenant.id
      },
      {
        key: 'contact_phone',
        value: '+1-800-TRIPGO-1',
        type: SettingType.TEXT,
        description: 'Main contact phone number',
        tenantId: defaultTenant.id
      },
      {
        key: 'booking_cancellation_hours',
        value: '24',
        type: SettingType.NUMBER,
        description: 'Hours before departure when free cancellation is allowed',
        tenantId: defaultTenant.id
      },
      {
        key: 'max_guests_per_booking',
        value: '8',
        type: SettingType.NUMBER,
        description: 'Maximum number of guests allowed per single booking',
        tenantId: defaultTenant.id
      },
      {
        key: 'currency',
        value: 'USD',
        type: SettingType.TEXT,
        description: 'Default currency for pricing',
        tenantId: defaultTenant.id
      },
      {
        key: 'timezone',
        value: 'America/New_York',
        type: SettingType.TEXT,
        description: 'Default timezone for the application',
        tenantId: defaultTenant.id
      }
    ];

    for (const setting of siteSettings) {
      const { tenantId, ...settingData } = setting;
      await prisma.siteSetting.upsert({
        where: {
          key_tenantId: {
            key: setting.key,
            tenantId: setting.tenantId
          }
        },
        update: setting,
        create: {
          ...settingData,
          tenant: {
            connect: { id: tenantId }
          }
        }
      });
    }

    console.log('✅ Admin data seeding completed successfully!');
    console.log(`
📊 SEEDED DATA SUMMARY:
🚢 Cruises: 3 premium cruises with detailed itineraries
🏨 Hotels: 4 luxury hotels with room types and amenities
📦 Packages: 3 comprehensive travel packages
👥 Users: 5 additional users (managers, employees, customers)
🏢 Departments: 4 departments with descriptions
👔 Employees: 2 employees with full HR data
📅 Attendance: 30 days of attendance records per employee
⚙️ Settings: 8 site configuration settings

🎉 Your admin panel now has comprehensive sample data!
    `);

  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminData();