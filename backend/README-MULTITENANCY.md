# TripGo Multi-Tenancy Implementation

Complete multi-tenant architecture for managing 3 separate sites with shared infrastructure but isolated data.

## 🏗️ **Multi-Tenancy Architecture**

### **Tenant Isolation Strategy**
- **Database-level isolation** - All models include `tenantId` for complete data separation
- **Subdomain-based routing** - Each tenant accessible via unique subdomain
- **Tenant-aware authentication** - JWT tokens scoped to specific tenants
- **Plan-based limitations** - Different feature sets based on tenant plans

### **Tenant Structure**
```typescript
{
  id: string,
  name: string,           // "TripGo Main"
  slug: string,           // "tripgo-main"
  domain: string,         // "tripgo.com"
  subdomain: string,      // "main"
  status: TenantStatus,   // ACTIVE, INACTIVE, SUSPENDED, TRIAL
  plan: TenantPlan,       // FREE, STANDARD, PREMIUM, ENTERPRISE
  settings: Json          // Tenant-specific configuration
}
```

## 🌐 **Three Default Tenants**

### **1. TripGo Main** (`main.tripgo.com`)
- **Plan**: Enterprise (unlimited features)
- **Focus**: Complete travel platform with all features
- **Features**: Cruises, Hotels, Packages, HR, Media Management
- **Theme**: Default blue theme
- **Admin**: `admin@main.tripgo.com`

### **2. TripGo Cruises** (`cruises.tripgo.com`)
- **Plan**: Premium (advanced features)
- **Focus**: Cruise-specialized platform
- **Features**: Cruise bookings, reviews, specialized cruise content
- **Theme**: Ocean blue theme
- **Admin**: `admin@cruises.tripgo.com`

### **3. TripGo Hotels** (`hotels.tripgo.com`)
- **Plan**: Premium (advanced features)
- **Focus**: Hotel-specialized platform
- **Features**: Hotel bookings, room management, hotel-specific content
- **Theme**: Green hospitality theme
- **Admin**: `admin@hotels.tripgo.com`

## 🔐 **Tenant-Aware Authentication**

### **Authentication Flow**
1. **Tenant Resolution** - Determine tenant from subdomain/header
2. **User Lookup** - Find user within tenant scope
3. **JWT Generation** - Include `tenantId` in token payload
4. **Request Validation** - Ensure token tenant matches request tenant

### **Token Structure**
```javascript
{
  userId: "user_id",
  email: "user@email.com",
  tenantId: "tenant_id",
  exp: timestamp
}
```

### **Access Methods**
- **Subdomain**: `cruises.tripgo.com` → `cruises` tenant
- **Header**: `X-Tenant-Domain: cruises` or `X-Tenant-Id: tenant_id`
- **Query Parameter**: `?tenant=cruises` (fallback)

## 🛡️ **Data Isolation**

### **Database Schema Changes**
All tenant-specific models now include:
```sql
tenantId String
tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
@@unique([tenantId, slug]) -- For unique constraints within tenant
```

### **Affected Models**
- ✅ **Users** - Scoped to tenant (`@@unique([tenantId, email])`)
- ✅ **Cruises** - Isolated per tenant
- ✅ **Hotels** - Tenant-specific inventory
- ✅ **Packages** - Separate offerings per tenant
- ✅ **Bookings** - Isolated booking records
- ✅ **Reviews** - Tenant-scoped reviews
- ✅ **Employees** - HR data per tenant
- ✅ **Site Settings** - Customizable per tenant
- ✅ **Media Files** - Separate media libraries

## 📊 **Tenant Plans & Limits**

### **Plan Features**
```typescript
const limits = {
  FREE: {
    users: 10,
    bookings: 50,
    storage: 100, // MB
    api_calls: 1000 // per day
  },
  STANDARD: {
    users: 100,
    bookings: 500,
    storage: 1000, // MB
    api_calls: 10000
  },
  PREMIUM: {
    users: 1000,
    bookings: 5000,
    storage: 10000, // MB
    api_calls: 100000
  },
  ENTERPRISE: {
    users: -1, // Unlimited
    bookings: -1,
    storage: -1,
    api_calls: -1
  }
}
```

### **Limit Enforcement**
- **User Registration** - Check user limit before creating accounts
- **Booking Creation** - Monitor monthly booking limits
- **File Uploads** - Track storage usage per tenant
- **API Calls** - Rate limiting based on plan (future implementation)

## 🚀 **API Endpoints**

### **Tenant Management** (Super Admin Only)
```
GET  /api/tenants                    - List all tenants
POST /api/tenants                    - Create new tenant
GET  /api/tenants/:id                - Get tenant details
PUT  /api/tenants/:id                - Update tenant
DELETE /api/tenants/:id              - Delete tenant (if empty)

GET  /api/tenants/:id/stats          - Tenant statistics
PUT  /api/tenants/:id/suspend        - Suspend tenant
PUT  /api/tenants/:id/activate       - Activate tenant

POST /api/tenants/initialize/defaults - Create default tenants
GET  /api/tenants/domain/:domain     - Discover tenant by domain
```

