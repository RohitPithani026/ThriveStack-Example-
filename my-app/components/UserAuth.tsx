'use client';

import React, { useEffect, useState } from 'react';
import { useThriveStack } from './ThriveStackProvider';

interface StoredUser {
  userId: string;
  email: string;
  name: string;
}

export const UserAuth: React.FC = () => {
  const { isReady, setUser } = useThriveStack();
  const [user, setUserState] = useState<StoredUser | null>(null);

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
    const track = async () => {
      if (!isReady || !user) return;

      try {
        await setUser(user.userId, user.email, {
          user_name: user.name,
          signup_source: 'localStorage',
        });

        console.log('✅ ThriveStack user set');
      } catch (err) {
        console.error('❌ Failed to set ThriveStack user:', err);
      }
    };

    track();
  }, [isReady, user]);

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="p-4">
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <p>ThriveStack Status: {isReady ? 'Ready' : 'Loading...'}</p>
    </div>
  );
};
