// Fix for React Context errors in Scout Analytics
import React, { createContext, useContext, ReactNode } from 'react'

// Create a safe context wrapper to prevent context errors
export function createSafeContext<T>(name: string, defaultValue?: T) {
  const Context = createContext<T | undefined>(defaultValue)
  
  function useContext() {
    const context = React.useContext(Context)
    if (context === undefined) {
      throw new Error(`use${name} must be used within a ${name}Provider`)
    }
    return context
  }
  
  function Provider({ children, value }: { children: ReactNode; value: T }) {
    return <Context.Provider value={value}>{children}</Context.Provider>
  }
  
  return [Provider, useContext] as const
}

// Error boundary for Scout Analytics components
export class ScoutErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Scout Analytics Error:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
          <p className="text-gray-600">Please refresh the page or contact support</p>
        </div>
      )
    }
    
    return this.props.children
  }
}