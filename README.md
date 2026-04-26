# 🌍 SmartAid — Volunteer & NGO Platform

> A full-stack platform that aggregates community crisis data from the web and user submissions, intelligently deduplicates it, and connects verified volunteers with real-world opportunities through a modern, data-driven interface.

---

## 📁 Monorepo Structure

```
GoogleSolutionChallenge/
├── GoogleSolutionChallengeBackend/    # Node.js + Express REST API
└── GoogleSolutionChallengeFrontend/   # React 19 + Vite SPA
```

---

## 🚀 Quick Start (Full Stack)

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- A **MongoDB Atlas** cluster (or local MongoDB)
- A **SerpAPI** key (for web scraping)
- A **Google Apps Script** deployment URL (for OTP email delivery)

### 1. Clone the Repository
```bash
git clone https://github.com/CfRadar/SmartAid.git
cd GoogleSolutionChallenge
```

### 2. Set Up the Backend
```bash
cd GoogleSolutionChallengeBackend
npm install
```

Create a `.env` file (see `.env.example`):
```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smartaid
JWT_SECRET=your_super_secret_jwt_key
SERP_API_KEY=your_serpapi_key_here
URL=https://script.google.com/macros/s/your_script_id/exec
```

Start the development server (with hot-reload):
```bash
npm run dev        # uses nodemon
# or
npm start          # production-equivalent (node index.js)
```

The backend starts at: **`http://localhost:3000`**

### 3. Set Up the Frontend
```bash
cd ../GoogleSolutionChallengeFrontend
npm install
npm run dev
```

The frontend starts at: **`http://localhost:5173`**

> The Vite dev server proxies all `/api/*` requests to `localhost:3000` automatically.

---

## 🏗️ Architecture Overview

```
Browser (React SPA)
     │
     │  HTTP / fetch()
     ▼
Express REST API  ──► MongoDB (Mongoose)
     │
     ├── SerpAPI          (Web search & scraping)
     ├── Google Apps Script  (OTP email delivery)
     └── node-cron        (Scheduled jobs)
```

### Data Pipeline

```
SerpAPI Search Results
       │
       ▼
 parser.js             → Extracts title, location, contact, urgency
 aiClassifier.js       → Detects category (medical / food / disaster / etc.)
 locationParser.js     → Parses address strings to GeoJSON Points
       │
       ▼
 Deduplication Engine  → SHA-256 hash + Levenshtein distance check
       │
       ├── Duplicate found → UPDATE existing Opportunity (patch empty fields)
       └── New entry       → CREATE new Opportunity document
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥18 | Async runtime |
| Express.js | ^5.2 | HTTP framework |
| MongoDB + Mongoose | ^8.18 | Document database + ODM |
| JSON Web Tokens | ^9.0 | Stateless auth tokens |
| Bcrypt | ^6.0 | Password hashing |
| node-cron | ^4.2 | Scheduled ingestion jobs |
| Helmet | ^8.1 | HTTP security headers |
| Compression | ^1.8 | gzip response compression |
| p-limit | ^3.1 | Concurrency limiter for ingestion |
| Morgan | ^1.10 | HTTP request logger |
| Axios | ^1.11 | HTTP client for SerpAPI calls |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2 | UI library |
| TypeScript | ~6.0 | Type safety |
| Vite | ^8.0 | Build tool & dev server |
| Vanilla CSS | — | Styling (glassmorphic design system) |

---

## 🔌 External APIs

### 1. SerpAPI — Web Search & Scraping
- **Used in:** `services/webSearchService.js`, `services/ingestionService.js`
- **Purpose:** Executes headless Google Search queries targeting volunteer, emergency response, and community aid opportunities.
- **Key function:**
  ```js
  // webSearchService.js
  async function fetchOrganicResults(queries) {
    // Calls SerpAPI with each query string
    // Returns flat array of organic search result objects
    // Each result contains: title, snippet, link, displayed_link
  }
  ```
- **Environment variable:** `SERP_API_KEY`
- **Rate limit warning:** The `node-cron` job runs every 30 minutes automatically. Do NOT manually trigger `GET /api/ingest` repeatedly — it depletes your quota.

### 2. Google Apps Script — OTP Email Delivery
- **Used in:** `services/authService.js`
- **Purpose:** Sends a 6-digit OTP code to the user's email address via a serverless Google Apps Script webhook. This avoids needing SendGrid/Twilio in the prototype phase.
- **Development-only shortcut:** When the backend runs with `NODE_ENV=development`, OTP `198920` can be used to verify accounts locally. Production still uses the normal OTP flow.
- **Key function:**
  ```js
  // authService.js
  async function sendOTP(email, otp) {
    await axios.post(process.env.URL, { email, otp });
  }
  ```
- **Environment variable:** `URL` (your deployed GAS web app URL)
- **Setup:** Deploy a Google Apps Script project as a Web App with `MailApp.sendEmail()` that reads `e.parameter.email` and `e.parameter.otp`.

### 3. MongoDB Atlas — Cloud Database
- **Used in:** `config/db.js` (Mongoose connection)
- **Purpose:** Stores all Users, Opportunities, Submissions, and session data.
- **Key collections:**
  - `users` — Auth, profile, skills, interests, ranking scores
  - `opportunities` — Verified, deduplicated volunteer tasks
  - `submissions` — Raw ingested data before processing
- **Environment variable:** `MONGODB_URI`

---

## 🧠 Core Features In Depth

### 1. Intelligent Deduplication Engine (`ingestionService.js`)

When new data arrives (from web scraping or user reports), the system runs a two-stage deduplication check before persisting:

**Stage 1 — SHA-256 Content Hash:**
```js
// Normalises (lowercase + trim) title + description + address, then hashes
function generateContentHash(parsed) {
  const hashInput = [parsed.title, parsed.description, parsed.address]
    .map(normalizeForHash).join("|");
  return crypto.createHash("sha256").update(hashInput).digest("hex");
}
```
If a document with the same hash already exists → **UPDATE** (patch missing fields only).

**Stage 2 — Levenshtein Fuzzy Match:**
```js
function levenshteinDistance(a, b) { /* Full DP matrix implementation */ }

