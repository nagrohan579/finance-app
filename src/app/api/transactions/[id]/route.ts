import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: { id: string }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, type, category, notes, date } = body
    const transactionId = params.id

    // Get existing transaction to calculate balance difference
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, accounts(balance)')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (type) updateData.type = type
    if (category) updateData.category = category
    if (notes !== undefined) updateData.notes = notes
    if (date) updateData.date = date

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
    }

    // Update account balance if amount or type changed
    if (amount !== undefined || type) {
      const oldBalanceChange = existingTransaction.type === 'income' ? 
        existingTransaction.amount : -existingTransaction.amount
      const newBalanceChange = (type || existingTransaction.type) === 'income' ? 
        (amount !== undefined ? parseFloat(amount) : existingTransaction.amount) : 
        -(amount !== undefined ? parseFloat(amount) : existingTransaction.amount)
      
      const balanceDifference = newBalanceChange - oldBalanceChange
      const currentBalance = existingTransaction.accounts.balance
      const newBalance = currentBalance + balanceDifference

      const { error: balanceError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', existingTransaction.account_id)

      if (balanceError) {
        console.error('Balance update error:', balanceError)
      }
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transactionId = params.id

    // Get transaction to reverse balance change
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, accounts(balance)')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Delete transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
    }

    // Reverse the balance change
    const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount
    const newBalance = transaction.accounts.balance + balanceChange

    const { error: balanceError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', transaction.account_id)

    if (balanceError) {
      console.error('Balance update error:', balanceError)
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
