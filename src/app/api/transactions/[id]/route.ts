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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, description, category, date, from_account_id, to_account_id } = body
    const transactionId = params.id

    // Get existing transaction
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Revert old balance changes
    if (existingTransaction.type === 'income' && existingTransaction.from_account_id) {
      await supabase.rpc('update_account_balance', {
        account_id: existingTransaction.from_account_id,
        amount_change: -existingTransaction.amount
      })
    } else if (existingTransaction.type === 'expense' && existingTransaction.from_account_id) {
      await supabase.rpc('update_account_balance', {
        account_id: existingTransaction.from_account_id,
        amount_change: existingTransaction.amount
      })
    } else if (existingTransaction.type === 'transfer') {
      if (existingTransaction.from_account_id) {
        await supabase.rpc('update_account_balance', {
          account_id: existingTransaction.from_account_id,
          amount_change: existingTransaction.amount
        })
      }
      if (existingTransaction.to_account_id) {
        await supabase.rpc('update_account_balance', {
          account_id: existingTransaction.to_account_id,
          amount_change: -existingTransaction.amount
        })
      }
    }

    // Update transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({
        type: type || existingTransaction.type,
        amount: amount !== undefined ? Math.abs(amount) : existingTransaction.amount,
        description: description || existingTransaction.description,
        category: category || existingTransaction.category,
        date: date || existingTransaction.date,
        from_account_id: from_account_id !== undefined ? from_account_id : existingTransaction.from_account_id,
        to_account_id: to_account_id !== undefined ? to_account_id : existingTransaction.to_account_id
      })
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .select(`
        *,
        from_account:accounts!transactions_from_account_id_fkey(id, name, type),
        to_account:accounts!transactions_to_account_id_fkey(id, name, type)
      `)
      .single()

    if (error) {
      console.error('Error updating transaction:', error)
      return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
    }

    // Apply new balance changes
    const newType = type || existingTransaction.type
    const newAmount = amount !== undefined ? Math.abs(amount) : existingTransaction.amount
    const newFromAccountId = from_account_id !== undefined ? from_account_id : existingTransaction.from_account_id
    const newToAccountId = to_account_id !== undefined ? to_account_id : existingTransaction.to_account_id

    if (newType === 'income' && newFromAccountId) {
      await supabase.rpc('update_account_balance', {
        account_id: newFromAccountId,
        amount_change: newAmount
      })
    } else if (newType === 'expense' && newFromAccountId) {
      await supabase.rpc('update_account_balance', {
        account_id: newFromAccountId,
        amount_change: -newAmount
      })
    } else if (newType === 'transfer') {
      if (newFromAccountId) {
        await supabase.rpc('update_account_balance', {
          account_id: newFromAccountId,
          amount_change: -newAmount
        })
      }
      if (newToAccountId) {
        await supabase.rpc('update_account_balance', {
          account_id: newToAccountId,
          amount_change: newAmount
        })
      }
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Transaction update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transactionId = params.id

    // Get existing transaction
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Revert balance changes
    if (existingTransaction.type === 'income' && existingTransaction.from_account_id) {
      await supabase.rpc('update_account_balance', {
        account_id: existingTransaction.from_account_id,
        amount_change: -existingTransaction.amount
      })
    } else if (existingTransaction.type === 'expense' && existingTransaction.from_account_id) {
      await supabase.rpc('update_account_balance', {
        account_id: existingTransaction.from_account_id,
        amount_change: existingTransaction.amount
      })
    } else if (existingTransaction.type === 'transfer') {
      if (existingTransaction.from_account_id) {
        await supabase.rpc('update_account_balance', {
          account_id: existingTransaction.from_account_id,
          amount_change: existingTransaction.amount
        })
      }
      if (existingTransaction.to_account_id) {
        await supabase.rpc('update_account_balance', {
          account_id: existingTransaction.to_account_id,
          amount_change: -existingTransaction.amount
        })
      }
    }

    // Delete transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting transaction:', error)
      return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Transaction delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
