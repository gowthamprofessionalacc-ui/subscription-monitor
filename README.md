# Subscription Leakage Detector

A Progressive Web App (PWA) to track and manage your OTT subscriptions, detect unused services, and save money.

## 🚀 Features

- **Track Subscriptions**: Add and manage all your OTT subscriptions (Netflix, Prime, Spotify, etc.)
- **Usage Detection**: Get notified to confirm usage and track how often you use each service
- **Risk Analysis**: Smart algorithm calculates risk of subscription waste
- **Money Wasted**: See how much money is being wasted on unused subscriptions
- **Renewal Alerts**: Get notified 5 days before subscription renewal
- **Budget Tracking**: Set monthly budget and get alerts when over budget
- **Intentional Keep**: Mark subscriptions you want to keep despite low usage
- **Push Notifications**: PWA push notifications for usage checks and alerts
- **Themed UI**: Each OTT has its own themed dashboard (Netflix=red, Spotify=green, etc.)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase)
- **Auth**: Email/Password + Google OAuth
- **Push Notifications**: Firebase Cloud Messaging
- **State Management**: Zustand

## 📁 Project Structure

```
subscriptiion detection project/
├── frontend/                 # Next.js PWA
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # API, Firebase, Supabase clients
│   │   ├── store/           # Zustand stores
│   │   └── types/           # TypeScript types
│   └── public/              # Static assets, manifest
├── backend/                  # Node.js API
│   ├── config/              # Supabase, Firebase, themes config
│   ├── routes/              # Express routes
│   ├── services/            # Business logic
│   ├── middleware/          # Auth, error handling
│   └── cron/                # Scheduled jobs
└── database/                 # SQL schema
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- Firebase account

### 1. Database Setup

1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Run the contents of `database/schema.sql`

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## 📱 PWA Installation

1. Open the app in Chrome/Edge on mobile
2. Tap "Add to Home Screen"
3. The app will work offline and receive push notifications

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
JWT_SECRET=your_jwt_secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## 📊 Backend Rules & Formulas

1. **Usage Confidence**: Starts at 50, +10 for "yes", -15 for "no", -5 for ignored
2. **Risk Score**: Calculated from usage, days unused, cost, and auto-renew status
3. **Risk Level**: LOW (0-30), MEDIUM (31-60), HIGH (>60)
4. **Waste Confidence**: Based on risk score, adjusted by behavior
5. **Money Wasted**: monthly_cost × months_unused
6. **Yearly Bleed**: Projected yearly loss if auto-renew is on

## 🎨 Supported OTT Platforms

Netflix, Amazon Prime Video, Disney+ Hotstar, Spotify, YouTube Premium, Apple TV+, HBO Max, Hulu, Zee5, SonyLIV, JioCinema, Crunchyroll, Voot, MX Player, ALTBalaji, Apple Music, Amazon Music, Gaana, JioSaavn, Xbox Game Pass, PlayStation Plus

## 📝 License

MIT License
