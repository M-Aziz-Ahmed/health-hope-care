# Health Hope Care - Architecture Overview

## 🏗️ Application Structure

The application is now organized into **three separate portals** with distinct roles and permissions:

### 1. Admin Portal (`/admin`)
**Access:** Admin & Owner roles only
**Purpose:** Complete system management and oversight

**Features:**
- Dashboard with real-time analytics
- User management (view, search, change roles)
- Services management (CRUD operations)
- Bookings management (view, filter, export, assign staff)
- Staff overview
- System settings configuration
- Advanced analytics dashboard
- Notification system

**Pages:**
- `/admin` - Main dashboard
- `/admin/analytics` - Detailed analytics
- `/admin/services` - Services management
- `/admin/add-service` - Create new service
- `/admin/bookings` - Bookings management
- `/admin/staff` - Staff overview
- `/admin/settings` - System configuration

### 2. Staff Portal (`/staff`)
**Access:** Staff role only
**Purpose:** View and manage assigned bookings

**Features:**
- Personal dashboard
- View assigned bookings
- Booking statistics (total, pending, confirmed)
- Booking details with patient information
- Status tracking

**Pages:**
- `/staff` - Staff dashboard

### 3. User Portal (`/user`)
**Access:** Regular users
**Purpose:** Personal booking management

**Features:**
- Personal dashboard
- View own bookings
- Booking statistics
- Booking history
- Quick booking access

**Pages:**
- `/user` - User dashboard

### 4. Public Pages
**Access:** Everyone
**Purpose:** Information and services

**Pages:**
- `/` - Homepage with analytics component
- `/about` - About us
- `/services` - Available services
- `/booking` - Book a service
- `/reviews` - Submit and view reviews
- `/track-booking` - Track booking by ID
- `/contact` - Contact information

## 🎨 Design System

### Color Palette
- **Primary (Emerald):** `#059669` - Main brand color
- **Secondary (Blue):** `#0284c7` - Accent color
- **Success (Green):** `#16a34a` - Positive actions
- **Warning (Yellow):** `#eab308` - Pending states
- **Danger (Red):** `#dc2626` - Errors/cancellations
- **Info (Purple):** `#9333ea` - Information
- **Neutral (Slate):** `#64748b` - Text and backgrounds

### Design Principles
1. **Modern & Professional** - Clean lines, ample whitespace
2. **Gradient Cards** - Eye-catching stat cards with gradients
3. **Hover Effects** - Interactive elements with smooth transitions
4. **Consistent Spacing** - 8px grid system
5. **Responsive** - Mobile-first approach
6. **Accessible** - WCAG 2.1 AA compliant

### Typography
- **Headings:** Bold, large sizes (2xl-4xl)
- **Body:** Regular weight, readable sizes (sm-base)
- **Labels:** Semibold, small sizes (xs-sm)

