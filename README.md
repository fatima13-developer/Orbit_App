# 🪐 Orbit — Modern Real-Time Social Media Platform

Orbit is a full-stack, production-quality social media web application built with the **MERN** stack (MongoDB, Express.js, React, Node.js), **Socket.io** for real-time bidirectional messaging and alerts, **Tailwind CSS** styled in an energetic warm orange aesthetic, and **Cloudinary** for high-performance cloud asset storage.

---

## 🌟 Key Features

### 1. 🌐 Guest-Friendly Browsing (Twitter / Reddit Style)
- **Zero Forced Login**: Orbit opens directly into the active Home Feed for first-time visitors without redirects or barriers.
- **Full Public Exploration**: Guests can browse the infinite scroll feed, search creators, explore trending tags, view full user profiles, inspect photos in high-res lightbox, and read nested comment threads.
- **Contextual Login Required Modal**: When a guest triggers a gated action (liking, commenting, replying, following, posting, or messaging), Orbit pops open a sleek, friendly "Login Required" modal explaining the intent (e.g. "Sign in to like this post"), offering 1-Click Demo Login, Sign In, or Sign Up.
- **Seamless Action Continuation**: After authenticating, the user is preserved in place and their initiated action completes smoothly without lost context.

### 2. 🔐 Robust Authentication & Security
- **JWT Architecture**: Access tokens with short TTL stored in memory and automated silent refresh via `httpOnly` secure cookies.
- **Password Security**: Strong salt hashing with `bcryptjs`.
- **Silent Session Hydration**: On app load, Orbit tests the silent refresh cookie without throwing error toasts or redirecting guests.
- **Axios Interceptor**: 401s on gated requests trigger the interactive Login Modal instead of hard browser redirects.
- **One-Click Demo Access**: Instant 1-click recruiter/demo login (`demo@orbit.com` / `Demo@1234`) preloaded with rich social data.
- **Production Hardening**: `helmet` headers, strictly configured `cors` with credentials, and `express-rate-limit` on API and authentication routes.

### 2. 📰 Dynamic Feed & Cursor-Based Infinite Scroll
- **Cursor-Based Pagination**: High-efficiency cursor pagination (`createdAt` timestamps) eliminating offset page drift and skipped records during active feeds.
- **IntersectionObserver Hook**: Seamless continuous scrolling with Skeleton loaders and end-of-feed indicators.
- **Rich Post Creation**: Text formatting + multi-file photo uploads (up to 4 images) with client-side preview, size validation (max 5MB), and removal controls.
- **Responsive Media Grid**: Dynamic layout adapting smoothly for 1, 2, 3, or 4 images, with full-screen interactive lightbox gallery.
- **Optimistic Likes & Live Counts**: Instant tactile like/unlike UI response with background server sync.

### 3. 💬 Comments & Threaded Replies
- Top-level comments and 1-level deep nested replies.
- Pagination for comments and nested replies.
- Comment liking system and author delete authorization.

### 4. 👥 Follow & Discovery Engine
- Follow and unfollow mechanism updating followers and following counts with compound index consistency.
- Interactive modal dialogs for viewing followers and following lists with live follow actions.
- "Who to follow" suggested users sidebar excluding already followed users.
- Debounced search finding users by name or `@username`.

### 5. 🔔 Live Notifications (Socket.io)
- Real-time instant delivery when another user likes, comments, replies, or follows you.
- Notification bell with unread badge counter, animated toast alerts, and full notifications page with "Mark all as read".

### 6. 💬 Direct Messages (1-on-1 Chat)
- Real-time conversation stream with Socket.io rooms.
- Live typing indicators ("Elena is typing...").
- Online / Offline presence indicators updated in real-time.
- "Seen" receipts (delivered vs seen checkmarks).
- Image sharing in chat with client previews.
- Quick "Message" button on user profiles creating or loading conversations instantly.

---

## 🎨 Design System — Orange Theme

Orbit utilizes a warm, friendly orange aesthetic configured in `tailwind.config.js`:
- **Primary Orange**: `#F97316`
- **Primary Hover/Dark**: `#EA580C`
- **Deep Accent**: `#C2410C`
- **Soft Orange (Badges & Highlights)**: `#FFEDD5`
- **Page Background**: `#FFF7ED` (Warm Cream)
- **Surfaces & Cards**: `#FFFFFF` with soft warm shadows (`shadow-warm`)
- **Typography**: Inter / system sans-serif with strong hierarchy
- **Form Factors**: Desktop left sidebar + right discovery bar, mobile top bar + bottom tab bar.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Socket.io-client, Lucide React, Context API |
| **Backend** | Node.js, Express.js (ES Modules), Mongoose, Socket.io, Multer, Cloudinary SDK |
| **Validation & Security** | Joi, Helmet, CORS, Express-Rate-Limit, Cookie-Parser, BcryptJS |
| **Testing** | Jest, Supertest, MongoMemoryServer |

