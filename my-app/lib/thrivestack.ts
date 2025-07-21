export interface ThriveStackWindow extends Window {
  thriveStack?: {
    setUser: (userId: string, emailId: string, properties?: Record<string, any>) => Promise<any>;
    init: (userId?: string, source?: string) => Promise<void>;
    identify: (data: any) => Promise<any>;
    group: (data: any) => Promise<any>;
    [key: string]: any;
  };
}
 
declare const window: ThriveStackWindow;
 
// Simple initialization function
export const initThriveStack = (apiKey: string, source: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.thriveStack) {
      resolve();
      return;
    }
 
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://ts-script.app.thrivestack.ai/latest/thrivestack.js';
    script.setAttribute('data-api-key', apiKey);
    script.setAttribute('data-source', source);
    script.setAttribute('data-track-clicks', 'true');
    script.setAttribute('data-track-forms', 'false');
    script.async = true;
 
    script.onload = () => {
      // Wait a bit for auto-initialization
      setTimeout(() => {
        if (window.thriveStack) {
          resolve();
        } else {
          reject(new Error('ThriveStack failed to initialize'));
        }
      }, 100);
    };
 
    script.onerror = () => {
      reject(new Error('Failed to load ThriveStack script'));
    };
 
    document.head.appendChild(script);
  });
};
 
// Wrapper functions for easy use
export const thriveStackSetUser = async (
  userId: string, 
  email: string, 
  properties: Record<string, any> = {}
): Promise<any> => {
  if (!window.thriveStack) {
    throw new Error('ThriveStack not initialized');
  }
 
  return window.thriveStack.setUser(userId, email, properties);
};
 
export const thriveStackIdentify = async (data: any): Promise<any> => {
  if (!window.thriveStack) {
    throw new Error('ThriveStack not initialized');
  }
 
  return window.thriveStack.identify(data);
};
 
export const thriveStackGroup = async (data: any): Promise<any> => {
  if (!window.thriveStack) {
    throw new Error('ThriveStack not initialized');
  }
 
  return window.thriveStack.group(data);
};

export const thriveStackSetGroup = async (
  userId: string,
  accountId: string,
  accountName: string,
  properties: Record<string, any> = {}
): Promise<any> => {
  if (!window.thriveStack) {
    throw new Error('ThriveStack not initialized');
  }

  return window.thriveStack.setGroup(userId, accountId, accountName, properties);
};
