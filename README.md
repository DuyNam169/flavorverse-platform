# 🍜 FlavorVerse — Full Stack

M��ng xã hội công thức nấu ăn thông minh với AI.

Stack: React 18 + Vite + Tailwind | Spring Boot 3 + PostgreSQL | FastAPI + Groq AI

---

## 🚀 Chạy nhanh nhất (Docker)

```bash
# 1. Copy env và điền API keys
cp .env.example .env
# Mở .env và điền GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GROQ_API_KEY...

# 2. Chạy toàn bộ hệ thống
docker-compose up -d

# 3. Truy cập
# Web:      http://localhost
# API:      http://localhost:8080/api
# AI Docs:  http://localhost:8000/docs
```

**Chỉ cần có Docker — không cần cài Java, Node, Python!**

---

## 🛠️ Chạy từng service (Development)

### Frontend (React)
```bash
cd frontend && cp .env.example .env && npm install && npm install @react-oauth/google && npm run dev
# → http://localhost:5173
```

### Backend (Spring Boot - cần Java 21)
docker stop flavorverse-backend
```bash
cd backend && cp application-dev-example.yml application-dev.yml && mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
# → http://localhost:8080
```

### AI Service (FastAPI)
```bash
cd ai-service && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000/docs
```

### Chỉ chạy DB
```bash
docker-compose up postgres -d
```

---

## 📁 Cấu trúc

```
flavorverse/
├── frontend/         React + Vite + Tailwind
├── backend/          Spring Boot 3 + JPA + PostgreSQL
│   └── src/main/java/com/flavorverse/
│       ├── controller/  AuthController, RecipeController, UserController, PlannerController
│       ├── service/     UserService, RecipeService, MealPlannerService, CloudinaryService
│       ├── entity/      User, Recipe, Ingredient, Step, Review, MealPlan, MealSlot
│       ├── security/    JwtUtil, JwtAuthFilter
│       └── config/      SecurityConfig, GlobalExceptionHandler
├── ai-service/       FastAPI + Groq
│   └── routers/      nutrition.py, suggest.py, planner.py, chat.py
├── docker-compose.yml
└── .env.example      ← Sao chép thành .env
```

---

## 🔑 API Keys cần đăng ký (miễn phí)

| Service | URL | Dùng cho |
|---------|-----|---------|
| Groq | https://console.groq.com | AI chat, gợi ý, dinh dưỡng |
| Google OAuth2 | https://console.cloud.google.com | Đăng nhập |
| Cloudinary | https://cloudinary.com | Upload ảnh |
| OpenWeatherMap | https://openweathermap.org/api | Gợi ý theo thời tiết |

---

## 📡 API chính

| Endpoint | Mô tả |
|----------|-------|
| POST /api/auth/google/callback | Đăng nhập Google |
| GET /api/recipes | Feed công thức |
| POST /api/recipes | Tạo công thức |
| POST /api/recipes/:id/fork | Fork công thức |
| GET /api/planner?weekStart= | Thực đơn tuần |
| POST /ai/nutrition | AI phân tích dinh dưỡng |
| POST /ai/suggest | AI gợi ý theo thời tiết |
| POST /ai/planner/generate | AI tạo thực đơn cả tuần |
| POST /ai/chat | FlavorBot chatbot |

---

## 🐳 Lệnh Docker hữu ích

```bash
docker-compose logs -f backend      # Xem logs backend
docker-compose restart backend      # Restart service
docker-compose down                 # Dừng tất cả
docker-compose down -v              # Dừng + xóa data
docker-compose up -d --build        # Rebuild và chạy lại
```