---

## 📁 Project Architecture

```
orbit/
├── server/
│   ├── src/
│   │   ├── config/          # Database, Cloudinary, and Socket.io setups
│   │   ├── controllers/     # Route logic for auth, posts, comments, chat, users
│   │   ├── middleware/      # JWT auth guard, multer upload, Joi validation, rate limiters
│   │   ├── models/          # Mongoose models (User, Post, Comment, Like, Follow, Notification, Conversation, Message)
│   │   ├── routes/v1/       # Versioned REST API endpoints
│   │   ├── seed/            # Demo database seeder
│   │   ├── tests/           # Jest integration test suites
│   │   ├── utils/           # Token generation, Joi schemas, API responses
│   │   ├── app.js           # Express app definition
│   │   └── server.js        # HTTP server & Socket.io launcher
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/             # Axios instances and API services
│   │   ├── components/      # Common, Post, Comment, Profile, Chat, and Notification UI
│   │   ├── context/         # AuthContext, SocketContext, ToastContext
│   │   ├── hooks/           # useInfiniteScroll, useDebounce
│   │   ├── pages/           # Home, Explore, Notifications, Messages, Profile, PostDetail, Auth
│   │   └── utils/           # Date formatting and media helpers
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
├── package.json             # Root workspace orchestrator
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- *(Optional)* Local MongoDB or MongoDB Atlas URI. **If no MongoDB is running, Orbit automatically launches an in-memory database fallback so you can run the entire platform immediately with zero external dependencies!**

### 1. Installation

From the root directory:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```
*Or manually:*
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Environment Variables

**Server (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/orbit
JWT_ACCESS_SECRET=orbit_super_secret_access_jwt_key_2026_production
JWT_REFRESH_SECRET=orbit_super_secret_refresh_jwt_key_2026_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Optional: Cloudinary credentials (gracefully falls back to local uploads if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Client (`client/.env`):**
```env
VITE_API_URL=
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Demo Data

Populate demo users, posts, comments, nested replies, likes, notifications, and chats:
```bash
npm run seed
```

**Preconfigured Demo Credentials:**
- **Email**: `demo@orbit.com`
- **Password**: `Demo@1234`
*(Or click the 1-Click "Launch Demo Account" button on the login screen!)*

### 4. Running Development Servers

Open two terminals or run from root:

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
# Server listens on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Vite client runs on http://localhost:5173
```

---

## 🧪 Running Tests

Orbit includes Jest and Supertest integration suites for authentication and post workflows:
```bash
npm run test:server
```

---

## 🚢 Production Deployment

### 1. Backend (e.g. Render / Railway / Heroku)
- Set Environment Variables: `MONGODB_URI` (MongoDB Atlas), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` (your frontend domain), `NODE_ENV=production`.
- Optional: Add Cloudinary keys for cloud-hosted images.
- Start Command: `npm start` (in `/server`).

### 2. Frontend (e.g. Vercel / Netlify)
- Set Environment Variables: `VITE_API_URL=https://your-backend.onrender.com`, `VITE_SOCKET_URL=https://your-backend.onrender.com`.
- Build Command: `npm run build` (in `/client`).
- Output Directory: `dist`.

---

## 📝 API Endpoints Summary (`/api/v1`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create user account | No |
| `POST` | `/auth/login` | Login user & issue tokens | No |
| `POST` | `/auth/demo` | 1-Click demo authentication | No |
| `POST` | `/auth/logout` | Clear refresh token cookie | Yes |
| `POST` | `/auth/refresh-token`| Rotate JWT access token | Cookie |
| `GET` | `/auth/me` | Fetch authenticated session | Yes |
| `GET` | `/posts/feed` | Cursor-paginated user feed | Yes |
| `GET` | `/posts/explore`| Cursor-paginated trending posts| Optional |
| `POST` | `/posts` | Create post (up to 4 images)| Yes |
| `POST` | `/posts/:id/like`| Optimistically like post | Yes |
| `POST` | `/comments/post/:postId`| Comment or nested reply | Yes |
| `GET` | `/users/profile/:username`| User profile and stats | Optional |
| `POST` | `/users/:id/follow`| Follow user & alert via Socket| Yes |
| `GET` | `/conversations` | List user chat conversations | Yes |
| `POST` | `/conversations/:id/messages`| Send text/image message | Yes |
| `GET` | `/notifications`| Paginated notification history | Yes |
| `PATCH`| `/notifications/:id/read`| Mark notification read | Yes |
