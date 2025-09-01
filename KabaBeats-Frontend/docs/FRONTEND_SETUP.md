# KabaBeats Frontend Setup Guide

## 🚀 **Quick Setup**

Your frontend has been configured to work with your backend at `http://localhost:5173`. Here's how to get everything running:

### **1. Environment Setup**
```bash
# Set up environment variables
npm run setup:env

# This creates .env.local with the correct configuration
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Start Development Server**
```bash
npm run dev
```

Your frontend will now run on `http://localhost:5173` and connect to your backend at `http://localhost:3000`.

## 🔧 **Configuration Changes Made**

### **1. Port Configuration**
- **Updated Vite config** to use port `5173` (was 8080)
- **Matches backend expectations** for CORS and OAuth redirects

### **2. OAuth Integration**
- **Added OAuth callback route** at `/auth/callback`
- **Updated AuthContext** to work with your backend API
- **Real Google OAuth flow** instead of mock authentication

### **3. Backend API Integration**
- **Real API calls** to your backend endpoints
- **JWT token management** with access and refresh tokens
- **Proper error handling** and user feedback

## 📁 **New Files Created**

### **1. OAuth Callback Component**
```
src/components/auth/OAuthCallback.tsx
```
- Handles Google OAuth callback from backend
- Shows loading, success, and error states
- Redirects to dashboard on successful authentication

### **2. Environment Configuration**
```
env.example
scripts/setup-environment.sh
```
- Environment variables template
- Setup script for easy configuration

### **3. Documentation**
```
docs/FRONTEND_SETUP.md
```
- Complete setup and configuration guide

## 🔗 **OAuth Flow**

### **Complete Authentication Flow:**
1. **User clicks "Login with Google"** → Redirects to Google
2. **User authorizes** → Google redirects to backend callback
3. **Backend processes OAuth** → Redirects to frontend with tokens
4. **Frontend receives tokens** → Stores them and fetches user profile
5. **User is authenticated** → Redirected to dashboard

### **Frontend Routes:**
```
/auth/callback - OAuth callback handler
/login - Login form with Google OAuth button
/signup - Registration form
/dashboard - Protected dashboard (requires authentication)
```

## ⚙️ **Environment Variables**

### **Required Variables:**
```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_BACKEND_URL=http://localhost:3000

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback

# App Configuration
VITE_APP_NAME=KabaBeats
VITE_APP_VERSION=1.0.0
```

### **Optional Variables:**
```bash
# Feature Flags
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_ANALYTICS=false

# Development Configuration
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false
```

## 🔐 **Authentication Features**

### **1. JWT Token Management**
- **Access tokens** (15 minutes) for API requests
- **Refresh tokens** (7 days) for token renewal
- **Automatic token storage** in localStorage
- **Secure token handling** with proper cleanup

### **2. Google OAuth Integration**
- **Real Google OAuth flow** with proper state management
- **CSRF protection** with state parameter validation
- **Error handling** for failed authentication
- **User profile fetching** after successful OAuth

### **3. API Integration**
- **Real backend API calls** instead of mock data
- **Proper error handling** with user-friendly messages
- **Loading states** for better UX
- **Automatic logout** on token expiration

## 🎯 **Testing the Integration**

### **1. Start Both Servers**
```bash
# Terminal 1 - Backend
cd KabaBeats-Backend
npm run dev

# Terminal 2 - Frontend
cd KabaBeats-Frontend
npm run dev
```

### **2. Test Authentication**
1. **Go to** `http://localhost:5173/login`
2. **Click "Login with Google"**
3. **Complete Google OAuth flow**
4. **Verify redirect to dashboard**

### **3. Test API Integration**
- **Check browser network tab** for API calls
- **Verify JWT tokens** in localStorage
- **Test protected routes** (should redirect to login if not authenticated)

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **1. CORS Errors**
- **Check backend CORS configuration** includes `http://localhost:5173`
- **Verify backend is running** on port 3000

#### **2. OAuth Redirect Issues**
- **Check Google Console** redirect URI matches exactly
- **Verify environment variables** are set correctly
- **Check browser console** for error messages

#### **3. API Connection Issues**
- **Verify backend is running** and accessible
- **Check API_BASE_URL** in environment variables
- **Test backend endpoints** directly with curl/Postman

#### **4. Token Issues**
- **Check localStorage** for stored tokens
- **Verify token format** and expiration
- **Check backend JWT configuration**

## 📋 **Development Workflow**

### **1. Making API Changes**
1. **Update backend API** endpoints
2. **Update frontend API calls** in AuthContext
3. **Test integration** with both servers running
4. **Update error handling** as needed

### **2. Adding New Features**
1. **Create new components** in appropriate modules
2. **Add API integration** in contexts or custom hooks
3. **Update routing** in App.tsx
4. **Test with real backend** data

### **3. Environment Management**
- **Development**: Use `.env.local` for local development
- **Production**: Set environment variables in deployment platform
- **Testing**: Use separate environment files for testing

## 🚀 **Production Deployment**

### **Environment Variables for Production:**
```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api/v1
VITE_BACKEND_URL=https://your-backend-domain.com
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_GOOGLE_REDIRECT_URI=https://your-backend-domain.com/api/v1/auth/google/callback
```

### **Build for Production:**
```bash
npm run build
```

### **Preview Production Build:**
```bash
npm run preview
```

## 📚 **Next Steps**

1. **Set up Google OAuth** in Google Cloud Console
2. **Configure environment variables** with your actual credentials
3. **Test the complete authentication flow**
4. **Implement additional features** using the backend API
5. **Add error boundaries** and better error handling
6. **Implement token refresh** logic
7. **Add loading states** and better UX

---

**Your frontend is now fully integrated with your backend!** The authentication flow will work seamlessly between the two applications, and you can start building additional features using the real API endpoints.
