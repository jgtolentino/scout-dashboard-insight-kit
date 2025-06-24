// Fixed authentication bypass for Scout Analytics
export interface MockUser {
  email: string
  role: 'admin' | 'user'
  permissions: string[]
  name: string
}

export const mockUsers: MockUser[] = [
  {
    email: 'dev@tbwa.com',
    role: 'admin', 
    permissions: ['read', 'write', 'admin', 'openai', 'databricks'],
    name: 'Dev Admin'
  },
  {
    email: 'eugene.valencia@tbwa-smp.com',
    role: 'admin',
    permissions: ['read', 'write', 'admin', 'openai', 'databricks'], 
    name: 'Eugene Valencia'
  },
  {
    email: 'paolo.broma@tbwa-smp.com',
    role: 'user',
    permissions: ['read', 'openai'],
    name: 'Paolo Broma'  
  },
  {
    email: 'khalil.veracruz@tbwa-smp.com',
    role: 'user',
    permissions: ['read', 'openai'],
    name: 'Khalil Veracruz'
  }
]

export function shouldBypassAuth(): boolean {
  return import.meta.env.VITE_BYPASS_AZURE_AUTH === 'true' || 
         import.meta.env.DEV ||
         window.location.hostname.includes('azurestaticapps.net')
}

export function getCurrentUser(): MockUser | null {
  if (!shouldBypassAuth()) return null
  
  const savedUser = localStorage.getItem('scout-current-user')
  if (savedUser) {
    try {
      return JSON.parse(savedUser)
    } catch {
      return mockUsers[0] // Default to dev admin
    }
  }
  return mockUsers[0] // Default to dev admin
}

export function setCurrentUser(user: MockUser): void {
  localStorage.setItem('scout-current-user', JSON.stringify(user))
  window.location.reload() // Refresh to apply changes
}