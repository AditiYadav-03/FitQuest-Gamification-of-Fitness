# FitQuest – Gamification of Physical Fitness 🏆⚡

> A full-stack social fitness platform that transforms everyday physical activities into engaging game experiences through RPG-style levels, XP mechanics, consistency streaks, milestone badges, community feeds, and competitive leaderboards.

---

## 🌟 Project Highlights

- **Frontend**: Modern React 19 + Vite + TypeScript + Tailwind CSS with dark fitness-tech aesthetics (`#0B0F19`), electric lime accents (`#10E57A`), glowing status cards, and interactive Recharts data visualizations.
- **Backend**: Python FastAPI with high-performance asynchronous endpoints, Pydantic v2 data validation, and JWT token authentication.
- **Database & Persistence**: SQLAlchemy ORM with multi-database support (production MySQL with automatic SQLite fallback). Pre-seeded with realistic athletes, workouts, community feed interactions, quests, and unlocked badges.
- **Gamification Engine**:
  - **Scientific MET-based Calorie Formula**: Accurately computes energy expenditure using ACSM metabolic equivalent standards.
  - **Transparent XP & FitCoins Formula**: Duration, distance, intensity multipliers, and calorie output convert directly to XP and spendable FitCoins.
  - **Dynamic Level Progression**: Exponential curve (`XP required = 100 * level^2`) ensures satisfying early progress with long-term retention goals.
  - **Streak Multiplier System**: Consecutive-day workouts award bonus XP multipliers and streak milestone badges.
  - **10 Verified Badges**: Bronze, Silver, Gold, and Diamond tiers with automated triggers upon meeting workout criteria.
  - **Active Quests / Challenges**: Daily sprint blitzes, weekly distance targets, and gym grinds with automated activity tracking and reward claiming.
  - **Dual Competitive Leaderboards**: Global Arena podium and Friends League with all-time, 30-day, and 7-day filters.
  - **Social Feed**: Community updates, activity auto-publishing, kudos/likes, comments, and athlete search.
  - **Admin Control Center**: System metrics, user activation/deactivation, role management, challenge creator, and feed moderation.

---

## 👥 Pre-Seeded Demo Accounts

You can test any role immediately. The login screen also features **one-click demo login buttons**:

| Account Name | Email | Password | Role | Level & Description |
|:---|:---|:---|:---|:---|
| **Alex Rivers** | `alex@fitquest.com` | `AlexPass123!` | Athlete | Level 8 Hybrid Runner / Cyclist |
| **Sarah Chen** | `sarah@fitquest.com` | `SarahPass123!` | Athlete | Level 9 Marathoner (14-day streak) |
| **Marcus Vance** | `marcus@fitquest.com` | `MarcusPass123!` | Athlete | Level 5 Strength & Powerlifter |
| **Elena Rostova** | `elena@fitquest.com` | `ElenaPass123!` | Athlete | Level 3 Yoga & Flexibility |
| **FitQuest Admin** | `admin@fitquest.com` | `AdminPass123!` | Admin | System Administrator & Moderator |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Virtual environment is pre-configured at `/.venv`)
- **Node.js 18+** & **npm**

---

### Option A: One-Click Startup (Windows)

Double click `start_fitquest.bat` or run in PowerShell:

```powershell
.\start_fitquest.bat
```

This launches both the FastAPI backend server on `http://localhost:8000` and the React frontend on `http://localhost:5173`.

---

### Option B: Manual Step-by-Step

#### 1. Backend Startup

In your first terminal:

```powershell
cd backend
..\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```

- Backend API: `http://localhost:8000`
- Swagger Interactive Docs: `http://localhost:8000/api/v1/docs`
- Health check: `http://localhost:8000/health`

#### 2. Frontend Startup

In your second terminal:

```powershell
cd frontend
npm run dev
```

- Open your browser to: `http://localhost:5173`

---

## 🧪 Automated Test Suite

The backend contains **20 unit and integration tests** covering all critical business logic and API routes.

