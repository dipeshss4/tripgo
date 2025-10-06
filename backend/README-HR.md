# TripGo HR Module & Site Management

Complete HR management system and site settings with media upload capabilities for the TripGo platform.

## 🏢 HR Module Features

### **Employee Management**
- **Employee Profiles** - Complete employee records with personal and professional details
- **Department Management** - Organize employees by departments with budgets and heads
- **Role-Based Access** - HR Manager, Employee, and Admin roles with specific permissions
- **Document Management** - Upload and manage employee documents securely

### **Attendance System**
- **Clock In/Out** - Digital attendance tracking with timestamps
- **Attendance Status** - Present, Absent, Late, Half-day, Sick leave, Casual leave
- **Monthly Reports** - Comprehensive attendance analytics and reports
- **Quick Actions** - One-click check-in/out functionality

### **Leave Management**
- **Leave Types** - Sick, Casual, Annual, Maternity, Paternity, Unpaid, Emergency
- **Request Workflow** - Submit → Pending → Approved/Rejected flow
- **Leave Balance** - Track remaining leave days by type
- **Approval System** - HR managers can approve/reject with comments

### **Performance Management**
- **Performance Reviews** - Quarterly/annual performance evaluations
- **Goal Tracking** - Set and monitor employee goals and achievements
- **Rating System** - 1-5 scale performance ratings
- **Feedback System** - Structured feedback and review process

### **Payroll System**
- **Salary Management** - Basic salary, allowances, deductions, overtime
- **Monthly Processing** - Automated payroll calculations
- **Payment Status** - Track pending, processed, and paid statuses
- **Payroll Reports** - Detailed salary breakdowns and summaries

## 🎨 Site Settings & Media Management

### **Site Settings**
- **General Settings** - Site name, description, logo, favicon
- **Contact Information** - Email, phone, address management
- **Social Media** - Facebook, Twitter, Instagram, LinkedIn links
- **Hero Section** - Title, subtitle, background images/videos
- **SEO Settings** - Meta titles, descriptions, keywords
- **Business Settings** - Currency, timezone, commission rates
- **Maintenance Mode** - Enable/disable with custom messages

### **Media Upload System**
- **Multi-Format Support** - Images (JPG, PNG, GIF, WebP), Videos (MP4, AVI, MOV), Documents (PDF, DOC, XLS)
- **Upload Types** - Single file, multiple files, or organized by field types
- **File Organization** - Automatic categorization by type (images/videos/documents)
- **Gallery Management** - Public gallery for frontend display
- **Media Library** - Complete file management with descriptions and metadata
- **Security** - File type validation and size restrictions

## 🔐 User Roles & Permissions

### **HR Manager**
- ✅ View all employees and their details
- ✅ Create and manage employee records
- ✅ Approve/reject leave requests
- ✅ Manage attendance and generate reports
- ✅ Access HR dashboard and analytics
- ✅ Upload and manage media files

### **Employee**
- ✅ View personal dashboard and profile
- ✅ Clock in/out and track attendance
- ✅ Submit leave requests
- ✅ View own performance reviews
- ✅ Update personal information
- ✅ Book travel packages (employee benefits)

### **Admin**
- ✅ Full HR management access
- ✅ Manage site settings and configuration
- ✅ User role management
- ✅ System analytics and reports
- ✅ Media library administration

## 📊 API Endpoints

### **HR Management**
```
GET  /api/hr/dashboard              - HR dashboard statistics
GET  /api/hr/employees             - List all employees
POST /api/hr/employees             - Create new employee
GET  /api/hr/employees/:id         - Employee details
PUT  /api/hr/employees/:id         - Update employee

GET  /api/hr/attendance            - Attendance records
POST /api/hr/attendance            - Mark attendance

GET  /api/hr/leave-requests        - Leave requests
POST /api/hr/leave-requests        - Submit leave request
PUT  /api/hr/leave-requests/:id/status - Approve/reject leave

GET  /api/hr/departments           - List departments
POST /api/hr/departments           - Create department
```

