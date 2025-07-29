'use client';

import React, { useEffect, useState } from 'react';
import { thriveStackSetUser, thriveStackSetGroup } from '@/hooks/useAnalytics';

interface StoredUser {
  userId: string;
  email: string;
  name: string;
}

export const UserAuth: React.FC = () => {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [isThriveStackReady, setIsThriveStackReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserState({
        userId: parsed.userId || parsed.email,
        email: parsed.email,
        name: parsed.name,
      });
    }
  }, []);

  useEffect(() => {
    const setupThriveStack = async () => {
      if (!user) return;

      try {
        // Set the user
        await thriveStackSetUser(user.userId, user.email, {
          user_name: user.name,
          signup_source: 'localStorage',
        });
        console.log('✅ ThriveStack user set');

        // Set the group (account/org)
        await thriveStackSetGroup(
          'ac8db7ba-5139-4911-ba6e-523fd9c4704b', 
          'acme.com', 
          'Acme Inc', 
          {
            plan: 'Free Trial',
            created_at: new Date().toISOString(),
          }
        );
        console.log('✅ ThriveStack group set');
        
        setIsThriveStackReady(true);
      } catch (err) {
        console.error('❌ ThriveStack setup failed:', err);
      }
    };

    setupThriveStack();
  }, [user]);

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="p-4">
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <p>ThriveStack Status: {isThriveStackReady ? 'Ready' : 'Loading...'}</p>
    </div>
  );
};