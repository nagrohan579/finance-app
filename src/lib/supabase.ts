import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Account {
  id: string
  user_id: string
  name: string
  type: 'savings' | 'checking' | 'credit' | 'investment'
  balance: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category: string
  notes?: string
  date: string
  created_at: string
  updated_at: string
}

export interface Loan {
  id: string
  user_id: string
  name: string
  total_amount: number
  outstanding_balance: number
  emi_amount: number
  start_date: string
  duration_months: number
  created_at: string
  updated_at: string
}

export interface RecurringTransaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  next_due_date: string
  created_at: string
  updated_at: string
}
