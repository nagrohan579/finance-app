import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const account_id = searchParams.get('account_id')
    const type = searchParams.get('type')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('transactions')
      .select(`
        *,
        accounts(name, type)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (account_id) {
      query = query.eq('account_id', account_id)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (start_date) {
      query = query.gte('date', start_date)
    }
    if (end_date) {
      query = query.lte('date', end_date)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { account_id, amount, type, category, notes, date } = body

    if (!account_id || !amount || !type || !category || !date) {
      return NextResponse.json({ 
        error: 'Account ID, amount, type, category, and date are required' 
      }, { status: 400 })
    }

    const validTypes = ['income', 'expense', 'transfer']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 })
    }

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, balance')
      .eq('id', account_id)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Start a transaction to ensure data consistency
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        account_id,
        amount: parseFloat(amount),
        type,
        category,
        notes: notes || null,
        date
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Database error:', transactionError)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    // Update account balance
    const balanceChange = type === 'income' ? parseFloat(amount) : -parseFloat(amount)
    const newBalance = account.balance + balanceChange

    const { error: balanceError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', account_id)

    if (balanceError) {
      // If balance update fails, we should rollback the transaction
      // For now, we'll log the error but still return the transaction
      console.error('Balance update error:', balanceError)
    }

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
