# Quick Start Guide - Admin Portal

## What Was Added

Your admin portal now has **6 major new features** with complete functionality:

### 🎯 New Admin Pages

1. **Dashboard** (`/admin`) - Enhanced with real-time analytics
2. **Services Management** (`/admin/services`) - Manage all healthcare services
3. **Staff Management** (`/admin/staff`) - View and search staff members
4. **Bookings** (`/admin/bookings`) - Enhanced with search, filters, and export
5. **Add Service** (`/admin/add-service`) - Create new services with pricing
6. **Settings** (`/admin/settings`) - Configure system settings

### 📊 Dashboard Features
- Total users, bookings, pending bookings, and staff count
- Quick action cards for easy navigation
- User management with search functionality
- Send notifications to users

### 🛠️ Services Management
- Create, view, edit, and delete services
- Set pricing and duration for each service
- Toggle active/inactive status
- Search services by title or description

### 👥 Staff Management
- View all staff members in one place
- Search by name or email
- See join dates and roles
- Staff count statistics

### 📅 Enhanced Bookings
- Search by name, service, or phone number
- Filter by status (Pending, Confirmed, Cancelled)
- View detailed booking information in modal
- Export bookings to CSV file
- Assign staff to bookings
- Quick status updates

### ⚙️ Admin Settings
- Configure business information
- Set operational hours and policies
- Manage service radius
- Set currency preferences
- Emergency contact management

## How to Use

### 1. Start Your Development Server
```bash
npm run dev
```

### 2. Access Admin Portal
Navigate to: `http://localhost:3000/admin`

### 3. Explore New Features

**Dashboard:**
- View real-time statistics at the top
- Use quick action cards to navigate
- Search users in the table below
- Send notifications using the button

**Services:**
- Click "Services" card or go to `/admin/services`
- Click "Add Service" to create new services
- Toggle active/inactive for each service
- Delete services you no longer offer

**Bookings:**
- Click "Bookings" card or go to `/admin/bookings`
- Use search bar to find specific bookings
- Filter by status dropdown
- Click "View" to see full details
- Click "Export CSV" to download data

**Staff:**
- Click "Staff" card or go to `/admin/staff`
- View all staff members
- Use search to find specific staff

**Settings:**
- Click settings icon or go to `/admin/settings`
- Update business information
- Configure operational settings
- Click "Save Settings" when done

## New Database Model

A new `Service` model has been created with the following fields:
- `title` - Service name
- `description` - Service description
- `icon` - Icon name (Lucide icons)
- `price` - Service price
- `duration` - Service duration
- `isActive` - Active/inactive status

## New API Routes

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### Stats
- `GET /api/stats` - Get dashboard statistics

## Files Created/Modified

### New Files:
- `app/admin/services/page.jsx`
- `app/admin/staff/page.jsx`
- `app/admin/settings/page.jsx`
- `app/api/services/route.js`
- `app/api/services/[id]/route.js`
- `app/api/stats/route.js`
- `models/Service.js`

### Modified Files:
- `app/admin/page.jsx` - Enhanced with analytics
- `app/admin/bookings/page.jsx` - Added search, filters, export
- `app/admin/add-service/page.jsx` - Connected to backend

## Testing Checklist

✅ Dashboard loads with statistics
✅ Services page shows all services
✅ Can create new services
✅ Can toggle service active/inactive
✅ Can delete services
✅ Bookings page has search and filters
✅ Can export bookings to CSV
✅ Can view booking details in modal
✅ Staff page shows all staff members
✅ Settings page loads and saves
✅ User search works on dashboard

## Next Steps

1. **Test all features** in your browser
2. **Add real data** to see the portal in action
3. **Customize styling** if needed
4. **Add more features** from the optional enhancements list

## Need Help?

Check `ADMIN_FEATURES.md` for detailed documentation of all features.

---

**Note:** Make sure your MongoDB connection is working and you have the necessary user roles (admin) set up to access the admin portal.
