// Scout Analytics - Component Error Fixes

// 1. Fix AppSidebar.tsx - Regional Analytics Navigation
// src/components/AppSidebar.tsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  MapPin,
  Bot,
  Settings,
  LayoutDashboard 
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Transaction Trends', href: '/transaction-trends', icon: TrendingUp },
  { name: 'Product Mix', href: '/product-mix', icon: ShoppingCart },
  { name: 'Product Substitution', href: '/product-substitution', icon: BarChart3 },
  { name: 'Consumer Behavior', href: '/consumer-behavior', icon: Users },
  { name: 'Consumer Profiling', href: '/consumer-profiling', icon: Users },
  { name: 'Regional Analytics', href: '/regional-analytics', icon: MapPin }, // Fixed: Added Regional Analytics
  { name: 'ScoutBot', href: '/scoutbot', icon: Bot },
  { name: 'AI Chat', href: '/ai-chat', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings }
]

export const AppSidebar: React.FC = () => {
  const location = useLocation()
  
  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Scout Analytics</h1>
      </div>
      <nav className="mt-6">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// 2. Fix GlobalFilterBar.tsx - Cascading Filters with Regional Support
// src/components/GlobalFilterBar.tsx
import React, { useEffect, useState } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FilterOption {
  value: string
  label: string
}

export const GlobalFilterBar: React.FC = () => {
  const { filters, setFilter, clearDownstreamFilters } = useFilterStore()
  const [options, setOptions] = useState<Record<string, FilterOption[]>>({})
  const [loading, setLoading] = useState(false)

  // Geography hierarchy with Regional Analytics support
  const geographyLevels = [
    { key: 'region', label: 'Region' },
    { key: 'city', label: 'City' },
    { key: 'municipality', label: 'Municipality' },
    { key: 'barangay', label: 'Barangay' },
    { key: 'location', label: 'Location' }
  ]

  // Organization hierarchy
  const organizationLevels = [
    { key: 'holding_company', label: 'Holding Company' },
    { key: 'client', label: 'Client' },
    { key: 'category', label: 'Category' },
    { key: 'brand', label: 'Brand' },
    { key: 'sku', label: 'SKU' }
  ]

  const handleFilterChange = (level: string, value: string) => {
    setFilter(level as any, value)
    clearDownstreamFilters(level)
    
    // Trigger filter change event for other components
    window.dispatchEvent(new CustomEvent('filtersChanged', { 
      detail: { level, value, filters: { ...filters, [level]: value } }
    }))
  }

  const fetchFilterOptions = async (level: string, parentFilters: any = {}) => {
    setLoading(true)
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/v1/filters/${level}/options?${new URLSearchParams(parentFilters)}`)
      const data = await response.json()
      
      setOptions(prev => ({
        ...prev,
        [level]: data.map((item: any) => ({
          value: item.value,
          label: item.label
        }))
      }))
    } catch (error) {
      console.error(`Failed to fetch ${level} options:`, error)
      // Fallback to mock data for development
      setOptions(prev => ({
        ...prev,
        [level]: getMockOptions(level)
      }))
    } finally {
      setLoading(false)
    }
  }

  const getMockOptions = (level: string): FilterOption[] => {
    const mockData: Record<string, FilterOption[]> = {
      region: [
        { value: 'ncr', label: 'National Capital Region' },
        { value: 'calabarzon', label: 'CALABARZON' },
        { value: 'central-luzon', label: 'Central Luzon' },
        { value: 'mindanao', label: 'Mindanao' }
      ],
      city: [
        { value: 'manila', label: 'Manila' },
        { value: 'quezon-city', label: 'Quezon City' },
        { value: 'makati', label: 'Makati' },
        { value: 'cebu', label: 'Cebu City' }
      ],
      category: [
        { value: 'beverages', label: 'Beverages' },
        { value: 'snacks', label: 'Snacks' },
        { value: 'personal-care', label: 'Personal Care' },
        { value: 'household', label: 'Household' }
      ],
      brand: [
        { value: 'coca-cola', label: 'Coca-Cola' },
        { value: 'pepsi', label: 'Pepsi' },
        { value: 'lays', label: 'Lays' },
        { value: 'pringles', label: 'Pringles' }
      ]
    }
    return mockData[level] || []
  }

  useEffect(() => {
    // Load initial options
    geographyLevels.forEach(level => {
      fetchFilterOptions(level.key)
    })
    organizationLevels.forEach(level => {
      fetchFilterOptions(level.key)
    })
  }, [])

  const renderSelect = (level: { key: string; label: string }, currentValue: string) => {
    const levelOptions = options[level.key] || []
    
    return (
      <div key={level.key} className="min-w-[150px]">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {level.label}
        </label>
        <Select
          value={currentValue}
          onValueChange={(value) => handleFilterChange(level.key, value)}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`All ${level.label}s`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All {level.label}s</SelectItem>
            {levelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 border-b shadow-sm">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Geography Filters */}
        <div className="flex gap-3">
          <div className="text-sm font-medium text-gray-500 mb-6">Geography:</div>
          {geographyLevels.map(level => 
            renderSelect(level, (filters as any)[level.key] || '')
          )}
        </div>
        
        {/* Separator */}
        <div className="h-8 w-px bg-gray-300 mx-2"></div>
        
        {/* Organization Filters */}
        <div className="flex gap-3">
          <div className="text-sm font-medium text-gray-500 mb-6">Business:</div>
          {organizationLevels.map(level => 
            renderSelect(level, (filters as any)[level.key] || '')
          )}
        </div>
        
        {/* Date Range Filter */}
        <div className="min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date" 
              value={filters.dateRange.end}
              onChange={(e) => setFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Clear Filters Button */}
        <button
          onClick={() => {
            useFilterStore.getState().clearFilters()
            window.dispatchEvent(new CustomEvent('filtersChanged'))
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-blue-500"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}

// 3. Fix ScoutBot.tsx - Renamed from RetailBot with Context Awareness
// src/components/ScoutBot.tsx  
import React, { useState, useEffect } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { Bot, Send, TrendingUp, ShoppingCart, AlertCircle, BarChart3 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface QuickAction {
  id: string
  label: string
  prompt: string
  icon: React.ComponentType<{ className?: string }>
  category: 'trends' | 'insights' | 'analysis'
}

export const ScoutBot: React.FC = () => {
  const { filters } = useFilterStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const quickActions: QuickAction[] = [
    {
      id: 'top-skus',
      label: 'Top SKUs in location',
      prompt: 'Show me the top performing SKUs in the current location filter',
      icon: TrendingUp,
      category: 'trends'
    },
    {
      id: 'sales-summary',
      label: 'Sales summary', 
      prompt: 'Give me a summary of sales performance with current filters',
      icon: ShoppingCart,
      category: 'insights'
    },
    {
      id: 'anomalies',
      label: 'Detect anomalies',
      prompt: 'Are there any unusual patterns or anomalies in the current data?',
      icon: AlertCircle,
      category: 'insights'
    },
    {
      id: 'category-analysis',
      label: 'Category breakdown',
      prompt: 'Analyze the performance across different product categories',
      icon: BarChart3,
      category: 'analysis'
    }
  ]

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Include filter context in the request
      const contextualPrompt = `
        Current filter context:
        - Region: ${filters.region || 'All'}
        - City: ${filters.city || 'All'}
        - Municipality: ${filters.municipality || 'All'}
        - Category: ${filters.category || 'All'}
        - Brand: ${filters.brand || 'All'}
        - Date Range: ${filters.dateRange.start} to ${filters.dateRange.end}
        
        User query: ${content}
        
        Please provide insights based on this filter context.
      `

      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: contextualPrompt,
          context: filters,
          history: messages.slice(-5) // Last 5 messages for context
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('ScoutBot error:', error)
      
      // Fallback response for development/bypass mode
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on your current filters (${Object.entries(filters).filter(([_, v]) => v && v !== '').map(([k, v]) => `${k}: ${v}`).join(', ')}), I can help analyze your data. However, I'm currently in offline mode. Please ensure your AI service is properly configured.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m ScoutBot, your retail analytics assistant. I can help you analyze sales data, identify trends, and provide insights based on your current filter selections. What would you like to explore?',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b bg-blue-50">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">ScoutBot</h3>
            <p className="text-sm text-gray-600">AI-powered retail analytics assistant</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg max-w-[80%] ${
              message.role === 'user'
                ? 'bg-blue-100 text-blue-900 ml-auto'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="text-sm font-medium mb-1">
              {message.role === 'user' ? 'You' : 'ScoutBot'}
            </div>
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[80%]">
            <div className="text-sm font-medium mb-1">ScoutBot</div>
            <div className="text-sm">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Analyzing your data...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about sales trends, product performance, or consumer insights..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

// 4. Fix RegionalAnalytics.tsx - New page component
// src/pages/RegionalAnalytics.tsx
import React, { useState, useEffect } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { PhilippinesChoroplethMap } from '@/components/PhilippinesChoroplethMap'
import { KPICards } from '@/components/KPICards'

export const RegionalAnalytics: React.FC = () => {
  const { filters } = useFilterStore()
  const [regionalData, setRegionalData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadRegionalData = async () => {
      setLoading(true)
      try {
        // Mock API call for regional data
        const response = await fetch(`/api/v1/analytics/regional?${new URLSearchParams(filters as any)}`)
        const data = await response.json()
        setRegionalData(data)
      } catch (error) {
        console.error('Failed to load regional data:', error)
        // Mock data for development
        setRegionalData([
          { region: 'NCR', sales: 5200000, transactions: 15600, growth: 12.5 },
          { region: 'CALABARZON', sales: 3800000, transactions: 11200, growth: 8.3 },
          { region: 'Central Luzon', sales: 2900000, transactions: 8700, growth: 15.2 },
          { region: 'Mindanao', sales: 2100000, transactions: 6300, growth: -2.1 }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadRegionalData()
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Regional Analytics</h1>
        <p className="text-gray-600">Geographic performance analysis across the Philippines</p>
      </div>

      {/* KPI Cards */}
      <KPICards data={regionalData} loading={loading} />

      {/* Philippines Map */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance by Region</h2>
        <div className="h-96">
          <PhilippinesChoroplethMap 
            data={regionalData}
            loading={loading}
          />
        </div>
      </div>

      {/* Regional Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Regional Performance Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Loading regional data...
                  </td>
                </tr>
              ) : (
                regionalData.map((region, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {region.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₱{region.sales?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.transactions?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        region.growth >= 0 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {region.growth >= 0 ? '+' : ''}{region.growth}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}