'use client';

import React, { useEffect, useState } from 'react';
import { useThriveStack } from './ThriveStackProvider';

interface User {
  userId: string;
  email: string;
  name: string;
}

export const UserAuth: React.FC = () => {
  const { isReady, setUser } = useThriveStack();
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserState({
            userId: parsed.userId || parsed.email, // fallback
            email: parsed.email,
            name: parsed.name,
          });
        } catch (err) {
          console.error("Error parsing user:", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    const setThriveUser = async () => {
      if (!isReady || !user) return;

      try {
        await setUser(user.userId, user.email, {
          user_name: user.name,
        });

        console.log("✅ ThriveStack user set");
      } catch (err) {
        console.error("❌ ThriveStack setUser failed:", err);
      }
    };

    setThriveUser();
  }, [isReady, user, setUser]);

  if (!user) return null;

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500">Logged in as <strong>{user.name}</strong></p>
    </div>
  );
};
