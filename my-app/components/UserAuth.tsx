'use client';
 
import React, { useEffect } from 'react';
import { useThriveStack } from './ThriveStackProvider';
 
interface User {
  userId: string;
  email: string;
  name: string;
}
 
interface UserAuthProps {
  user: User | null;
}

export const UserAuth: React.FC<UserAuthProps> = ({ user }) => {
  const { isReady, setUser } = useThriveStack();
 
  useEffect(() => {
    const handleUserTracking = async () => {
      if (!isReady || !user) return;
 
      try {
        // Use the setUser method
        await setUser(user.userId, user.email, {
          user_name: user.name,
          signup_date: new Date().toISOString(),
          // Add any other custom properties
        });
 
        console.log('User set successfully in ThriveStack');
      } catch (error) {
        console.error('Failed to set user in ThriveStack:', error);
      }
    };
 
    handleUserTracking();
  }, [isReady, user, setUser]);
 
  if (!user) {
    return <div>Please log in</div>;
  }
 
  return (
<div className="p-4">
<h2>Welcome, {user.name}!</h2>
<p>Email: {user.email}</p>
<p>ThriveStack Status: {isReady ? 'Ready' : 'Loading...'}</p>
</div>
  );
};