### **Employee Dashboard**
```
GET  /api/dashboard/employee       - Employee dashboard
POST /api/dashboard/employee/checkin  - Quick check-in
POST /api/dashboard/employee/checkout - Quick check-out
GET  /api/dashboard/employee/profile  - Employee profile
PUT  /api/dashboard/employee/profile  - Update profile
```

### **Site Settings**
```
GET  /api/settings/public          - Public settings for frontend
GET  /api/settings                 - All settings (admin only)
POST /api/settings                 - Create setting
PUT  /api/settings/:key            - Update setting
PUT  /api/settings/bulk/update     - Bulk update settings
```

### **Media Management**
```
POST /api/media/upload/single      - Upload single file
POST /api/media/upload/multiple    - Upload multiple files
POST /api/media/upload/image       - Upload image only
POST /api/media/upload/video       - Upload video only

GET  /api/media                    - List media files
GET  /api/media/:id                - Get media file
PUT  /api/media/:id                - Update media file
DELETE /api/media/:id              - Delete media file

GET  /api/media/gallery             - Public gallery
GET  /api/media/hero                - Hero section media
GET  /api/media/serve/:filename     - Serve media file
```

## 🚀 Getting Started

### **1. Database Setup**
```bash
# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed default settings and admin
npm run db:seed
```

### **2. Environment Variables**
```env
# Add to .env file
ADMIN_EMAIL=admin@tripgo.com
ADMIN_PASSWORD=admin123456
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### **3. Create Upload Directories**
```bash
mkdir -p uploads/{images,videos,documents,temp}
```

### **4. Initialize Default Settings**
```bash
# Create default site settings
curl -X POST http://localhost:5000/api/settings/initialize/defaults \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 📁 Database Schema

### **New Tables Added:**
- **employees** - Employee records and professional details
- **departments** - Department organization and management
- **attendance** - Daily attendance tracking
- **leave_requests** - Leave application and approval workflow
- **payrolls** - Salary and payment management
- **performance** - Performance reviews and ratings
- **site_settings** - Dynamic site configuration
- **media_files** - File upload and media management

### **Enhanced User Roles:**
- `CUSTOMER` - Regular travel booking users
- `ADMIN` - Full system administration
- `HR_MANAGER` - HR operations and employee management
- `EMPLOYEE` - Company staff with HR access

## 🔧 File Upload Configuration

### **Supported Formats:**
- **Images**: JPEG, JPG, PNG, GIF, WebP (max 5MB)
- **Videos**: MP4, AVI, MOV, WMV, FLV, WebM (max 100MB)
- **Documents**: PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX (max 10MB)

### **Upload Endpoints:**
- `/api/media/upload/single` - Single file upload
- `/api/media/upload/multiple` - Multiple files
- `/api/media/upload/fields` - Organized by type (images, videos, documents)

### **File Serving:**
- Static files: `/uploads/{category}/{filename}`
- API endpoint: `/api/media/serve/{filename}?category=images`

## 🎯 Integration Examples

### **Frontend Site Settings Usage:**
```javascript
// Get public settings for frontend
const response = await fetch('/api/settings/public');
const settings = await response.json();

// Use in components
<h1>{settings.general.site_name.value}</h1>
<img src={settings.general.site_logo.value} alt="Logo" />
```

### **Employee Check-in Widget:**
```javascript
// Quick check-in functionality
const checkIn = async () => {
  const response = await fetch('/api/dashboard/employee/checkin', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  console.log(result.message); // "Checked in successfully at 9:15 AM"
};
```

### **Media Gallery Display:**
```javascript
// Get gallery images for homepage
const gallery = await fetch('/api/media/gallery?category=image&limit=12');
const images = await gallery.json();

// Display images
images.data.files.map(img => (
  <img key={img.id} src={img.url} alt={img.alt} />
))
```

This comprehensive HR module and site management system provides everything needed for employee management, content administration, and media handling in your TripGo platform!