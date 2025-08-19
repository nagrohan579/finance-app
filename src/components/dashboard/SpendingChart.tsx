'use client'

import { motion } from 'framer-motion'
import { PieChart } from 'lucide-react'

interface SpendingChartProps {
  data: Record<string, number>
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const total = Object.values(data).reduce((sum, amount) => sum + amount, 0)
  
  const categories = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Show top 5 categories

  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-red-500'
  ]

  const getPercentage = (amount: number) => {
    return total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Spending by Category
        </h2>
      </div>

      {total === 0 ? (
        <div className="text-center py-8">
          <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No expenses yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Your spending breakdown will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(([category, amount], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${colors[index]}`} />
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {category}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(amount)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getPercentage(amount)}%
                </div>
              </div>
            </motion.div>
          ))}

          {/* Progress bars */}
          <div className="space-y-2 mt-6">
            {categories.map(([category, amount], index) => (
              <div key={`${category}-bar`} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-500">
                    {getPercentage(amount)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(amount)}%` }}
                    transition={{ duration: 1, delay: 1 + index * 0.1 }}
                    className={`h-2 rounded-full ${colors[index]}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>Total Spending</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
