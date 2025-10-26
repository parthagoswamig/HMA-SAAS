# HMS SaaS - Hospital Management System

A comprehensive, production-ready SaaS Hospital Management System built with modern technologies.

## 🚀 Features

### Core Modules
- **Patient Management**: Complete patient records, registration, and history
- **Appointment Scheduling**: Advanced appointment booking and management
- **Billing & Invoicing**: Comprehensive billing with multiple payment methods
- **Pharmacy Management**: Medicine inventory and prescription handling
- **Laboratory Management**: Lab test orders and results
- **Inventory Management**: Medical supplies and equipment tracking
- **Staff Management**: Employee records and shift scheduling
- **RBAC System**: Role-based access control with 70+ permissions

### Advanced Features
- **Multi-tenancy**: Complete tenant isolation for multiple hospitals
- **Subscription Management**: Razorpay integration for SaaS billing
- **Real-time Dashboard**: Live statistics and analytics
- **Audit Logging**: Complete activity tracking
- **Report Generation**: Comprehensive reporting system
- **Telemedicine**: Video consultation support
- **Emergency Management**: ER and critical care workflows

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT + Supabase Auth
- **Payments**: Razorpay & Stripe
- **API Documentation**: Swagger

### Frontend
- **Framework**: Next.js 15 (React)
- **UI Library**: Mantine UI
- **State Management**: Zustand
- **API Client**: Axios with interceptors
- **Charts**: Recharts
- **Forms**: React Hook Form

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Backend Hosting**: Render
- **Frontend Hosting**: Vercel
- **File Storage**: Supabase Storage

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or Supabase account)
- Razorpay account (for payments)
- Git

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/hms-saas.git
cd hms-saas
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup

#### Backend (.env in apps/api/)
```bash
cp .env.example apps/api/.env
# Edit apps/api/.env with your configuration
```

#### Frontend (.env.local in apps/web/)
```bash
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your configuration
```

### 4. Database Setup

#### Using Supabase (Recommended)
1. Create a Supabase project at https://supabase.com
2. Copy the database URL and keys to your .env file
3. Run migrations:
```bash
cd apps/api
npm run prisma:migrate:deploy
```

#### Using Local PostgreSQL
1. Create a PostgreSQL database
2. Update DATABASE_URL in .env
3. Run migrations:
```bash
cd apps/api
npm run prisma:migrate
```

### 5. Seed Initial Data
```bash
cd apps/api
npm run prisma:seed
```

This creates:
- Default tenant (hospital)
- Admin user (email: admin@hospital.com, password: Admin@123)
- System permissions and roles
- Sample departments and lab tests

## 🚀 Running the Application

### Development Mode

#### Start both frontend and backend:
```bash
npm run dev
```

#### Or start separately:
```bash
# Backend (port 3001)
cd apps/api
npm run start:dev

# Frontend (port 3000)
cd apps/web
npm run dev
```

### Production Mode

#### Build:
```bash
npm run build
```

#### Start:
```bash
npm run start
```

## 📱 Default Login Credentials

After seeding:
- **Email**: admin@hospital.com
- **Password**: Admin@123

## 🔐 Role-Based Access Control

### System Roles
1. **SUPER_ADMIN**: Full system access
2. **HOSPITAL_ADMIN**: Complete hospital management
3. **DOCTOR**: Patient care and medical records
4. **NURSE**: Patient care support
5. **RECEPTIONIST**: Appointments and registration
6. **PHARMACIST**: Pharmacy operations
7. **LAB_TECHNICIAN**: Laboratory management
8. **ACCOUNTANT**: Billing and finance
9. **PATIENT**: Patient portal access

### Permission Categories
- Patient Management (view, create, update, delete, export)
- Appointment Management
- Billing & Payments
- Pharmacy Operations
- Laboratory Management
- Inventory Control
- Staff Management
- System Settings
- Reports & Analytics

## 💳 Payment Integration

### Razorpay Setup
1. Create account at https://razorpay.com
2. Get API keys from Dashboard
3. Configure webhook endpoint: `https://your-api-url/subscription/razorpay/webhook`
4. Add webhook secret to .env

### Subscription Plans
- **Free Trial**: 14-day trial
- **Basic**: ₹4,999/month - Small clinics
- **Professional**: ₹14,999/month - Hospitals
- **Enterprise**: ₹49,999/month - Large hospitals

## 🚢 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - Build Command: `cd apps/api && npm install && npm run build`
   - Start Command: `cd apps/api && npm run start:prod`
4. Add environment variables
5. Deploy

### Frontend Deployment (Vercel)

1. Import project to Vercel
2. Configure:
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
3. Add environment variables
4. Deploy

### Database (Supabase)
1. Project is automatically managed by Supabase
2. Enable Row Level Security (RLS) for production
3. Configure connection pooling for better performance

## 📊 API Documentation

Swagger documentation available at:
- Development: http://localhost:3001/api-docs
- Production: https://your-api-url/api-docs

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Project Structure

```
HMS/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/      # Authentication
│   │   │   ├── patients/  # Patient module
│   │   │   ├── rbac/      # Role-based access
│   │   │   └── ...        # Other modules
│   │   └── prisma/        # Database schema
│   │
│   └── web/              # Next.js frontend
│       ├── src/
│       │   ├── app/       # App router pages
│       │   ├── components/# React components
│       │   ├── services/  # API services
│       │   └── lib/       # Utilities
│       └── public/        # Static assets
│
├── docs/                  # Documentation
└── scripts/              # Utility scripts
```

## 🔒 Security Features

- JWT-based authentication
- Supabase Auth integration
- Role-based access control (RBAC)
- Tenant isolation
- Rate limiting
- Input validation
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration
- Audit logging

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, email support@hms-saas.com or create an issue in the repository.

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Supabase for the database platform
- Vercel and Render for hosting
- All contributors and users

---

**Built with ❤️ for Healthcare**
