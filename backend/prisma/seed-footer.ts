import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFooter() {
  try {
    console.log('🚀 Starting footer seed...');

    // Get the first tenant or create a default one
    let tenant = await prisma.tenant.findFirst();

    if (!tenant) {
      console.log('📦 Creating default tenant...');
      tenant = await prisma.tenant.create({
        data: {
          name: 'TripGo',
          slug: 'tripgo',
          domain: 'tripgo.com',
          subdomain: 'tripgo',
          status: 'ACTIVE',
          plan: 'PREMIUM',
        }
      });
      console.log('✅ Default tenant created');
    }

    // Check if footer config already exists
    const existingFooter = await prisma.footerConfig.findUnique({
      where: { tenantId: tenant.id }
    });

    if (existingFooter) {
      console.log('⚠️  Footer configuration already exists. Deleting old data...');
      await prisma.footerConfig.delete({
        where: { tenantId: tenant.id }
      });
      console.log('✅ Old footer data deleted');
    }

    // Create comprehensive footer configuration
    console.log('📝 Creating footer configuration...');
    const footerConfig = await prisma.footerConfig.create({
      data: {
        tenantId: tenant.id,
        companyName: 'TripGo',
        companyTagline: 'Your Journey, Our Passion',
        description: 'Discover the world with TripGo - your trusted partner for unforgettable cruises, luxury ships, premium hotels, and carefully curated travel packages. We turn your travel dreams into reality.',
        copyrightText: `© ${new Date().getFullYear()} TripGo. All rights reserved.`,

        // Contact Information
        email: 'hello@tripgo.com',
        phone: '+1 (555) 123-4567',
        address: '123 Ocean Drive, Miami Beach, FL 33139, USA',

        // Social Media
        facebook: 'https://facebook.com/tripgo',
        twitter: 'https://twitter.com/tripgo',
        instagram: 'https://instagram.com/tripgo',
        linkedin: 'https://linkedin.com/company/tripgo',
        youtube: 'https://youtube.com/@tripgo',

        // Newsletter
        showNewsletter: true,
        newsletterTitle: 'Get Exclusive Travel Deals',
        newsletterText: 'Subscribe to receive the latest cruise deals, hotel offers, and travel tips directly to your inbox. No spam, just amazing adventures!',

        // Appearance
        backgroundColor: '#0f172a',
        textColor: '#e2e8f0',
        accentColor: '#3b82f6',
        isActive: true,

        sections: {
          create: [
            // Section 1: Destinations
            {
              title: 'Top Destinations',
              displayOrder: 0,
              isActive: true,
              links: {
                create: [
                  { label: 'Caribbean Cruises', url: '/cruises?destination=caribbean', displayOrder: 0, isActive: true },
                  { label: 'Mediterranean Voyages', url: '/cruises?destination=mediterranean', displayOrder: 1, isActive: true },
                  { label: 'Alaska Adventures', url: '/cruises?destination=alaska', displayOrder: 2, isActive: true },
                  { label: 'European River Cruises', url: '/cruises?destination=europe', displayOrder: 3, isActive: true },
                  { label: 'Asian Expeditions', url: '/cruises?destination=asia', displayOrder: 4, isActive: true },
                  { label: 'South Pacific Islands', url: '/cruises?destination=pacific', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 2: Travel Options
            {
              title: 'Travel Options',
              displayOrder: 1,
              isActive: true,
              links: {
                create: [
                  { label: 'All Cruises', url: '/cruises', displayOrder: 0, isActive: true },
                  { label: 'Luxury Ships', url: '/ships', displayOrder: 1, isActive: true },
                  { label: 'Hotels & Resorts', url: '/hotels', displayOrder: 2, isActive: true },
                  { label: 'Travel Packages', url: '/packages', displayOrder: 3, isActive: true },
                  { label: 'Last Minute Deals', url: '/deals', displayOrder: 4, isActive: true },
                  { label: 'Group Bookings', url: '/group-bookings', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 3: Company
            {
              title: 'Company',
              displayOrder: 2,
              isActive: true,
              links: {
                create: [
                  { label: 'About Us', url: '/about', displayOrder: 0, isActive: true },
                  { label: 'Our Story', url: '/our-story', displayOrder: 1, isActive: true },
                  { label: 'Careers', url: '/careers', displayOrder: 2, isActive: true },
                  { label: 'Press & Media', url: '/press', displayOrder: 3, isActive: true },
                  { label: 'Partnerships', url: '/partnerships', displayOrder: 4, isActive: true },
                  { label: 'Sustainability', url: '/sustainability', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 4: Customer Support
            {
              title: 'Customer Support',
              displayOrder: 3,
              isActive: true,
              links: {
                create: [
                  { label: 'Help Center', url: '/help', displayOrder: 0, isActive: true },
                  { label: 'Contact Us', url: '/contact', displayOrder: 1, isActive: true },
                  { label: 'FAQs', url: '/faq', displayOrder: 2, isActive: true },
                  { label: 'Booking Assistance', url: '/booking-help', displayOrder: 3, isActive: true },
                  { label: 'Travel Insurance', url: '/insurance', displayOrder: 4, isActive: true },
                  { label: 'Cancellation Policy', url: '/cancellation-policy', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 5: Resources
            {
              title: 'Travel Resources',
              displayOrder: 4,
              isActive: true,
              links: {
                create: [
                  { label: 'Travel Blog', url: '/blog', displayOrder: 0, isActive: true },
                  { label: 'Destination Guides', url: '/guides', displayOrder: 1, isActive: true },
                  { label: 'Travel Tips', url: '/travel-tips', displayOrder: 2, isActive: true },
                  { label: 'Packing Lists', url: '/packing-lists', displayOrder: 3, isActive: true },
                  { label: 'Visa Information', url: '/visa-info', displayOrder: 4, isActive: true },
                  { label: 'Travel Safety', url: '/safety', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 6: Legal & Policies
            {
              title: 'Legal',
              displayOrder: 5,
              isActive: true,
              links: {
                create: [
                  { label: 'Terms & Conditions', url: '/terms', displayOrder: 0, isActive: true },
                  { label: 'Privacy Policy', url: '/privacy', displayOrder: 1, isActive: true },
                  { label: 'Cookie Policy', url: '/cookies', displayOrder: 2, isActive: true },
                  { label: 'Refund Policy', url: '/refunds', displayOrder: 3, isActive: true },
                  { label: 'Accessibility', url: '/accessibility', displayOrder: 4, isActive: true },
                  { label: 'Sitemap', url: '/sitemap', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 7: Quick Actions (for bottom bar)
            {
              title: 'Quick Links',
              displayOrder: 6,
              isActive: true,
              links: {
                create: [
                  { label: 'Privacy', url: '/privacy', displayOrder: 0, isActive: true },
                  { label: 'Terms', url: '/terms', displayOrder: 1, isActive: true },
                  { label: 'Contact', url: '/contact', displayOrder: 2, isActive: true },
                  { label: 'Blog', url: '/blog', displayOrder: 3, isActive: true },
                  { label: 'Careers', url: '/careers', displayOrder: 4, isActive: true },
                ]
              }
            },

            // Section 8: Special Programs
            {
              title: 'Special Programs',
              displayOrder: 7,
              isActive: true,
              links: {
                create: [
                  { label: 'Loyalty Rewards', url: '/loyalty-program', displayOrder: 0, isActive: true },
                  { label: 'Gift Cards', url: '/gift-cards', displayOrder: 1, isActive: true },
                  { label: 'Corporate Travel', url: '/corporate-travel', displayOrder: 2, isActive: true },
                  { label: 'Group Bookings', url: '/group-bookings', displayOrder: 3, isActive: true },
                  { label: 'Wedding & Events', url: '/events', displayOrder: 4, isActive: true },
                  { label: 'Senior Discounts', url: '/senior-discounts', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 9: Mobile & Apps
            {
              title: 'Mobile Apps',
              displayOrder: 8,
              isActive: true,
              links: {
                create: [
                  { label: 'iOS App', url: 'https://apps.apple.com/tripgo', displayOrder: 0, isActive: true },
                  { label: 'Android App', url: 'https://play.google.com/store/apps/tripgo', displayOrder: 1, isActive: true },
                  { label: 'Mobile Site', url: '/mobile', displayOrder: 2, isActive: true },
                  { label: 'App Features', url: '/app-features', displayOrder: 3, isActive: true },
                ]
              }
            },

            // Section 10: Popular Routes
            {
              title: 'Popular Routes',
              displayOrder: 9,
              isActive: true,
              links: {
                create: [
                  { label: 'Miami to Caribbean', url: '/routes/miami-caribbean', displayOrder: 0, isActive: true },
                  { label: 'Barcelona to Greece', url: '/routes/barcelona-greece', displayOrder: 1, isActive: true },
                  { label: 'Alaska Inside Passage', url: '/routes/alaska-passage', displayOrder: 2, isActive: true },
                  { label: 'Norwegian Fjords', url: '/routes/norwegian-fjords', displayOrder: 3, isActive: true },
                  { label: 'Dubai to Asia', url: '/routes/dubai-asia', displayOrder: 4, isActive: true },
                  { label: 'Transatlantic', url: '/routes/transatlantic', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 11: Seasonal Offers
            {
              title: 'Seasonal Offers',
              displayOrder: 10,
              isActive: true,
              links: {
                create: [
                  { label: 'Summer Cruises 2024', url: '/offers/summer-cruises', displayOrder: 0, isActive: true },
                  { label: 'Winter Getaways', url: '/offers/winter-getaways', displayOrder: 1, isActive: true },
                  { label: 'Holiday Specials', url: '/offers/holiday-specials', displayOrder: 2, isActive: true },
                  { label: 'Early Bird Deals', url: '/offers/early-bird', displayOrder: 3, isActive: true },
                  { label: 'Last Minute Offers', url: '/offers/last-minute', displayOrder: 4, isActive: true },
                  { label: 'Weekend Breaks', url: '/offers/weekend-breaks', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 12: Partners & Affiliates
            {
              title: 'Partners',
              displayOrder: 11,
              isActive: true,
              links: {
                create: [
                  { label: 'Travel Partners', url: '/partners', displayOrder: 0, isActive: true },
                  { label: 'Affiliate Program', url: '/affiliates', displayOrder: 1, isActive: true },
                  { label: 'B2B Solutions', url: '/b2b', displayOrder: 2, isActive: true },
                  { label: 'Travel Agents', url: '/travel-agents', displayOrder: 3, isActive: true },
                  { label: 'Hotel Partners', url: '/hotel-partners', displayOrder: 4, isActive: true },
                  { label: 'Cruise Lines', url: '/cruise-partners', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 13: Media & Press
            {
              title: 'Media & Press',
              displayOrder: 12,
              isActive: true,
              links: {
                create: [
                  { label: 'Press Releases', url: '/press-releases', displayOrder: 0, isActive: true },
                  { label: 'Media Kit', url: '/media-kit', displayOrder: 1, isActive: true },
                  { label: 'Brand Assets', url: '/brand-assets', displayOrder: 2, isActive: true },
                  { label: 'Press Inquiries', url: '/press-contact', displayOrder: 3, isActive: true },
                  { label: 'Awards & Recognition', url: '/awards', displayOrder: 4, isActive: true },
                ]
              }
            },

            // Section 14: Additional Support
            {
              title: 'More Support',
              displayOrder: 13,
              isActive: true,
              links: {
                create: [
                  { label: 'Live Chat Support', url: '/live-chat', displayOrder: 0, isActive: true },
                  { label: 'WhatsApp Support', url: 'https://wa.me/15551234567', displayOrder: 1, isActive: true },
                  { label: 'Email Support', url: 'mailto:support@tripgo.com', displayOrder: 2, isActive: true },
                  { label: '24/7 Hotline', url: 'tel:+15551234567', displayOrder: 3, isActive: true },
                  { label: 'Video Tutorials', url: '/tutorials', displayOrder: 4, isActive: true },
                  { label: 'Community Forum', url: '/forum', displayOrder: 5, isActive: true },
                ]
              }
            },

            // Section 15: Explore More
            {
              title: 'Explore',
              displayOrder: 14,
              isActive: true,
              links: {
                create: [
                  { label: 'Travel Inspiration', url: '/inspiration', displayOrder: 0, isActive: true },
                  { label: 'Photo Gallery', url: '/gallery', displayOrder: 1, isActive: true },
                  { label: 'Customer Stories', url: '/stories', displayOrder: 2, isActive: true },
                  { label: 'Testimonials', url: '/testimonials', displayOrder: 3, isActive: true },
                  { label: 'Virtual Tours', url: '/virtual-tours', displayOrder: 4, isActive: true },
                  { label: 'Newsletters Archive', url: '/newsletter-archive', displayOrder: 5, isActive: true },
                ]
              }
            },
          ]
        }
      },
      include: {
        sections: {
          include: {
            links: true
          }
        }
      }
    });

    console.log('✅ Footer configuration created successfully!');
    console.log(`📊 Created ${footerConfig.sections.length} sections with total links:`);

    footerConfig.sections.forEach(section => {
      console.log(`   - ${section.title}: ${section.links.length} links`);
    });

    console.log('\n🎉 Footer seed completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   Company: ${footerConfig.companyName}`);
    console.log(`   Email: ${footerConfig.email}`);
    console.log(`   Phone: ${footerConfig.phone}`);
    console.log(`   Sections: ${footerConfig.sections.length}`);
    console.log(`   Total Links: ${footerConfig.sections.reduce((acc, s) => acc + s.links.length, 0)}`);

  } catch (error) {
    console.error('❌ Error seeding footer:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedFooter()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
