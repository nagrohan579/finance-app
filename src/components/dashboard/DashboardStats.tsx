'use client'

import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  CreditCard,
  Calculator
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  delay?: number
}

function StatCard({ title, value, change, changeType, icon: Icon, delay = 0 }: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />
      case 'negative':
        return <TrendingDown className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 ${getChangeColor()}`}>
            {getChangeIcon()}
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </motion.div>
  )
}

interface DashboardStatsProps {
  data: {
    totalBalance: number
    monthlyIncome: number
    monthlyExpense: number
    netCashFlow: number
    totalLoanAmount: number
    totalEMI: number
  }
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(data.totalBalance),
      icon: Wallet,
      delay: 0.1
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(data.monthlyIncome),
      change: '+' + formatCurrency(data.monthlyIncome),
      changeType: 'positive' as const,
      icon: TrendingUp,
      delay: 0.2
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(data.monthlyExpense),
      change: '-' + formatCurrency(data.monthlyExpense),
      changeType: 'negative' as const,
      icon: TrendingDown,
      delay: 0.3
    },
    {
      title: 'Net Cash Flow',
      value: formatCurrency(data.netCashFlow),
      change: formatCurrency(Math.abs(data.netCashFlow)),
      changeType: data.netCashFlow >= 0 ? 'positive' as const : 'negative' as const,
      icon: DollarSign,
      delay: 0.4
    },
    {
      title: 'Total Loans',
      value: formatCurrency(data.totalLoanAmount),
      icon: CreditCard,
      delay: 0.5
    },
    {
      title: 'Monthly EMI',
      value: formatCurrency(data.totalEMI),
      change: '-' + formatCurrency(data.totalEMI),
      changeType: 'negative' as const,
      icon: Calculator,
      delay: 0.6
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          delay={stat.delay}
        />
      ))}
    </div>
  )
}
