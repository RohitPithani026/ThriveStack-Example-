// lib/mixpanel.ts

import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your project token
export const initMixpanel = () => {
  if (typeof window !== 'undefined') {
    mixpanel.init('96b5f76ad22e3b2fbdee6a0085e30c3e'); // Replace with your Mixpanel token
  }
};

// Track an event with optional properties
export const trackEvent = (eventName: string, properties?: object) => {
  if (typeof window !== 'undefined') {
    mixpanel.track(eventName, properties);
  }
};

// Set a user property (optional)
export const setUserProperties = (properties: object) => {
  if (typeof window !== 'undefined') {
    mixpanel.people.set(properties);
  }
};
