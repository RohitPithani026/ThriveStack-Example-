export interface ThriveStackEvent {
  event_name: string;
  user_id: string;
  timestamp?: string;
  properties?: Record<string, any>;
  context?: {
    group_id?: string;
    [key: string]: any;
  };
}

// Initialize the script
export const initThriveStack = (apiKey: string, source: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.thriveStack) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://ts-script.app.thrivestack.ai/latest/thrivestack.js';
    script.setAttribute('data-api-key', apiKey);
    script.setAttribute('data-source', source);
    script.setAttribute('data-track-clicks', 'true');
    script.setAttribute('data-track-forms', 'false');
    script.async = true;

    script.onload = () => {
      setTimeout(() => {
        if (window.thriveStack) {
          resolve();
        } else {
          reject(new Error('ThriveStack failed to initialize'));
        }
      }, 100);
    };

    script.onerror = () => reject(new Error('Failed to load ThriveStack script'));

    document.head.appendChild(script);
  });
};

// Wrapper utility functions
export const thriveStackSetUser = async (
  userId: string,
  email: string,
  properties: Record<string, any> = {}
): Promise<any> => {
  if (!window.thriveStack?.setUser) throw new Error('ThriveStack not initialized');
  return window.thriveStack.setUser(userId, email, properties);
};

export const thriveStackIdentify = async (data: any): Promise<any> => {
  if (!window.thriveStack?.identify) throw new Error('ThriveStack not initialized');
  return window.thriveStack.identify(data);
};

export const thriveStackGroup = async (
  userId: string,
  accountId: string,
  accountName: string,
  properties: Record<string, any> = {}
): Promise<any> => {
  if (!window.thriveStack?.group) throw new Error('ThriveStack group() not available');
  return window.thriveStack.group(userId, accountId, accountName, properties);
};

export const thriveStackSetGroup = async (
  userId: string,
  accountId: string,
  accountName: string,
  properties: Record<string, any> = {}
): Promise<any> => {
  if (!window.thriveStack?.setGroup) throw new Error('ThriveStack setGroup() not available');
  return window.thriveStack.setGroup(userId, accountId, accountName, properties);
};

export const thriveStackTrack = (events: ThriveStackEvent[]): void => {
  if (!window.thriveStack?.track) throw new Error('ThriveStack track() not available');
  window.thriveStack.track(events);
};

export const trackFeatureUsed = (
  userId: string,
  featureName: string,
  userRole: string,
  groupId?: string
): void => {
  const event: ThriveStackEvent = {
    event_name: "feature_used",
    user_id: userId,
    timestamp: new Date().toISOString(),
    properties: {
      feature_name: featureName,
      user_role: userRole,
    },
    context: {
      group_id: groupId,
    },
  };

  thriveStackTrack([event]);
};
