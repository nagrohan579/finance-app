# Personal Finance Tracker

A modern personal finance management application built with Next.js 15, Supabase, and deployed on Vercel.

## 🚀 Features

- **Account Management**: Track multiple accounts (savings, checking, credit, investment)
- **Transaction Tracking**: Record income, expenses, and transfers between accounts
- **Dashboard Analytics**: Visual insights into spending patterns and financial health
- **Loan Management**: Track loans and EMI payments
- **Secure Authentication**: User authentication and data security with Supabase
- **Real-time Updates**: Live balance calculations and transaction history
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Lucide React** for icons

### Backend
- **Vercel Functions** (serverless API routes)
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security (RLS)

### Deployment
- **Vercel** for hosting and serverless functions
- **Automatic deployments** from Git

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # Vercel Functions
│   │   ├── accounts/          # Account management endpoints
│   │   ├── transactions/      # Transaction endpoints
│   │   ├── loans/            # Loan management endpoints
│   │   ├── dashboard/        # Dashboard data endpoint
│   │   └── init-db/          # Database initialization
│   ├── auth/                  # Authentication pages
│   └── page.tsx              # Main application
├── components/
│   ├── accounts/             # Account management UI
│   ├── transactions/         # Transaction management UI
│   ├── dashboard/            # Dashboard components
│   ├── auth/                 # Authentication components
│   ├── layout/               # Layout components
│   └── setup/                # Database setup helper
├── context/                  # React Context providers
└── lib/                      # Utilities and configurations
```

## 🔧 API Endpoints (Vercel Functions)

### Accounts
- `GET /api/accounts` - List user accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account

### Transactions
- `GET /api/transactions` - List user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Dashboard
- `GET /api/dashboard` - Get dashboard analytics data

### Loans
- `GET /api/loans` - List user loans
- `POST /api/loans` - Create new loan

### Database
- `POST /api/init-db` - Initialize database tables (development only)

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security ensuring users can only access their own data
- **JWT Authentication**: Secure token-based authentication with Supabase
- **API Route Protection**: All API endpoints require valid authentication
- **Environment Variables**: Sensitive configuration stored securely

## 🛠️ Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📊 Database Schema

The application uses three main tables:

- **accounts**: User bank accounts and financial accounts
- **transactions**: Financial transactions (income, expense, transfers)
- **loans**: Loan tracking and management

## 🚀 Deployment

This app is optimized for Vercel deployment:

1. **Automatic Deployments**: Connected to Git for continuous deployment
2. **Serverless Functions**: API routes run as Vercel Functions
3. **Edge Optimization**: Fast global delivery via Vercel's Edge Network
4. **Environment Management**: Secure environment variable handling

## 📈 Performance Optimizations

- **Server-Side Rendering**: Fast initial page loads
- **API Route Caching**: Efficient data fetching
- **Optimized Bundle**: Tree-shaking and code splitting
- **Image Optimization**: Automatic image optimization
- **Edge Functions**: Low-latency API responses

## 🔄 Real-time Features

- **Balance Updates**: Automatic balance calculations on transactions
- **Live Dashboard**: Real-time financial analytics
- **Instant UI Updates**: Optimistic updates for better UX

This finance tracker provides a complete solution for personal financial management with enterprise-grade security and performance.
