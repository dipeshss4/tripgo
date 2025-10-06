import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      return;
    }

    // Default admin credentials
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@tripgo.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!@#',
      firstName: 'Admin',
      lastName: 'User'
    };

    // Get default tenant
    const defaultTenant = await prisma.tenant.findFirst({
      where: { slug: 'tripgo-dev' }
    });

    if (!defaultTenant) {
      console.error('❌ Default tenant not found. Please ensure the database is seeded.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: UserRole.ADMIN,
        isActive: true,
        tenantId: defaultTenant.id
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('🆔 User ID:', admin.id);
    console.log('');
    console.log('🔐 Admin login URL: http://localhost:8080/api/admin/auth/login');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser();