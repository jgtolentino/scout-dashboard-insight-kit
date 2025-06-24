/**
 * Scout Analytics Dashboard v3.0 - Auth Bypass & Fallback System
 * Toggleable authentication that supports both mock and production Azure AD
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
  tenant: string;
}

export interface AuthSession {
  user: MockUser;
  token: string;
  expiresAt: number;
  isAuthenticated: boolean;
  isMock: boolean;
}

// Mock users for development
const MOCK_USERS: Record<string, MockUser> = {
  'dev-admin': {
    id: 'dev-admin-001',
    name: 'TBWA Dev Admin',
    email: 'dev@tbwa.com',
    role: 'admin',
    permissions: ['read', 'write', 'admin', 'openai', 'databricks'],
    tenant: 'tbwa-dev'
  },
  'eugene': {
    id: 'eugene-001',
    name: 'Eugene Valencia',
    email: 'eugene.valencia@tbwa-smp.com',
    role: 'admin',
    permissions: ['read', 'write', 'admin', 'openai', 'databricks'],
    tenant: 'tbwa-smp'
  },
  'paolo': {
    id: 'paolo-001',
    name: 'Paolo Broma',
    email: 'paolo.broma@tbwa-smp.com',
    role: 'user',
    permissions: ['read', 'openai'],
    tenant: 'tbwa-smp'
  },
  'khalil': {
    id: 'khalil-001',
    name: 'Khalil Veracruz',
    email: 'khalil.veracruz@tbwa-smp.com',
    role: 'user',
    permissions: ['read', 'openai'],
    tenant: 'tbwa-smp'
  }
};

/**
 * Check if mock authentication is enabled
 */
export function shouldBypassAuth(): boolean {
  return import.meta.env.VITE_BYPASS_AZURE_AUTH === 'true' || 
         import.meta.env.VITE_USE_MOCKS === 'true';
}

/**
 * Create a mock authentication session
 */
export function createMockSession(userId: string = 'dev-admin'): AuthSession {
  const user = MOCK_USERS[userId] || MOCK_USERS['dev-admin'];
  
  return {
    user,
    token: `mock-token-${userId}-${Date.now()}`,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    isAuthenticated: true,
    isMock: true
  };
}

/**
 * Mock Azure credential for DefaultAzureCredential bypass
 */
export const createMockAzureCredential = () => ({
  getToken: async () => ({
    token: import.meta.env.VITE_MOCK_AZURE_TOKEN || 'mock-azure-token-dev',
    expiresOnTimestamp: Date.now() + 3600000 // 1 hour
  })
});

/**
 * Get current session (mock or real)
 */
export function getCurrentSession(): AuthSession | null {
  if (shouldBypassAuth()) {
    // Check for stored mock user preference
    const storedUser = localStorage.getItem('scout-mock-user');
    return createMockSession(storedUser || 'dev-admin');
  }
  
  // TODO: Implement real Azure AD session retrieval
  // This would use MSAL or similar when VITE_BYPASS_AZURE_AUTH=false
  return null;
}

/**
 * Mock login function
 */
export async function mockLogin(userId: string): Promise<AuthSession> {
  if (!MOCK_USERS[userId]) {
    throw new Error(`Mock user '${userId}' not found`);
  }
  
  const session = createMockSession(userId);
  localStorage.setItem('scout-mock-user', userId);
  localStorage.setItem('scout-auth-session', JSON.stringify(session));
  
  return session;
}

/**
 * Logout (works for both mock and real)
 */
export function logout(): void {
  localStorage.removeItem('scout-mock-user');
  localStorage.removeItem('scout-auth-session');
  
  if (!shouldBypassAuth()) {
    // TODO: Add real Azure AD logout
    // msalInstance.logout();
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(session: AuthSession | null, permission: string): boolean {
  if (!session?.isAuthenticated) return false;
  return session.user.permissions.includes(permission);
}

/**
 * Role-based access control
 */
export function hasRole(session: AuthSession | null, role: string): boolean {
  if (!session?.isAuthenticated) return false;
  return session.user.role === role || session.user.role === 'admin';
}

/**
 * Get available mock users for development
 */
export function getMockUsers(): MockUser[] {
  return Object.values(MOCK_USERS);
}