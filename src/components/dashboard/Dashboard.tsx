'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardStats from './DashboardStats'
import RecentTransactions from './RecentTransactions'
import SpendingChart from './SpendingChart'
import DatabaseSetup from '../setup/DatabaseSetup'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle } from 'lucide-react'

interface Account {
  id: string
  name: string
  type: string
  balance: number
}

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category: string
  date: string
  notes?: string
  accounts: {
    name: string
  }
}

interface Loan {
  id: string
  amount: number
  outstanding: number
  emi: number
}

interface DashboardData {
  summary: {
    totalBalance: number
    monthlyIncome: number
    monthlyExpense: number
    netCashFlow: number
    totalLoanAmount: number
    totalEMI: number
  }
  accounts: {
    total: number
    byType: Record<string, { count: number, balance: number }>
    list: Account[]
  }
  transactions: {
    monthlyCount: number
    spendingByCategory: Record<string, number>
    recent: Transaction[]
  }
  loans: {
    total: number
    totalOutstanding: number
    totalEMI: number
    list: Loan[]
  }
  period: {
    month: string
    startDate: string
    endDate: string
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      setNeedsSetup(false)
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid session found')
      }
      
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Check if it's a database setup issue
        if (response.status === 500 || errorData.error?.includes('relation') || errorData.error?.includes('table')) {
          setNeedsSetup(true)
          return
        }
        
        throw new Error(errorData.error || 'Failed to fetch dashboard data')
      }
      
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      
      // Check if it's a database-related error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      if (errorMessage.includes('relation') || errorMessage.includes('table') || errorMessage.includes('does not exist')) {
        setNeedsSetup(true)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (needsSetup) {
    return <DatabaseSetup />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <motion.button
            onClick={fetchDashboardData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's an overview of your finances for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <DashboardStats data={data.summary} />

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SpendingChart data={data.transactions.spendingByCategory} />
          <RecentTransactions transactions={data.transactions.recent} />
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Accounts
            </h3>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {data.accounts.total}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total accounts
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Transactions
            </h3>
            <p className="text-3xl font-bold text-green-600 mb-1">
              {data.transactions.monthlyCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This month
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Active Loans
            </h3>
            <p className="text-3xl font-bold text-orange-600 mb-1">
              {data.loans.total}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current loans
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
