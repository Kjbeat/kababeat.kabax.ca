import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const mockUsers = [
  { id: 'mock-user-1', email: 'alice@example.com', username: 'alice' },
  { id: 'mock-user-2', email: 'bob@example.com', username: 'bob' },
  { id: 'mock-user-3', email: 'charlie@example.com', username: 'charlie' },
];

export function DevUserSwitcher() {
  const { user, signIn, signOut } = useAuth();
  const authMode = import.meta.env.VITE_AUTH || 'mock';

  // Only show in development with mock auth
  if (authMode !== 'mock' || import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader>
        <CardTitle className="text-sm">Dev User Switcher</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {user ? (
          <div className="space-y-2">
            <p className="text-sm">
              Logged in as: <strong>{user.username}</strong>
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => signOut()}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Quick login for development:
            </p>
            {mockUsers.map((mockUser) => (
              <Button
                key={mockUser.id}
                variant="outline"
                size="sm"
                onClick={() => signIn(mockUser.email, 'password')}
                className="w-full justify-start"
              >
                {mockUser.username} ({mockUser.email})
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
