import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Create a new supabase client for this request
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    // Get current month's start and end dates
    const startDate = `${month}-01`
    const endDate = `${month}-31`

    // Fetch accounts summary
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, name, type, balance')
      .eq('user_id', user.id)

    if (accountsError) {
      console.error('Accounts error:', accountsError)
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
    }

    // Fetch current month's transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('amount, type, category, date')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    if (transactionsError) {
      console.error('Transactions error:', transactionsError)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Fetch loans
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('name, outstanding_balance, emi_amount, total_amount')
      .eq('user_id', user.id)

    if (loansError) {
      console.error('Loans error:', loansError)
      return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 })
    }

    // Calculate metrics
    const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) || 0
    
    const monthlyIncome = transactions?.reduce((sum, transaction) => {
      return transaction.type === 'income' ? sum + transaction.amount : sum
    }, 0) || 0

    const monthlyExpense = transactions?.reduce((sum, transaction) => {
      return transaction.type === 'expense' ? sum + transaction.amount : sum
    }, 0) || 0

    // Spending by category
    const spendingByCategory = transactions?.reduce((categories: Record<string, number>, transaction) => {
      if (transaction.type === 'expense') {
        categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount
      }
      return categories
    }, {}) || {}

    // Account type breakdown
    const accountsByType = accounts?.reduce((types: Record<string, { count: number, balance: number }>, account) => {
      if (!types[account.type]) {
        types[account.type] = { count: 0, balance: 0 }
      }
      types[account.type].count++
      types[account.type].balance += account.balance
      return types
    }, {}) || {}

    // Loan summary
    const totalLoanAmount = loans?.reduce((sum, loan) => sum + loan.outstanding_balance, 0) || 0
    const totalEMI = loans?.reduce((sum, loan) => sum + loan.emi_amount, 0) || 0

    // Recent transactions (last 5)
    const { data: recentTransactions, error: recentError } = await supabase
      .from('transactions')
      .select(`
        id, amount, type, category, date, notes,
        accounts(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) {
      console.error('Recent transactions error:', recentError)
    }

    const dashboardData = {
      summary: {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        netCashFlow: monthlyIncome - monthlyExpense,
        totalLoanAmount,
        totalEMI
      },
      accounts: {
        total: accounts?.length || 0,
        byType: accountsByType,
        list: accounts || []
      },
      transactions: {
        monthlyCount: transactions?.length || 0,
        spendingByCategory,
        recent: recentTransactions || []
      },
      loans: {
        total: loans?.length || 0,
        totalOutstanding: totalLoanAmount,
        totalEMI,
        list: loans || []
      },
      period: {
        month,
        startDate,
        endDate
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