To run the complete test suite:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\.venv\Scripts\python.exe -m pytest backend/tests/ -v
```

### End-to-End Verification

To execute the 11-step end-to-end user journey test against the live seeded database:

```powershell
.\.venv\Scripts\python.exe backend/tests/verify_e2e.py
```

### Production Build

To verify the TypeScript frontend production build:

```powershell
cd frontend
npm run build
```

---

## 🎮 Gamification Engine Architecture

### 1. Calorie Computation (MET Standards)
$$\text{Calories} = \frac{\text{MET} \times 3.5 \times \text{Weight (kg)}}{200} \times \text{Duration (mins)}$$

Configured MET values:
- **Running**: 9.8
- **Cycling**: 7.5
- **HIIT**: 10.0
- **Swimming**: 8.0
- **Gym / Strength**: 6.0
- **Walking**: 3.8
- **Yoga**: 3.0

### 2. XP & FitCoins Reward Formula
$$\text{Base XP} = (\text{Duration} \times 3) + (\text{Distance (km)} \times 20) + \left(\frac{\text{Calories}}{10}\right)$$
$$\text{Total XP} = \text{Base XP} \times \text{Intensity Multiplier}$$

- **Intensity Multipliers**: Low: `0.85x`, Medium: `1.0x`, High: `1.25x`
- **FitCoins**: `max(5, round(Total XP / 10))`

### 3. Level Progression Curve
$$\text{Level} = \lfloor\sqrt{\text{Total XP} / 100}\rfloor + 1$$

- Level 1: 0 – 99 XP
- Level 2: 100 – 399 XP
- Level 3: 400 – 899 XP
- Level 4: 900 – 1599 XP
- Level 5: 1600 – 2499 XP
- Level 10: 8,100+ XP

### 4. Streak Multiplier
- Extending an existing streak awards `streak * 15` Bonus XP and `streak * 5` Bonus FitCoins.
- Milestones at 3 days, 7 days, 14 days, and 30 days trigger system badges.

---

## 📡 API Endpoints Reference

| Category | Method | Path | Description |
|:---|:---:|:---|:---|
| **Auth** | `POST` | `/api/v1/auth/register` | Register new athlete (+100 starter coins) |
| | `POST` | `/api/v1/auth/login` | JWT login token exchange |
| | `GET` | `/api/v1/auth/me` | Fetch authenticated athlete profile |
| | `POST` | `/api/v1/auth/forgot-password` | Generate password reset token |
| | `POST` | `/api/v1/auth/reset-password` | Confirm new password |
| **Activities** | `POST` | `/api/v1/activities` | Record workout, calculate XP/calories/streak |
| | `GET` | `/api/v1/activities` | Query workout history with filters & sorting |
| | `GET` | `/api/v1/activities/stats` | Aggregated workout totals & sport breakdown |
| | `PUT` | `/api/v1/activities/{id}` | Edit workout parameters |
| | `DELETE` | `/api/v1/activities/{id}` | Delete workout record |
| **Gamification** | `GET` | `/api/v1/gamification/badges` | Complete badges matrix with earned status |
| | `GET` | `/api/v1/gamification/transactions` | XP audit trail & ledger |
| | `GET` | `/api/v1/gamification/progress` | Level progress & remaining XP to next rank |
| **Challenges** | `GET` | `/api/v1/challenges` | Active quests & enrolled progress |
| | `POST` | `/api/v1/challenges/{id}/join` | Enroll in quest |
| | `POST` | `/api/v1/challenges/{id}/leave` | Withdraw from quest |
| | `POST` | `/api/v1/challenges/{id}/claim` | Claim completed quest XP & FitCoins |
| **Leaderboards** | `GET` | `/api/v1/leaderboards` | Global & Friends competitive rankings |
| **Social** | `GET` | `/api/v1/social/feed` | Community feed with attached workouts |
| | `POST` | `/api/v1/social/posts` | Share workout update to community |
| | `POST` | `/api/v1/social/posts/{id}/like` | Toggle workout kudos / like |
| | `POST` | `/api/v1/social/posts/{id}/comments` | Post comment on community workout |
| | `GET` | `/api/v1/social/friends` | Friends list & pending requests |
| | `POST` | `/api/v1/social/friends/request` | Send athlete friend request |
| | `POST` | `/api/v1/social/friends/{id}/respond` | Accept or decline friend request |
| **Analytics** | `GET` | `/api/v1/analytics/dashboard` | Today's stats, 7-day chart, active quests |
| | `GET` | `/api/v1/analytics/xp-trends` | 30-day cumulative XP progression |
| **Admin** | `GET` | `/api/v1/admin/stats` | System overview (athletes, workouts, XP) |
| | `GET` | `/api/v1/admin/users` | User management directory & search |
| | `PUT` | `/api/v1/admin/users/{id}/status` | Activate / deactivate user account |
| | `PUT` | `/api/v1/admin/users/{id}/role` | Promote/demote between athlete and admin |
| | `POST` | `/api/v1/admin/challenges` | Create new system quest |
| | `DELETE` | `/api/v1/admin/posts/{id}` | Moderate / remove community post |

---

## 🏛️ Project Directory Structure

```
Gamification_of_Physical_fitness/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy DB models (user, activity, gamification, social)
│   │   ├── routers/           # FastAPI modular API routers
│   │   ├── schemas/           # Pydantic v2 validation schemas
│   │   ├── services/          # XP engine, badge service, challenge tracker, auth service
│   │   ├── config.py          # App settings & MySQL/SQLite fallback
│   │   ├── database.py        # SQLAlchemy session & engine lifecycle
│   │   ├── dependencies.py    # JWT authentication & admin guards
│   │   └── main.py            # FastAPI entry point & CORS configuration
│   ├── tests/
│   │   ├── conftest.py        # Pytest fixtures & isolated test DB
│   │   ├── test_activities.py
│   │   ├── test_admin_and_gamification.py
│   │   ├── test_auth.py
│   │   ├── test_challenges.py
│   │   ├── test_notifications_and_profile.py
│   │   ├── test_social_and_leaderboard.py
│   │   ├── test_xp_engine.py
│   │   └── verify_e2e.py      # 11-step end-to-end verification script
│   ├── fitquest.db            # Seeded SQLite database
│   ├── requirements.txt       # Python dependencies
│   └── seed_data.py           # Database seeder script
├── frontend/
│   ├── src/
│   │   ├── components/        # Layout, Sidebar, Navbar, Modals, Buttons, Inputs
│   │   ├── context/           # AuthContext, NotificationContext with confetti
│   │   ├── pages/             # 12 complete, responsive application views
│   │   ├── services/          # Axios HTTP client with JWT interceptors
│   │   ├── types/             # TypeScript interfaces for full type-safety
│   │   ├── App.tsx            # Protected & public routing
│   │   ├── index.css          # Custom styling, dark glass panels, gradient tokens
│   │   └── main.tsx           # Application mount
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── start_fitquest.bat         # Single-click launch script
└── README.md
```

---

## 🎓 University Presentation Walkthrough

When presenting or evaluating FitQuest:

1. **Landing Page (`/`)**: Show the hero banner, RPG gamification narrative, interactive feature highlights, and how everyday workouts convert to levels.
2. **One-Click Demo Login (`/login`)**: Click **Alex Rivers** to log in instantly.
3. **Dashboard (`/dashboard`)**:
   - Highlight the 7-day consistency streak counter with flame indicator.
   - Show today's calories, distance, and XP breakdown.
   - View the 7-day interactive workout activity chart.
4. **Log a Workout (`/activities` -> "Log Workout")**:
   - Select **Running** or **Cycling**.
   - Watch the live XP and FitCoins estimator calculate in real-time as duration and intensity change.
   - Submit the workout: see toast notification, confetti achievement animation, and instant XP increment.
5. **Quests & Challenges (`/challenges`)**:
   - View daily and weekly active quests.
   - Show how logged activities automatically increment challenge progress bars.
   - Claim rewards for completed quests.
6. **Competitive Leaderboard (`/leaderboard`)**:
   - Show the podium layout with medals and crowns.
   - Switch between **Global Arena** and **Friends League**, and filter by timeframes.
7. **Social Community (`/community`)**:
   - View feed updates with embedded workout cards.
   - Give kudos/likes and write comments.
   - Use athlete search to find friends and send connection requests.
8. **Admin Panel (`/admin`)**:
   - Sign in as **Admin Demo** (`admin@fitquest.com`).
   - View real-time system metrics (total athletes, workouts logged, XP distributed).
   - Demonstrate user moderation (activate/deactivate users) and the Quest Creator.