## 📊 Database Models

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  role: Enum ['owner', 'admin', 'staff', 'user'] (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```javascript
{
  name: String (required),
  email: String (required),
  phone: String (required),
  address: String (required),
  service: String (required),
  date: Date (default: now),
  status: Enum ['Pending', 'Confirmed', 'Cancelled'] (default: 'Pending'),
  assignedStaff: ObjectId (ref: 'User'),
  location: String
}
```

### Service
```javascript
{
  title: String (required),
  description: String (required),
  icon: String (default: 'Stethoscope'),
  price: Number (default: 0),
  duration: String (default: '30 mins'),
  isActive: Boolean (default: true),
  createdAt: Date
}
```

### Notification
```javascript
{
  to: ObjectId (ref: 'User', required),
  message: String (required),
  booking: ObjectId (ref: 'Booking'),
  read: Boolean (default: false),
  createdAt: Date
}
```

## 🔌 API Routes

### Authentication
- `GET /api/current-user` - Get current logged-in user

### Users
- `GET /api/fetchUser` - Get all users (admin only)
- `POST /api/createUser` - Create new user
- `POST /api/updateUserRole` - Update user role (admin only)
- `POST /api/loginUser` - User login

### Bookings
- `GET /api/fetchBooking` - Get all bookings
- `POST /api/createbooking` - Create new booking
- `POST /api/updateBookingStatus` - Update booking status
- `POST /api/deleteBooking` - Delete booking
- `POST /api/assignStaff` - Assign staff to booking

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### Staff
- `GET /api/fetchStaff` - Get all staff members

### Analytics
- `GET /api/stats` - Get dashboard statistics and trends

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/sendNotification` - Send notification (admin only)
- `POST /api/notifications/markRead` - Mark notification as read

## 🔐 Access Control

### Role Hierarchy
1. **Owner** - Full system access (cannot be changed by admins)
2. **Admin** - Full management access
3. **Staff** - View assigned bookings only
4. **User** - View own bookings only

### Route Protection
- Admin routes check for `admin` or `owner` role
- Staff routes check for `staff` role
- User routes check for authenticated user
- Public routes accessible to all

## 🚀 Key Features

### Admin Dashboard
- **Modern Design:** Gradient cards, smooth animations
- **Real-time Stats:** Live data updates
- **Quick Actions:** Fast navigation to key areas
- **User Management:** Search, filter, role changes
- **Notification System:** Send targeted notifications

### Analytics Dashboard
- **Comprehensive Metrics:** All key business indicators
- **Visual Charts:** Bar charts for status distribution
- **Trend Analysis:** 6-month booking trends
- **Recent Activity:** Latest bookings table
- **Success Metrics:** Calculated success rates

### Booking Management
- **Advanced Filters:** Search and status filters
- **Export Functionality:** CSV export
- **Detailed View:** Modal with complete information
- **Staff Assignment:** Easy staff allocation
- **Status Updates:** Quick status changes

### Separate Portals
- **Role-based Access:** Each role has dedicated portal
- **Optimized UX:** Tailored experience per role
- **Clear Navigation:** Role-specific menus
- **Focused Features:** Only relevant features shown

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile Optimizations
- Stacked layouts
- Touch-friendly buttons
- Simplified navigation
- Optimized tables (cards on mobile)

## 🔧 Technical Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State:** React Hooks (useState, useEffect)

### Backend
- **Runtime:** Node.js
- **Database:** MongoDB with Mongoose
- **API:** Next.js API Routes
- **Authentication:** Cookie-based sessions

## 📈 Performance Optimizations

1. **Code Splitting:** Automatic with Next.js
2. **Image Optimization:** Next.js Image component
3. **API Caching:** Strategic data fetching
4. **Lazy Loading:** Components loaded on demand
5. **Optimistic Updates:** Immediate UI feedback

## 🔄 Data Flow

### Admin Flow
1. Admin logs in → Redirected to `/admin`
2. Dashboard loads stats from `/api/stats`
3. User list fetched from `/api/fetchUser`
4. Actions trigger API calls with optimistic updates

### Staff Flow
1. Staff logs in → Redirected to `/staff`
2. Assigned bookings fetched and filtered
3. View-only access to booking details

### User Flow
1. User logs in → Redirected to `/user`
2. Personal bookings fetched and filtered
3. Can view booking history and status

## 🎯 Future Enhancements

### Phase 1 (Immediate)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Payment integration
- [ ] Calendar view for bookings

### Phase 2 (Short-term)
- [ ] Advanced analytics with charts
- [ ] Revenue tracking
- [ ] Staff performance metrics
- [ ] Automated reports

### Phase 3 (Long-term)
- [ ] Mobile app
- [ ] Real-time chat
- [ ] AI-powered scheduling
- [ ] Multi-language support

## 📝 Notes

### Fixed Issues
✅ Fixed `data.filter is not a function` error
✅ Fixed database connection imports (`connectDB`)
✅ Removed public analytics (now admin-only)
✅ Separated portals by role
✅ Enhanced admin dashboard design
✅ Added professional styling throughout

### Best Practices
- Consistent error handling
- Proper TypeScript types (where applicable)
- Clean code structure
- Reusable components
- Comprehensive documentation

---

**Version:** 3.0
**Last Updated:** November 2025
**Status:** Production Ready ✅