### **Tenant-Aware Routes**
All existing routes are now tenant-aware:
```
# Automatic tenant resolution via subdomain/header
GET  cruises.tripgo.com/api/cruises  - Cruises for 'cruises' tenant
GET  hotels.tripgo.com/api/hotels    - Hotels for 'hotels' tenant
POST main.tripgo.com/api/auth/login  - Login to 'main' tenant

# Or via headers
GET  /api/cruises
Headers: X-Tenant-Domain: cruises
```

## 🔧 **Implementation Details**

### **Middleware Stack**
1. **tenantResolver** - Identifies tenant from request
2. **requireTenant** - Ensures tenant context exists
3. **tenantAwareAuth** - Validates user within tenant
4. **tenantIsolation** - Enforces data separation

### **Tenant Resolution Priority**
1. `X-Tenant-Id` or `X-Tenant-Domain` header
2. Subdomain extraction (`cruises.tripgo.com` → `cruises`)
3. Query parameter `?tenant=cruises`
4. Fallback to `tripgo-main` tenant

### **Database Queries**
All queries automatically scoped to tenant:
```typescript
// Before multi-tenancy
prisma.user.findMany()

// After multi-tenancy
prisma.user.findMany({
  where: { tenantId: req.tenantId }
})
```

## 🛠️ **Setup & Configuration**

### **1. Database Migration**
```bash
# Generate and apply migrations
npm run db:generate
npm run db:migrate
```

### **2. Seed Default Tenants**
```bash
# Create the 3 default tenants with sample data
npm run db:seed:tenants
```

### **3. Environment Variables**
```env
# Admin credentials for all tenants
ADMIN_EMAIL=admin@tripgo.com
ADMIN_PASSWORD=admin123456

# JWT secret for tenant-aware tokens
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

### **4. DNS Configuration**
Set up subdomains to point to your server:
```
main.tripgo.com     → your-server-ip
cruises.tripgo.com  → your-server-ip
hotels.tripgo.com   → your-server-ip
```

## 📱 **Frontend Integration**

### **Tenant Detection**
```javascript
// Detect current tenant from subdomain
const getTenant = () => {
  const subdomain = window.location.hostname.split('.')[0];
  return subdomain === 'localhost' ? 'main' : subdomain;
};

// Include tenant in API calls
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'X-Tenant-Domain': getTenant(),
      ...options.headers
    }
  });
  return response.json();
};
```

### **Tenant-Specific Theming**
```javascript
// Get tenant settings for theming
const settings = await fetch('/api/settings/public');
const theme = settings.data.general;

// Apply tenant-specific styling
document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
```

### **Authentication per Tenant**
```javascript
// Login scoped to current tenant
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Domain': getTenant()
    },
    body: JSON.stringify({ email, password })
  });

  if (response.ok) {
    const { data } = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};
```

## 🔍 **Testing Multi-Tenancy**

### **1. Create Test Users**
```bash
# Register user in 'cruises' tenant
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: cruises" \
  -d '{"email":"test@cruises.com","password":"password123","firstName":"Test","lastName":"User"}'

# Register user in 'hotels' tenant
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: hotels" \
  -d '{"email":"test@hotels.com","password":"password123","firstName":"Test","lastName":"User"}'
```

### **2. Test Data Isolation**
```bash
# Login to cruises tenant
CRUISES_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: cruises" \
  -d '{"email":"test@cruises.com","password":"password123"}' | jq -r '.data.token')

# Get cruises (should only see cruises tenant data)
curl -H "Authorization: Bearer $CRUISES_TOKEN" \
  -H "X-Tenant-Domain: cruises" \
  http://localhost:5000/api/cruises
```

### **3. Test Cross-Tenant Security**
```bash
# Try to access hotels data with cruises token (should fail)
curl -H "Authorization: Bearer $CRUISES_TOKEN" \
  -H "X-Tenant-Domain: hotels" \
  http://localhost:5000/api/hotels
# Should return 403 Forbidden
```

## 🚨 **Security Considerations**

### **Tenant Isolation**
- ✅ **Database Level** - All queries scoped to tenant
- ✅ **Authentication** - Tokens tied to specific tenants
- ✅ **API Access** - Middleware enforces tenant boundaries
- ✅ **File Storage** - Media files isolated per tenant

### **Cross-Tenant Protection**
- ✅ **Token Validation** - Verify token tenant matches request tenant
- ✅ **User Verification** - Ensure user belongs to requested tenant
- ✅ **Data Queries** - All database operations include tenant filter
- ✅ **Admin Controls** - Super admin can manage all tenants

### **Plan Enforcement**
- ✅ **Usage Limits** - Monitor and enforce plan-based restrictions
- ✅ **Feature Gates** - Premium features locked by plan
- ✅ **Resource Quotas** - Storage and API call limitations
- ✅ **Graceful Degradation** - Soft limits with upgrade prompts

This multi-tenant architecture provides complete isolation while sharing infrastructure, perfect for managing multiple travel-focused sites with different specializations and branding!