import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const { data: userData, error } = await supabase.auth.getUser(token)
  
  if (error || !userData.user) {
    return null
  }

  return userData.user
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        from_account:accounts!transactions_from_account_id_fkey(id, name, type),
        to_account:accounts!transactions_to_account_id_fkey(id, name, type)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Transactions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      type, 
      amount, 
      description, 
      category, 
      date, 
      from_account_id, 
      to_account_id 
    } = body

    if (!type || !amount || !description || !category) {
      return NextResponse.json({ 
        error: 'Type, amount, description, and category are required' 
      }, { status: 400 })
    }

    if (type === 'transfer' && (!from_account_id || !to_account_id)) {
      return NextResponse.json({ 
        error: 'Transfer transactions require both from and to accounts' 
      }, { status: 400 })
    }

    if (type !== 'transfer' && !from_account_id) {
      return NextResponse.json({ 
        error: 'Account is required for income and expense transactions' 
      }, { status: 400 })
    }

    // Verify accounts belong to user
    if (from_account_id) {
      const { data: fromAccount, error: fromError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', from_account_id)
        .eq('user_id', user.id)
        .single()

      if (fromError || !fromAccount) {
        return NextResponse.json({ error: 'Invalid from account' }, { status: 400 })
      }
    }

    if (to_account_id) {
      const { data: toAccount, error: toError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', to_account_id)
        .eq('user_id', user.id)
        .single()

      if (toError || !toAccount) {
        return NextResponse.json({ error: 'Invalid to account' }, { status: 400 })
      }
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        type,
        amount: Math.abs(amount),
        description,
        category,
        date: date || new Date().toISOString(),
        from_account_id: from_account_id || null,
        to_account_id: to_account_id || null
      }])
      .select(`
        *,
        from_account:accounts!transactions_from_account_id_fkey(id, name, type),
        to_account:accounts!transactions_to_account_id_fkey(id, name, type)
      `)
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    // Update account balances
    if (type === 'income' && from_account_id) {
      await supabase.rpc('update_account_balance', {
        account_id: from_account_id,
        amount_change: amount
      })
    } else if (type === 'expense' && from_account_id) {
      await supabase.rpc('update_account_balance', {
        account_id: from_account_id,
        amount_change: -amount
      })
    } else if (type === 'transfer' && from_account_id && to_account_id) {
      await supabase.rpc('update_account_balance', {
        account_id: from_account_id,
        amount_change: -amount
      })
      await supabase.rpc('update_account_balance', {
        account_id: to_account_id,
        amount_change: amount
      })
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Transactions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
