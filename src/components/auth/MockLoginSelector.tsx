/**
 * Scout Analytics Dashboard v3.0 - Mock Login Selector
 * Development-only component for switching between mock users
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockLogin, getMockUsers, shouldBypassAuth, type MockUser } from '@/lib/auth/authFallback';
import { User, Shield, Eye, Settings } from 'lucide-react';

interface MockLoginSelectorProps {
  onLogin: (session: any) => void;
  className?: string;
}

export function MockLoginSelector({ onLogin, className }: MockLoginSelectorProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('dev-admin');
  const [isLoading, setIsLoading] = useState(false);
  const mockUsers = getMockUsers();

  // Only show in development with bypass enabled
  if (!shouldBypassAuth()) {
    return null;
  }

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const session = await mockLogin(selectedUserId);
      onLogin(session);
    } catch (error) {
      console.error('Mock login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUser = mockUsers.find(user => user.id === selectedUserId);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'user': return 'default';
      case 'viewer': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Development Login
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a mock user for testing. Azure App Registration bypass is enabled.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select User:</label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                    <Badge variant={getRoleColor(user.role) as any} className="ml-2">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUser && (
          <div className="p-3 rounded-lg bg-muted space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {selectedUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedUser.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={handleLogin} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login as Mock User'}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>🔓 <strong>Development Mode:</strong> VITE_BYPASS_AZURE_AUTH=true</p>
          <p>🎭 This bypasses Azure AD authentication</p>
          <p>🔄 Set VITE_BYPASS_AZURE_AUTH=false to enable production auth</p>
        </div>
      </CardContent>
    </Card>
  );
}