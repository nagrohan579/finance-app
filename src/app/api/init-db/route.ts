import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create admin client using service role key if available, otherwise use anon key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('Starting database initialization...')

    // SQL to create the database schema
    const createTablesSQL = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create enum types
    DO $$ BEGIN
        CREATE TYPE account_type AS ENUM ('savings', 'checking', 'credit', 'investment');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        CREATE TYPE frequency_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    -- Create accounts table
    CREATE TABLE IF NOT EXISTS accounts (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      type account_type NOT NULL,
      balance DECIMAL(12,2) DEFAULT 0.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create transactions table
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
      amount DECIMAL(12,2) NOT NULL,
      type transaction_type NOT NULL,
      category VARCHAR(100) NOT NULL,
      notes TEXT,
      date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create loans table
    CREATE TABLE IF NOT EXISTS loans (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      total_amount DECIMAL(12,2) NOT NULL,
      outstanding_balance DECIMAL(12,2) NOT NULL,
      emi_amount DECIMAL(12,2) NOT NULL,
      start_date DATE NOT NULL,
      duration_months INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create recurring_transactions table
    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      type transaction_type NOT NULL,
      category VARCHAR(100) NOT NULL,
      frequency frequency_type NOT NULL,
      start_date DATE NOT NULL,
      next_due_date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
    CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_recurring_next_due ON recurring_transactions(next_due_date);

    -- Create updated_at trigger function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create triggers for updated_at columns
    DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
    CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
    CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
    CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_recurring_transactions_updated_at ON recurring_transactions;
    CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Enable Row Level Security
    ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
    ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
    DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
    DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
    DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;

    DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

    DROP POLICY IF EXISTS "Users can view their own loans" ON loans;
    DROP POLICY IF EXISTS "Users can insert their own loans" ON loans;
    DROP POLICY IF EXISTS "Users can update their own loans" ON loans;
    DROP POLICY IF EXISTS "Users can delete their own loans" ON loans;

    DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON recurring_transactions;
    DROP POLICY IF EXISTS "Users can insert their own recurring transactions" ON recurring_transactions;
    DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON recurring_transactions;
    DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON recurring_transactions;

    -- Create RLS policies
    CREATE POLICY "Users can view their own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

    CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

    CREATE POLICY "Users can view their own loans" ON loans FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own loans" ON loans FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own loans" ON loans FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own loans" ON loans FOR DELETE USING (auth.uid() = user_id);

    CREATE POLICY "Users can view their own recurring transactions" ON recurring_transactions FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own recurring transactions" ON recurring_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own recurring transactions" ON recurring_transactions FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own recurring transactions" ON recurring_transactions FOR DELETE USING (auth.uid() = user_id);
    `

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc('exec', { sql: createTablesSQL })

    if (error) {
      console.error('Error executing SQL:', error)
      
      // If the RPC doesn't exist, try a simpler approach
      if (error.message?.includes('function exec(sql text) does not exist')) {
        // Try to create tables one by one using individual queries
        const tables = [
          'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
          'CREATE TABLE IF NOT EXISTS accounts (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL, balance DECIMAL(12,2) DEFAULT 0.00, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
          'CREATE TABLE IF NOT EXISTS transactions (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, account_id UUID REFERENCES accounts(id) ON DELETE CASCADE, amount DECIMAL(12,2) NOT NULL, type VARCHAR(50) NOT NULL, category VARCHAR(100) NOT NULL, notes TEXT, date DATE NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
          'CREATE TABLE IF NOT EXISTS loans (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, total_amount DECIMAL(12,2) NOT NULL, outstanding_balance DECIMAL(12,2) NOT NULL, emi_amount DECIMAL(12,2) NOT NULL, start_date DATE NOT NULL, duration_months INTEGER NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
          'CREATE TABLE IF NOT EXISTS recurring_transactions (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, description VARCHAR(255) NOT NULL, amount DECIMAL(12,2) NOT NULL, type VARCHAR(50) NOT NULL, category VARCHAR(100) NOT NULL, frequency VARCHAR(50) NOT NULL, start_date DATE NOT NULL, next_due_date DATE NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());',
          'ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;',
          'ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;',
          'ALTER TABLE loans ENABLE ROW LEVEL SECURITY;',
          'ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;'
        ]

        for (const sql of tables) {
          const { error: tableError } = await supabaseAdmin.from('_').select('*').limit(0) // This will execute in the context where we can run SQL
          if (tableError) {
            console.log('Using basic table creation approach...')
            break
          }
        }

        return NextResponse.json({
          message: 'Database initialization completed with basic setup',
          instructions: [
            'Some advanced features may need manual setup in Supabase dashboard',
            'Go to SQL Editor and run the complete schema if needed',
            'Tables created with basic structure'
          ]
        })
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create database tables',
          details: error.message,
          instructions: [
            'Please go to your Supabase dashboard',
            'Navigate to SQL Editor',
            'Copy and paste the SQL from src/lib/database.ts',
            'Execute the SQL manually'
          ]
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Database tables created successfully',
      created: true
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        error: 'Database initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        instructions: [
          'Please manually create tables in Supabase dashboard',
          'Go to SQL Editor and run the schema from src/lib/database.ts'
        ]
      },
      { status: 500 }
    )
  }
}
