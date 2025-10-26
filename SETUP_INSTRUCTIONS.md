# HMS SaaS - Complete Setup Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Razorpay account (for payments)

### Environment Setup

1. **Copy environment files:**
```bash
cp .env.example .env
```

2. **Configure database (Supabase):**
```env
DATABASE_URL="postgresql://[user]:[password]@[host]:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://[user]:[password]@[host]:5432/postgres"
```

3. **Configure authentication:**
```env
JWT_SECRET=your_strong_jwt_secret_key_here
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

4. **Configure Razorpay (for payments):**
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Setup database:**
```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

3. **Start development servers:**
```bash
npm run dev
```

This will start:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

## 📝 Demo Credentials

After running the seed script, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@demohospital.com | Demo@123 |
| Admin | admin@demohospital.com | Demo@123 |
| Doctor | doctor@demohospital.com | Demo@123 |
| Nurse | nurse@demohospital.com | Demo@123 |
| Receptionist | receptionist@demohospital.com | Demo@123 |

## 🏗️ Project Structure

```
HMS/
├── apps/
│   ├── api/          # NestJS Backend
│   │   ├── src/      # Source code
│   │   └── prisma/   # Database schema & migrations
│   └── web/          # Next.js Frontend
│       └── src/      # Source code
├── scripts/          # Utility scripts
└── docs/            # Documentation
```

## 🔑 Key Features

### Backend (NestJS)
- ✅ JWT Authentication with Supabase support
- ✅ Role-Based Access Control (RBAC)
- ✅ Multi-tenant architecture
- ✅ Comprehensive API modules:
  - Patient Management
  - Appointment Scheduling
  - Billing & Invoicing
  - Pharmacy Management
  - Laboratory Management
  - Inventory Tracking
  - Staff Management
  - Reports & Analytics

### Frontend (Next.js)
- ✅ Modern React with TypeScript
- ✅ Mantine UI Components
- ✅ RBAC-based UI restrictions
- ✅ Real-time data updates
- ✅ Responsive design
- ✅ Dashboard with analytics

### Database (PostgreSQL/Supabase)
- ✅ Comprehensive schema with 50+ tables
- ✅ Multi-tenant data isolation
- ✅ Audit logging
- ✅ Soft deletes

### Payments (Razorpay)
- ✅ Subscription management
- ✅ Multiple pricing plans
- ✅ Webhook integration
- ✅ Payment history

## 🚀 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables
4. Deploy with:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

### Frontend (Vercel)
1. Import project to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
3. Deploy

### Database (Supabase)
1. Create a new Supabase project
2. Run migrations:
```bash
npx prisma migrate deploy
```
3. Run seed (optional):
```bash
npx prisma db seed
```

## 🔧 Common Commands

### Backend
```bash
cd apps/api
npm run start:dev     # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter
```

### Frontend
```bash
cd apps/web
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
```

### Database
```bash
cd apps/api
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev   # Create migration
npx prisma db seed   # Seed database
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correct
- Check if database is accessible
- For Supabase, use port 6543 for pooled connections

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure CORS is configured correctly

### Build Errors
- Clear node_modules and reinstall
- Run `npx prisma generate`
- Check TypeScript errors with `npx tsc --noEmit`

## 📚 API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: http://localhost:3001/api-docs

## 🤝 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review existing issues on GitHub
3. Contact support team

## 📄 License

This project is proprietary software. All rights reserved.
