# VisionVoice App Flow Architecture

## Overview

The app implements a complete authentication and onboarding flow with proper route protection and redirect logic.

---

## Route Hierarchy & Access Rules

### 1. **Landing Page** (`/`)

- **Who sees it:** Unauthenticated users only
- **What happens:** Hero section with video, use cases, "Get Started" button
- **Get Started button redirects to:** `/auth/signup`
- **If authenticated user visits:** Redirects to `/dashboard` (or `/onboarding` if not onboarded)

### 2. **Authentication Pages** (`/auth/login`, `/auth/signup`)

- **Who sees them:** Unauthenticated users only
- **What happens:** User signs in/signs up with Clerk
- **After successful auth:** System checks onboarding status
  - If onboarded → Redirects to `/dashboard`
  - If NOT onboarded → Redirects to `/onboarding`
- **If authenticated user visits:** Redirects to `/dashboard` (or `/onboarding`)

### 3. **Onboarding Page** (`/onboarding`)

- **Who sees it:** Authenticated users who are NOT yet onboarded
- **What happens:** User fills in name, email, use case, preferences
- **After submit:**
  - Saves onboarding status to backend
  - Redirects to `/dashboard`
- **If already onboarded:** Redirects to `/dashboard`
- **If not authenticated:** Redirects to `/auth/login`

### 4. **Dashboard Page** (`/dashboard`) ⭐ MAIN APP

- **Who sees it:** Authenticated + Onboarded users only
- **What it has:**
  - AI Vision Assistant (camera input, image analysis, voice output)
  - Navigation buttons to History and Profile
  - User info display (name, email)
  - User menu with sign-out
- **Accessible only if:** `isSignedIn === true` AND `profile.onboarded === true`

### 5. **History Page** (`/history`)

- **Who sees it:** Authenticated + Onboarded users only
- **What it has:** List of previous interactions with timestamps
- **Data source:** Stored in localStorage (`visionvoice-interactions`)

### 6. **Profile Page** (`/profile`)

- **Who sees it:** Authenticated + Onboarded users only
- **What it has:**
  - Account info (email, name from Clerk)
  - Preference settings (response style, language level, voice speed, etc.)
  - Save preferences button
- **Updates:** Persisted to backend

---

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Opens App                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Is user authenticated?
                             │
                ┌────────────┴──────────────┐
                │                           │
              NO                           YES
                │                           │
        ┌───────▼────────┐        ┌────────▼──────────┐
        │ Landing Page   │        │ Check onboarding │
        │     (/)        │        │    status       │
        └───────┬────────┘        └────────┬─────────┘
                │                          │
          Click "Get                ┌──────┴─────────┐
          Started"                  │                │
                │              Onboarded?        NOT onboarded
                │                  │                │
                │           ┌───────▼──────┐   ┌───▼──────────┐
                │           │  Dashboard   │   │  Onboarding  │
                │           │  (/dashboard)│   │              │
                │           └──────────────┘   └───┬──────────┘
                │                                   │
                └──────────────────┬────────────────┘
                                   │
                          ┌────────▼──────┐
                          │  /auth/signup │
                          │   (Clerk UI)  │
                          └────────┬──────┘
                                   │
                          User creates account
                                   │
                          ┌────────▼──────────┐
                          │   Redirects to    │
                          │  /onboarding      │
                          │  (first time)     │
                          └────────┬──────────┘
                                   │
                        User fills in details
                                   │
                          ┌────────▼──────────┐
                          │   Onboarding      │
                          │   Status saved    │
                          │   ✓ Onboarded     │
                          └────────┬──────────┘
                                   │
                          ┌────────▼──────────┐
                          │   Redirects to    │
                          │   /dashboard      │
                          │   (Main App)      │
                          └───────────────────┘
```

---

## Protected Routes & Redirects

### ProtectedRoute Component

- **Location:** `src/features/auth/ProtectedRoute.jsx`
- **Checks:** Authentication + Onboarding status
- **If not authenticated:** Redirects to `/auth/login`
- **If authenticated but not onboarded:** Redirects to `/onboarding`
- **If authenticated + onboarded:** Renders the protected content

### GuestRoute Component

- **Location:** `src/app/routes.jsx`
- **Purpose:** Protects landing/auth pages from authenticated users
- **If not authenticated:** Shows the guest page (landing, login, signup)
- **If authenticated:** Redirects to `/dashboard` (or `/onboarding` if not onboarded)

---

## Route Configuration

```javascript
// src/utils/constants.js
export const ROUTES = {
  root: "/", // Landing page
  auth: "/auth", // Auth base
  login: "/auth/login", // Sign in
  signup: "/auth/signup", // Sign up
  onboarding: "/onboarding", // First-time setup
  dashboard: "/dashboard", // Main app (protected)
  history: "/history", // Interaction history (protected)
  profile: "/profile", // User settings (protected)
};
```

---

## Component Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── Login.jsx           ← Sign in (Clerk)
│   │   ├── Signup.jsx          ← Sign up (Clerk)
│   │   └── ProtectedRoute.jsx  ← Checks auth + onboarding
│   ├── landing/
│   │   ├── LandingPage.jsx     ← Main landing page
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── HeroSection.jsx
│   │       ├── VideoSection.jsx
│   │       ├── UseCases.jsx
│   │       └── CTASection.jsx
│   ├── onboarding/
│   │   └── OnboardingPage.jsx  ← Onboarding form
│   └── demo/
│       └── VoiceAssistant.jsx  ← AI vision module
├── pages/
│   ├── AuthenticatedLayout.jsx ← Wrapper with topbar
│   ├── Dashboard.jsx           ← Main app (protected)
│   ├── History.jsx             ← Interaction history (protected)
│   └── Profile.jsx             ← Settings (protected)
├── app/
│   ├── App.jsx                 ← Main app wrapper
│   └── routes.jsx              ← Route configuration
└── context/
    └── AuthContext.jsx         ← Auth state management
```

---

## Key Features

✅ **Landing page for unauthenticated users**
✅ **Clerk-powered authentication**
✅ **First-time onboarding flow**
✅ **Protected routes for authenticated users**
✅ **Dashboard with AI vision assistant**
✅ **History tracking of interactions**
✅ **User profile & preference settings**
✅ **Automatic redirects based on auth/onboarding status**
✅ **Clean, modular component structure**
✅ **Production-ready routing**

---

## Development

### Starting the app:

```bash
npm run dev
```

### Accessing the app:

- **Unauthenticated:** Opens to landing page (`/`)
- **Click Get Started → Sign up → Onboarding → Dashboard**
- **From dashboard:** Can navigate to history and profile

---

## Security

- **ProtectedRoute** ensures only authenticated + onboarded users access dashboard, history, profile
- **GuestRoute** ensures only unauthenticated users see landing, login, signup
- **Clerk** handles secure user authentication
- **Backend** validates onboarding status via API

---

## Notes

- All "Get Started" buttons redirect to signup
- Landing page is the entry point for all users (authenticated or not)
- After authentication, the system intelligently routes based on onboarding status
- The app is fully responsive and mobile-friendly
- Onboarding data is persisted to the backend
- User preferences are stored and retrievable
