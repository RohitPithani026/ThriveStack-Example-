'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initThriveStack, thriveStackSetUser, thriveStackIdentify, thriveStackGroup } from '../lib/thrivestack';

interface ThriveStackContextType {
    isReady: boolean;
    setUser: (userId: string, email: string, properties?: Record<string, any>) => Promise<any>;
    identify: (data: any) => Promise<any>;
    group: (data: any) => Promise<any>;
}

const ThriveStackContext = createContext<ThriveStackContextType | null>(null);

interface ThriveStackProviderProps {
    children: ReactNode;
    apiKey: string;
    source: string;
}

export const ThriveStackProvider: React.FC<ThriveStackProviderProps> = ({
    children,
    apiKey,
    source
}) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            try {
                await initThriveStack(apiKey, source);
                setIsReady(true);
                console.log('ThriveStack initialized successfully');
            } catch (error) {
                console.error('Failed to initialize ThriveStack:', error);
            }
        };

        if (typeof window !== 'undefined' && apiKey && source) {
            initialize();
        }
    }, [apiKey, source]);

    const contextValue: ThriveStackContextType = {
        isReady,
        setUser: thriveStackSetUser,
        identify: thriveStackIdentify,
        group: thriveStackGroup,
    };

    return (
        <ThriveStackContext.Provider value={contextValue}>
            {children}
        </ThriveStackContext.Provider>
    );
};

export const useThriveStack = (): ThriveStackContextType => {
    const context = useContext(ThriveStackContext);
    if (!context) {
        throw new Error('useThriveStack must be used within a ThriveStackProvider');
    }
    return context;
};