function similarityScore(a, b) {
  return 1 - levenshteinDistance(a, b) / Math.max(a.length, b.length);
}
```
If a candidate's `title` similarity ≥ 0.72 AND `address` similarity ≥ 0.70 → classified as a duplicate → **UPDATE** (not create).

**Result:** No duplicate opportunities fill the database even across many scraping runs.

---

### 2. AI Category Classifier (`utils/aiClassifier.js`)

A lightweight keyword-matching engine that assigns one of five categories to incoming opportunities:

```js
// Categories: medical | food | disaster | environment | other
function detectCategory(text) {
  // Checks lowercased description against keyword lists
  // e.g. ["clinic", "nurse", "hospital", "medical"] → "medical"
}
```

Called during ingestion when the scraped result doesn't explicitly label a category.

---

### 3. Location Parser (`utils/locationParser.js`)

Extracts GeoJSON-compatible location structures from raw, unstructured address strings:

```js
function parseLocation(locationText) {
  // Regex-driven extraction of city, state, country
  // Returns: { type: "Point", coordinates: [lng, lat], address, rawText }
}
```

Feeds into MongoDB's **2dsphere** spatial index that powers the `GET /api/opportunities/nearby` geolocation queries.

---

### 4. Recommendation Engine (`services/recommendationService.js`)

Matches the authenticated user's `skills` and `interests` arrays against open opportunities:

```js
// For each open opportunity:
//   score += 2 for each skill match in skillsRequired
//   score += 1 for each interest match in category/tags
// Returns top 5 highest-scoring opportunities
```

Called by `GET /api/recommendations`. The frontend Profile page fetches this on mount to populate the "Recommended For You" feed.

---

### 5. Leaderboard & Ranking (`services/leaderboardService.js`)

Calculates each user's ranking score dynamically:

```
rankingScore = (peopleHelped × 5) + (tasksCompleted × 3) + (hoursContributed × 2)
```

`GET /api/leaderboard` returns the top 10 contributors. The Profile page uses this to calculate the current user's rank position and render the competitive bar chart.

---

### 6. OTP-Based Authentication Flow

```
POST /api/auth/signup
  → Hashes password (bcrypt, 12 rounds)
  → Creates shadow user (isVerified: false)
  → Generates 6-digit OTP, stores hashed OTP + expiry on user doc
  → Calls Google Apps Script webhook to deliver OTP email

POST /api/auth/verify-otp
  → Validates OTP against stored hash + checks expiry (10 minutes)
  → Sets isVerified: true, profileCompleted: false
  → Returns signed JWT (payload: userId, email)

POST /api/profile/setup  [Protected]
  → Accepts skills[], interests[], availability, location.address
  → Sets profileCompleted: true
  → Future logins skip setup step

POST /api/auth/login
  → Compares password with bcrypt hash
  → Returns JWT + profileCompleted status
  → If false → frontend redirects to #profile-setup
