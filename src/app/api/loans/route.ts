import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 })
    }

    return NextResponse.json({ loans })
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
    const { name, total_amount, outstanding_balance, emi_amount, start_date, duration_months } = body

    if (!name || !total_amount || !outstanding_balance || !emi_amount || !start_date || !duration_months) {
      return NextResponse.json({ 
        error: 'All loan fields are required' 
      }, { status: 400 })
    }

    const { data: loan, error } = await supabase
      .from('loans')
      .insert({
        user_id: user.id,
        name,
        total_amount: parseFloat(total_amount),
        outstanding_balance: parseFloat(outstanding_balance),
        emi_amount: parseFloat(emi_amount),
        start_date,
        duration_months: parseInt(duration_months)
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 })
    }

    return NextResponse.json({ loan }, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
