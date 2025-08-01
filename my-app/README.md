# ThriveStack Analytics Integration

A comprehensive Next.js application demonstrating server-side and client-side analytics integration with ThriveStack. This project showcases how to implement analytics tracking across different parts of a web application using both browser and server-side SDKs.

## 🚀 Features

- **Server-Side Analytics**: Track events and user identification from API routes and server actions
- **Client-Side Analytics**: Browser-based event tracking with React hooks
- **Middleware Integration**: Automatic page view tracking and user identification
- **TypeScript Support**: Full type safety for analytics events and properties
- **Test Pages**: Built-in testing interface to verify analytics integration
- **Production Ready**: Optimized for Next.js 15+ with proper error handling

## 📋 Prerequisites

- Node.js 18+ 
- Next.js 15+
- ThriveStack account and API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RohitPithani026/ThriveStack-Example-.git
   cd thrivestack-analytics-integration
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   THRIVESTACK_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── analytics/
│   │       ├── identify/route.ts    # User identification API
│   │       └── track/route.ts       # Event tracking API
│   ├── actions/
│   │   └── analytics.ts             # Server actions for analytics
│   └── test-analytics/
│       └── page.tsx                 # Analytics testing interface
├── components/
│   ├── ContactForm.tsx              # Example form with analytics
│   └── ui/                          # UI components
├── hooks/
│   └── useAnalytics.ts              # Client-side analytics hook
├── lib/
│   ├── analytics.ts                 # Server-side analytics functions
│   └── analytics-edge.ts            # Edge runtime analytics
└── middleware.ts                    # Analytics middleware
```

## 🔧 Configuration

### API Key Setup

Replace the API key in the following files with your actual ThriveStack API key:

- `hooks/useAnalytics.ts` (line 24)
- `lib/analytics.ts` (line 8)
- `lib/analytics-edge.ts` (line 8)

```typescript
apiKey: "your_actual_api_key_here",
```

## 📊 Usage

### Server-Side Analytics

#### 1. Event Tracking
```typescript
import { trackUserAction } from '@/app/actions/analytics';

// Track a user action
await trackUserAction(
  'user-123',
  'purchase_completed',
  {
    product_id: 'prod_456',
    amount: 99.99,
    currency: 'USD'
  },
  'group-789'
);
```

#### 2. User Identification
```typescript
import { identifyUser } from '@/app/actions/analytics';

// Identify a user
await identifyUser(
  'user-123',
  'user@example.com',
  {
    name: 'John Doe',
    plan: 'premium',
    signup_date: '2024-01-15'
  }
);
```

### Client-Side Analytics

#### 1. Using the Analytics Hook
```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { track, identify } = useAnalytics();

  const handlePurchase = () => {
    track('purchase_completed', {
      product_id: 'prod_456',
      amount: 99.99
    });
  };

  const handleSignup = () => {
    identify('user-123', 'user@example.com', {
      name: 'John Doe',
      plan: 'premium'
    });
  };

  return (
    <div>
      <button onClick={handlePurchase}>Purchase</button>
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}
```

#### 2. Direct API Calls
```typescript
// Track an event
fetch('/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    eventName: 'button_click',
    properties: { button_name: 'cta_button' }
  })
});

// Identify a user
fetch('/api/analytics/identify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    email: 'user@example.com',
    properties: { name: 'John Doe' }
  })
});
```

### Middleware Integration

The middleware automatically tracks page views and can identify users based on session data:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Automatic page view tracking
  // User identification from session
  // Custom event tracking
}
```

## 🧪 Testing

### 1. Built-in Test Page
Visit `http://localhost:3000/test-analytics` to test the analytics integration:

- Click "Test Analytics Tracking" to trigger test events
- Check browser console for success/error messages
- Verify events appear in your ThriveStack dashboard

### 2. API Testing
Test the analytics endpoints directly:

```bash
# Test event tracking
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "eventName": "test_event",
    "properties": {
      "test_type": "api_test"
    }
  }'

# Test user identification
curl -X POST http://localhost:3000/api/analytics/identify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com",
    "properties": {
      "name": "Test User"
    }
  }'
```

### 3. Browser Console
Check the browser console for:
- Analytics initialization messages
- Event tracking confirmations
- Error messages (if any)

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
```env
THRIVESTACK_API_KEY=your_production_api_key
NODE_ENV=production
```

## 📈 Analytics Dashboard

After deployment, you can view your analytics data in the ThriveStack dashboard:

1. **Events**: Track user interactions and conversions
2. **Users**: Monitor user identification and properties
3. **Page Views**: Analyze user journey and engagement
4. **Custom Properties**: Segment users based on custom data

## 🔍 Troubleshooting

### Common Issues

1. **"Analytics not initialized" error**
   - Check if API key is correctly set
   - Verify environment variables are loaded
   - Ensure ThriveStack SDK is properly imported

2. **Events not appearing in dashboard**
   - Check network requests in browser dev tools
   - Verify API key permissions
   - Check server logs for errors

3. **Build errors**
   - Ensure all dependencies are installed
   - Check TypeScript compilation
   - Verify Next.js configuration

### Debug Mode
Enable debug logging by setting:
```typescript
debug: true
```
in your analytics configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [ThriveStack Docs](https://docs.thrivestack.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/thrivestack-analytics-integration/issues)
- **Email**: support@thrivestack.com

## 🙏 Acknowledgments

- ThriveStack team for the analytics SDK
- Next.js team for the amazing framework
- Contributors and community members

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, error handling, and compliance with data protection regulations.