```

---

### 7. Automated Web Ingestion Cron (`services/ingestionCron.js`)

```js
// Runs every 30 minutes automatically
cron.schedule("*/30 * * * *", async () => {
  await runWebIngestion(VOLUNTEER_SEARCH_QUERIES);
});
```

Search queries target terms like:
- `"volunteer opportunities near me 2024"`
- `"emergency food bank volunteers needed"`
- `"disaster relief volunteer signup"`

Each run fetches organic results from SerpAPI, processes them through the parser + deduplication pipeline, and upserts `Opportunity` documents. Results older than **48 hours** are archived by a separate cleanup cron.

---

## 📡 API Reference

All routes use base path `/api`. Protected routes require:
```
Authorization: Bearer <jwt_token>
```

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | ❌ | Register + send OTP |
| POST | `/auth/verify-otp` | ❌ | Verify OTP → JWT |
| POST | `/auth/login` | ❌ | Login → JWT |

### Profile
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/profile/setup` | ✅ | First-time onboarding |
| GET | `/profile` | ✅ | Get profile + stats |
| PUT | `/profile` | ✅ | Update skills / availability |

### Opportunities
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/opportunities` | ❌ | List all (filter by `?category=&urgency=&location=`) |
| GET | `/opportunities/nearby` | ❌ | Geo-query (`?lat=&lng=&radius=` in km) |

### Reports
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/report` | ✅ | Submit a crisis report |

### Recommendations & Leaderboard
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/recommendations` | ✅ | Personalised ML-matched opportunities |
| GET | `/leaderboard` | ❌ | Top 10 contributors |

### System
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | API health check |
| GET | `/ingest` | ❌ | Manual ingestion trigger ⚠️ |

---

## 🖥️ Frontend Pages & Routes

The frontend is a hash-based SPA (no React Router dependency). Navigate via `window.location.hash`.

| Hash | Page | Protected |
|---|---|---|
| `#login` | Login | ❌ |
| `#signup` | Sign Up | ❌ |
| `#verify` | OTP Verification | ❌ |
| `#profile-setup` | Profile Onboarding | ✅ |
| `#dashboard` | Main Dashboard | ✅ |
| `#tasks` | Task Discovery + Filters | ✅ |
| `#task-detail` | Task Detail + Map | ✅ |
| `#report` | Submit Crisis Report | ✅ |
| `#profile` | Impact Dashboard | ✅ |
| `#profile-edit` | Edit Profile Settings | ✅ |

### Frontend Architecture
```
src/
├── api/
│   ├── api.ts          # Core fetch wrapper, token helpers (localStorage)
│   └── auth.ts         # All typed API functions (signup, login, profile, etc.)
├── pages/              # One component per route
├── css/                # Per-page stylesheets (glassmorphic design system)
├── navigation.ts       # navigate(), requireAuth(), redirectAfterAuth()
└── router.tsx          # Hash-based SPA router, renders active page
```

### Auth State Management
JWT tokens and user metadata are stored in `localStorage`:
- `localStorage.getItem("token")` — Bearer token
- `localStorage.getItem("user")` — `{ email, isVerified, profileCompleted }`

The `apiFetch()` wrapper in `api.ts` automatically injects the `Authorization` header on every request.

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT tokens signed with `JWT_SECRET` — never expose this
- **Helmet.js** sets secure HTTP headers (XSS, clickjacking, MIME sniff protection)
- Auth middleware validates token signature + expiry on every protected route
- OTPs are hashed before storage and expire after **10 minutes**
- CORS is configured to allow only trusted origins

---

## ⚙️ Environment Variables Reference

### Backend (`.env`)
| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (default: 3000) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `SERP_API_KEY` | ✅ | SerpAPI key for web scraping |
| `URL` | ✅ | Google Apps Script webhook URL for OTP |
| `INGESTION_CONCURRENCY` | ❌ | Parallel ingestion workers (default: 4) |

---

## 🧪 Developer Tools

### Backend Sandbox
Open `http://localhost:3000/test.html` in your browser after starting the server. It provides a visual UI for testing every API endpoint without Postman.

### Frontend Linting
```bash
cd GoogleSolutionChallengeFrontend
npm run lint
```

### Production Build
```bash
cd GoogleSolutionChallengeFrontend
npm run build    # Outputs to /dist
npm run preview  # Preview the production build locally
```

---

## 📈 Roadmap

- [ ] **WebSocket live feed** — Push new opportunities in real-time without polling
- [ ] **ML classification upgrade** — Replace keyword heuristics with a trained classifier
- [ ] **PostGIS boundaries** — True geofence polygon support replacing radius queries
- [ ] **SendGrid / Twilio** — Replace Google Apps Script for production-grade OTP delivery
- [ ] **Volunteer task sign-up** — Full participation tracking with join/withdraw flow
- [ ] **Admin panel** — Moderation interface for reviewing submitted reports

---

## 📄 License

ISC — See individual package `package.json` files for details.
