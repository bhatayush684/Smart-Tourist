# Frontend Deployment Environment Variables

## Required Environment Variables for Hosting

When deploying your Smart Tourist frontend to hosting platforms (Vercel, Netlify, etc.), you need to set these environment variables:

### Core Configuration
```
VITE_API_URL=https://smart-tourist.onrender.com
VITE_WS_URL=wss://smart-tourist.onrender.com/ws
VITE_APP_NAME=Smart Tourist Safety Platform
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

### Feature Flags
```
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_TOOLS=false
```

### External Services (Optional)
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_ANALYTICS_ID=your_analytics_tracking_id
```

## Platform-Specific Setup

### Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable with its value
3. Set Environment to "Production"

### Netlify
1. Go to Site Settings → Environment Variables
2. Add each key-value pair
3. Deploy your site

### Other Platforms
Most hosting platforms have similar environment variable configuration in their dashboard.

## Local Development
For local development, create a `.env.local` file with:
```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000/ws
```

## Important Notes
- All frontend environment variables must start with `VITE_`
- Update `VITE_API_URL` to point to your deployed backend
- Keep sensitive keys secure and never commit them to version control
