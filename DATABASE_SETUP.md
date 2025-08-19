# Database Setup Instructions

## Supabase Configuration

1. **Environment Variables**: Update your `.env.local` file with your actual Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jrcqvuyuvmxgphqlgphy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   SUPABASE_PASSWORD=your_actual_password
   ```

2. **Database Schema Setup**: 
   - Go to your Supabase dashboard (https://supabase.com/dashboard)
   - Navigate to SQL Editor
   - Copy and paste the SQL from `src/lib/database.ts` (the `createTablesSQL` constant)
   - Execute the SQL to create all required tables, indexes, and policies

## Tables Created

The database will include the following tables:
- `accounts` - User financial accounts
- `transactions` - All financial transactions
- `loans` - User loans and EMIs
- `recurring_transactions` - Recurring income/expenses like SIPs

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Authentication policies are enforced at the database level

## Testing the Setup

After setting up the database, you can test the connection by:
1. Starting the development server: `npm run dev`
2. Visiting `/api/init-db` to check database status
3. Creating a user account through the auth flow
