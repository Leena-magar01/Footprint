# 🌿 EcoPilot AI — Intelligent Sustainability Assistant & Carbon Tracker

EcoPilot AI is a production-grade, AI-powered web application that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

![Node.js](https://img.shields.io/badge/Node.js-22.x-green?logo=node.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?logo=mongodb)
![Python](https://img.shields.io/badge/Python-3.14-yellow?logo=python)
![License](https://img.shields.io/badge/License-MIT-brightgreen)

---

## 🚀 Features

### 1. Carbon Footprint Tracking
Track emissions from **transportation**, **electricity**, **food**, **water**, and **shopping** with realistic emission factors and live carbon preview.

### 2. AI-Powered Personalized Insights
Gemini 1.5 Flash analyzes your 30-day footprint history and generates targeted recommendations with estimated CO₂ reduction and impact ratings.

### 3. Smart Eco Challenges
Daily and weekly gamified challenges with points, streaks, and badge progression:
- 🌱 Green Beginner → 🍀 Eco Starter → 🌲 Eco Warrior → ⚡ Carbon Hero

### 4. Analytics Dashboard
- **Doughnut Chart**: Category breakdown (Chart.js)
- **Line Chart**: 7-day emission trend
- **Equivalents**: Trees saved, driving km avoided, energy conserved

### 5. AI Prediction System (ML)
Python Scikit-learn models (Linear Regression + Random Forest) forecast future carbon emissions and show trend analysis.

### 6. EcoLens — Receipt & Image Analysis
Upload photos of food, receipts, vehicles, or appliances. AI identifies the item, estimates carbon impact, and suggests greener alternatives.

### 7. Smart Notifications
Auto-generated alerts when emissions spike, with actionable recommendations.

### 8. Goal Management
Set category-specific carbon reduction goals (5–50%) with auto-tracking progress bars and budget calculations.

### 9. Community & Leaderboard
Global rankings by eco-points, achievement badges, and social competition.

### 10. Accessibility (WCAG)
High-contrast mode, keyboard navigation, ARIA labels, screen reader support, and responsive mobile-first design.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Bootstrap 5, Chart.js |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB (Mongoose) / MongoMemoryServer fallback |
| **Authentication** | JWT + bcrypt password hashing |
| **AI** | Google Gemini 1.5 Flash API |
| **Machine Learning** | Python, Scikit-learn (Linear Regression, Random Forest) |
| **Testing** | Jest, Supertest, ts-jest |
| **Security** | Rate limiting, CORS, input validation, env variables |

---

## 📁 Project Structure

```
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config/             # DB connection, challenge seeder
│   │   ├── controllers/        # Auth, Footprint, Challenge, Goal, AI, Leaderboard
│   │   ├── middleware/         # JWT auth, rate limiting
│   │   ├── models/            # Mongoose schemas (User, Footprint, Challenge, Goal, etc.)
│   │   ├── routes/            # API route definitions
│   │   └── services/          # Emission calculator, Gemini AI, ML service
│   └── .env                   # Environment variables
│
├── frontend/                   # React + Vite application
│   └── src/
│       ├── components/        # Dashboard, Tracker, EcoLens, Challenges, Goals, etc.
│       ├── context/           # AuthContext, ThemeContext (high-contrast)
│       ├── services/          # API client
│       └── tests/             # Unit tests
│
└── ml/                        # Python ML prediction service
    ├── predict.py             # Scikit-learn forecasting script
    └── requirements.txt       # Python dependencies
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** ≥ 18 and **npm**
- **Python** ≥ 3.10

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/Leena-magar01/Footprint.git
cd Footprint

# 2. Setup Python ML environment
python -m venv ml/venv
ml/venv/Scripts/pip install -r ml/requirements.txt   # Windows
# ml/venv/bin/pip install -r ml/requirements.txt     # Linux/Mac

# 3. Start Backend (Terminal 1)
cd backend
npm install
npm run dev
# → Running on http://localhost:5000

# 4. Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

### Optional: Enable Gemini AI
Add your API key to `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```
Without a key, the app runs with intelligent mock responses.

---

## 🧪 Testing

```bash
# Backend tests (22 tests)
cd backend && npm test

# Frontend tests (5 tests)
cd frontend && npm test
```

**27 total tests passing** across unit tests and integration tests.

---

## 🔒 Security

- JWT authentication with 7-day expiry
- bcrypt password hashing (10 salt rounds)
- API rate limiting (100 req/15min, 20 auth/hr)
- CORS protection
- Input validation on all endpoints
- Environment variables for secrets

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Authenticate |
| GET | `/api/auth/me` | Get profile |
| POST | `/api/footprint` | Log carbon activity |
| GET | `/api/footprint/history` | Paginated log history |
| GET | `/api/footprint/analytics` | Aggregated analytics + equivalents |
| GET | `/api/footprint/predict` | ML carbon forecast |
| GET | `/api/challenges` | List eco challenges |
| POST | `/api/challenges/join` | Join a challenge |
| POST | `/api/challenges/complete` | Complete a challenge |
| POST | `/api/goals` | Create reduction goal |
| GET | `/api/goals` | List goals |
| GET | `/api/ai/insights` | AI personalized coaching |
| POST | `/api/ai/ecolens` | Image carbon analysis |
| GET | `/api/leaderboard` | Global rankings |
| GET | `/api/notifications` | Smart alerts |

---

## 📜 License

This project is licensed under the MIT License.

---

Built for the **Carbon Footprint Awareness Challenge** 🌍
