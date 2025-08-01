# Digital Course Platform - Analytics Integration Guide

This project integrates multiple analytics platforms to track user behavior, page views, and custom events. Below are the integration guides for each platform.

## 📊 Analytics Platforms Integrated

- **Google Analytics 4 (GA4)** - Page views and custom events
- **Amplitude** - User behavior tracking and session replay
- **Mixpanel** - Event tracking and user analytics
- **ThriveStack** - Custom event tracking and user identification

---

## 🔍 Google Analytics 4 (GA4)

### Setup Steps:

1. **Get your Measurement ID**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new property or use existing one
   - Copy your Measurement ID (format: G-XXXXXXXXXX)

2. **Install Dependencies**
   ```bash
   # No additional packages needed - uses gtag script
   ```

3. **Configure in Layout**
   ```tsx
   // app/layout.tsx
   <script
     async
     src={`https://www.googletagmanager.com/gtag/js?id=YOUR_MEASUREMENT_ID`}
   />
   <script
     dangerouslySetInnerHTML={{
       __html: `
         window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
         gtag('js', new Date());
         gtag('config', 'YOUR_MEASUREMENT_ID', {
           page_path: window.location.pathname,
         });
       `,
     }}
   />
   ```

4. **Update Configuration**
   ```tsx
   // lib/gtag.ts
   export const GA_TRACKING_ID = 'YOUR_MEASUREMENT_ID';
   ```

5. **Track Events**
   ```tsx
   import { event } from '@/lib/gtag';
   
   // Track custom events
   event({
     action: 'button_click',
     category: 'engagement',
     label: 'signup_button',
     value: 1
   });
   ```

---

## 📈 Amplitude

### Setup Steps:

1. **Get your API Key**
   - Go to [Amplitude](https://amplitude.com/)
   - Create a new project
   - Copy your API Key

2. **Install Dependencies**
   ```bash
   npm install amplitude-js @types/amplitude-js @amplitude/analytics-browser
   ```

3. **Initialize in Layout**
   ```tsx
   // app/layout.tsx
   import amplitude from 'amplitude-js';
   
   useEffect(() => {
     amplitude.getInstance().init('YOUR_API_KEY');
   }, []);
   ```

4. **Track Events**
   ```tsx
   import amplitude from 'amplitude-js';
   
   // Track page views
   amplitude.getInstance().logEvent('page_view', { page: pathname });
   
   // Track custom events
   amplitude.getInstance().logEvent('button_click', {
     button_name: 'signup',
     page: 'homepage'
   });
   ```

5. **Session Replay (Optional)**
   ```tsx
   // Add session replay plugin
   const sessionReplayScript = document.createElement('script');
   sessionReplayScript.src = 'https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.8.0-min.js.gz';
   document.head.appendChild(sessionReplayScript);
   
   sessionReplayScript.onload = () => {
     window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
   };
   ```

---

## 📊 Mixpanel

### Setup Steps:

1. **Get your Project Token**
   - Go to [Mixpanel](https://mixpanel.com/)
   - Create a new project
   - Copy your Project Token

2. **Install Dependencies**
   ```bash
   npm install mixpanel-browser
   ```

3. **Initialize in Layout**
   ```tsx
   // app/layout.tsx
   import mixpanel from 'mixpanel-browser';
   
   useEffect(() => {
     mixpanel.init('YOUR_PROJECT_TOKEN', {
       debug: true, // Remove in production
     });
   }, []);
   ```

4. **Configure Helper Functions**
   ```tsx
   // lib/mixpanel.ts
   import mixpanel from 'mixpanel-browser';
   
   export const initMixpanel = () => {
     if (typeof window !== 'undefined') {
       mixpanel.init('YOUR_PROJECT_TOKEN');
     }
   };
   
   export const trackEvent = (eventName: string, properties?: object) => {
     if (typeof window !== 'undefined') {
       mixpanel.track(eventName, properties);
     }
   };
   ```

5. **Track Events**
   ```tsx
   import { trackEvent } from '@/lib/mixpanel';
   
   // Track page views
   trackEvent('Page Viewed', { page: pathname });
   
   // Track custom events
   trackEvent('Button Clicked', {
     button_name: 'signup',
     page: 'homepage'
   });
   ```

---

## 🚀 ThriveStack

### Setup Steps:

1. **Get your API Key**
   - Go to [ThriveStack](https://thrivestack.com/)
   - Create a new project
   - Copy your API Key

2. **Install Dependencies**
   ```bash
   npm install thrivestack-analytics
   ```

3. **Initialize Analytics**
   ```tsx
   // hooks/useAnalytics.ts
   import { ThriveStack } from 'thrivestack-analytics/browser';
   
   let analytics: ThriveStack | null = null;
   
   export function getAnalytics() {
     if (typeof window === "undefined") return null;
     if (!analytics) {
       analytics = new ThriveStack({
         apiKey: "YOUR_API_KEY",
         source: "marketing,product",
         trackClicks: true,
         trackForms: true,
       });
       analytics.init().catch(console.error);
     }
     return analytics;
   }
   ```

4. **Track Events**
   ```tsx
   import { thriveStackTrack } from '@/hooks/useAnalytics';
   
   const event = {
     event_name: "button_click",
     user_id: "user123",
     timestamp: new Date().toISOString(),
     properties: {
       button_name: "signup",
       page_name: "homepage"
     },
     context: {
       group_id: "group123"
     }
   };
   
   thriveStackTrack([event]);
   ```

5. **User Identification**
   ```tsx
   import { thriveStackSetUser } from '@/hooks/useAnalytics';
   
   await thriveStackSetUser('user123', 'user@example.com', {
     name: 'John Doe',
     plan: 'premium'
   });
   ```

---

## 🔧 Environment Variables

Create a `.env.local` file in your project root:

```env
# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Amplitude
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_api_key

# Mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# ThriveStack
NEXT_PUBLIC_THRIVESTACK_API_KEY=your_thrivestack_api_key
NEXT_PUBLIC_THRIVESTACK_SOURCE=my-app
```

---

## 📝 Usage Examples

### Track Page Views
```tsx
// All platforms will automatically track page views
// For custom page view tracking:
import { pageview } from '@/lib/gtag';
import { trackEvent } from '@/lib/mixpanel';
import { trackPageView } from '@/hooks/useAnalytics';

// Google Analytics
pageview('/dashboard');

// Mixpanel
trackEvent('Page Viewed', { page: '/dashboard' });

// ThriveStack
trackPageView('user123', 'dashboard', 'group123');
```

### Track Button Clicks
```tsx
import { event } from '@/lib/gtag';
import { trackEvent } from '@/lib/mixpanel';
import { trackButtonClick } from '@/hooks/useAnalytics';

const handleSignupClick = () => {
  // Google Analytics
  event({
    action: 'click',
    category: 'engagement',
    label: 'signup_button'
  });
  
  // Mixpanel
  trackEvent('Signup Button Clicked', {
    button_name: 'signup',
    page: 'homepage'
  });
  
  // ThriveStack
  trackButtonClick('user123', 'signup', 'homepage', 'group123');
};
```

### Track Form Submissions
```tsx
import { trackFormSubmission } from '@/hooks/useAnalytics';

const handleFormSubmit = (formData) => {
  trackFormSubmission('user123', 'signup_form', formData, 'group123');
};
```

---

## 🚨 Important Notes

1. **Replace API Keys**: Make sure to replace all placeholder API keys with your actual keys
2. **Environment Variables**: Use environment variables for production deployments
3. **Debug Mode**: Remove `debug: true` from Mixpanel config in production
4. **Privacy**: Ensure compliance with privacy laws (GDPR, CCPA) when tracking user data
5. **Performance**: Analytics scripts are loaded asynchronously to avoid blocking page load

---

## 📚 Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Amplitude Documentation](https://developers.amplitude.com/)
- [Mixpanel Documentation](https://developer.mixpanel.com/)
- [ThriveStack Documentation](https://docs.thrivestack.com/)

---

## 🤝 Contributing

When adding new analytics events, make sure to:
1. Update this README with new tracking methods
2. Test events in development environment
3. Document any new environment variables needed
4. Follow the existing naming conventions for events
