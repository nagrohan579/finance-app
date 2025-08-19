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

    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching loans:', error)
      return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 })
    }

    return NextResponse.json(loans)
  } catch (error) {
    console.error('Loans API error:', error)
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
      name, 
      amount, 
      interest_rate, 
      term_months, 
      emi_amount, 
      start_date, 
      lender,
      type 
    } = body

    if (!name || !amount || !interest_rate || !term_months || !emi_amount) {
      return NextResponse.json({ 
        error: 'Name, amount, interest rate, term, and EMI amount are required' 
      }, { status: 400 })
    }

    const { data: loan, error } = await supabase
      .from('loans')
      .insert([{
        user_id: user.id,
        name,
        amount: Math.abs(amount),
        interest_rate,
        term_months,
        emi_amount: Math.abs(emi_amount),
        start_date: start_date || new Date().toISOString(),
        lender: lender || '',
        type: type || 'personal',
        outstanding_amount: amount
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating loan:', error)
      return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 })
    }

    return NextResponse.json(loan, { status: 201 })
  } catch (error) {
    console.error('Loans API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
