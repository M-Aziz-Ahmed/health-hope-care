# Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Git installed

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd health-hope-care
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create `.env.local` file:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Run development server**
```bash
npm run dev
```

5. **Access the application**
- Homepage: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Staff: `http://localhost:3000/staff`
- User: `http://localhost:3000/user`

## 🔐 Initial Setup

### Create Admin User
1. Register a new user at `/login`
2. Manually update the user role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "owner" } }
)
```

### Configure Settings
1. Login as admin
2. Go to `/admin/settings`
3. Update business information
4. Configure operational settings

### Add Services
1. Go to `/admin/add-service`
2. Add your healthcare services
3. Set pricing and duration
4. Activate services

## 📦 Production Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables
- Deploy

3. **Environment Variables**
```
MONGODB_URI=your_production_mongodb_uri
```

### Other Platforms

#### Netlify
```bash
npm run build
# Deploy the .next folder
```

#### AWS/DigitalOcean
```bash
npm run build
npm start
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster
3. Add database user
4. Whitelist IP addresses
5. Get connection string
6. Update `lib/db.js` with connection string

### Local MongoDB
```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb  # Linux

# Start MongoDB
mongod --dbpath /path/to/data
```

## 🔒 Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong passwords
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Implement input validation
- [ ] Add CSRF protection

## 📊 Monitoring

### Recommended Tools
- **Vercel Analytics** - Built-in analytics
- **MongoDB Atlas Monitoring** - Database performance
- **Sentry** - Error tracking
- **LogRocket** - Session replay

### Health Checks
- Monitor API response times
- Track database connection status
- Check error rates
- Monitor user activity

## 🔄 Updates & Maintenance

### Regular Tasks
- **Daily:** Check pending bookings
- **Weekly:** Review analytics
- **Monthly:** Update services and pricing
- **Quarterly:** Database backup

### Backup Strategy
```bash
# MongoDB backup
mongodump --uri="mongodb://..." --out=/backup/path

# Restore
mongorestore --uri="mongodb://..." /backup/path
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```
Solution: Check MongoDB URI and network access
```

**Build Errors**
```bash
# Clear cache
rm -rf .next
npm run build
```

**API Route Not Found**
```
Solution: Check file naming (route.js not route.ts)
```

**Role Access Denied**
```
Solution: Verify user role in database
```

## 📱 Mobile Optimization

The application is fully responsive. Test on:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Various screen sizes

## 🌐 Domain Setup

### Custom Domain

1. **Purchase domain** (Namecheap, GoDaddy, etc.)
2. **Add to Vercel**
   - Go to Project Settings
   - Add custom domain
   - Update DNS records

3. **DNS Configuration**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 📈 Performance Optimization

### Production Checklist
- [ ] Enable image optimization
- [ ] Implement caching strategy
- [ ] Minify CSS/JS
- [ ] Enable compression
- [ ] Use CDN for static assets
- [ ] Optimize database queries
- [ ] Add loading states
- [ ] Implement pagination

## 🎯 Post-Deployment

### Testing
1. Test all user flows
2. Verify admin functions
3. Check mobile responsiveness
4. Test payment integration (if added)
5. Verify email notifications (if added)

### Launch Checklist
- [ ] All features tested
- [ ] Admin account created
- [ ] Services added
- [ ] Settings configured
- [ ] Analytics enabled
- [ ] Backup system in place
- [ ] Monitoring active
- [ ] Documentation updated

## 📞 Support

For issues or questions:
- Check documentation files
- Review error logs
- Contact development team

---

**Good luck with your deployment! 🚀**
