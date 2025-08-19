# Personal Finance Tracker

A comprehensive personal finance tracking application built with Next.js, Supabase, and Framer Motion. Track your income, expenses, accounts, and loans with beautiful animations and real-time insights.

## Features

### ✅ Completed Features
- **Authentication System**: Secure user registration and login with Supabase Auth
- **Dashboard**: Beautiful overview with key financial metrics and visual charts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean interface with Framer Motion animations
- **Database Schema**: Complete database structure for financial data
- **API Endpoints**: Full REST API for all CRUD operations

### 🚧 Coming Soon
- Transaction Management (Add, Edit, Delete)
- Account Management
- Loan Tracking
- Recurring Transactions
- AI-Powered Insights
- Data Export Features

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Hosting**: Vercel

## Database Schema

The application includes the following tables:

### Accounts
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `name` (VARCHAR)
- `type` (ENUM: savings, checking, credit, investment)
- `balance` (DECIMAL)
- `created_at`, `updated_at` (TIMESTAMP)

### Transactions
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `account_id` (UUID, Foreign Key to accounts)
- `amount` (DECIMAL)
- `type` (ENUM: income, expense, transfer)
- `category` (VARCHAR)
- `notes` (TEXT)
- `date` (DATE)
- `created_at`, `updated_at` (TIMESTAMP)

### Loans
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `name` (VARCHAR)
- `total_amount` (DECIMAL)
- `outstanding_balance` (DECIMAL)
- `emi_amount` (DECIMAL)
- `start_date` (DATE)
- `duration_months` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMP)

### Recurring Transactions
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `description` (VARCHAR)
- `amount` (DECIMAL)
- `type` (ENUM: income, expense)
- `category` (VARCHAR)
- `frequency` (ENUM: daily, weekly, monthly, yearly)
- `start_date`, `next_due_date` (DATE)
- `created_at`, `updated_at` (TIMESTAMP)

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd finance-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_PASSWORD=your_password_here

# Database URL for direct connection (optional)
DATABASE_URL=postgresql://postgres:${SUPABASE_PASSWORD}@db.your-project.supabase.co:5432/postgres
```

### 4. Database Setup
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL from `src/lib/database.ts` (the `createTablesSQL` constant)
4. Execute the SQL to create all required tables, indexes, and policies

### 5. Run the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- Authentication is handled by Supabase Auth UI components

### Accounts
- `GET /api/accounts` - Fetch user accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account

### Transactions
- `GET /api/transactions` - Fetch transactions (with filtering)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Loans
- `GET /api/loans` - Fetch user loans
- `POST /api/loans` - Create new loan

### Dashboard
- `GET /api/dashboard` - Get aggregated dashboard data

### Database Initialization
- `POST /api/init-db` - Check database status and get setup instructions

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   └── page.tsx       # Main application
├── components/
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard components
│   └── layout/        # Layout components
├── context/           # React contexts
├── lib/              # Utility functions and configurations
└── types/            # TypeScript type definitions
```

## Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **User Isolation**: Users can only access their own data
- **Authentication Required**: All API endpoints require authentication
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Supabase

## Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Next.js and Supabase
