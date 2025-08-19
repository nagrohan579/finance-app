'use client'

import { motion } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft,
  Calendar,
  CreditCard
} from 'lucide-react'

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

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight className="w-5 h-5 text-green-600" />
      case 'expense':
        return <ArrowDownLeft className="w-5 h-5 text-red-600" />
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-blue-600" />
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />
    }
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600'
      case 'expense':
        return 'text-red-600'
      case 'transfer':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </motion.button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Start by adding your first transaction
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {transaction.category}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{transaction.accounts.name}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                  {transaction.notes && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {transaction.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${getAmountColor(transaction.type)}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                  {transaction.type}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
