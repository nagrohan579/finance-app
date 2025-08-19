'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AuthForm from '@/components/auth/AuthForm'
import { DollarSign, TrendingUp, PieChart, Shield } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen gap-12">
          {/* Left side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 max-w-lg"
          >
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center lg:justify-start gap-3 mb-6"
              >
                <DollarSign className="w-10 h-10 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Personal Finance Tracker
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-600 dark:text-gray-400 mb-8"
              >
                Take control of your finances with our comprehensive tracking and analytics platform.
              </motion.p>

              <div className="space-y-6">
                {[
                  {
                    icon: TrendingUp,
                    title: 'Track Income & Expenses',
                    description: 'Monitor your cash flow with detailed transaction tracking'
                  },
                  {
                    icon: PieChart,
                    title: 'Visual Analytics',
                    description: 'Beautiful charts and insights to understand your spending patterns'
                  },
                  {
                    icon: Shield,
                    title: 'Secure & Private',
                    description: 'Your financial data is encrypted and protected with bank-level security'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right side - Auth Form */}
          <div className="flex-1 max-w-md w-full">
            <AuthForm mode={mode} onModeChange={setMode} />
          </div>
        </div>
      </div>
    </div>
  )
}
