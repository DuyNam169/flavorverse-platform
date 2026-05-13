from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq
from config import settings
import httpx, json

router = APIRouter()

class SuggestRequest(BaseModel):
    user_location: Optional[str] = "Hà Nội, Việt Nam"
    latitude: Optional[float] = 21.028
    longitude: Optional[float] = 105.834
    diet_type: Optional[str] = "normal"
    allergies: Optional[List[str]] = []
    calorie_goal: Optional[int] = 2000
    mood: Optional[str] = None
    available_ingredients: Optional[List[str]] = []

class RecipeSuggestion(BaseModel):
    title: str
    description: str
    country: str
    reason: str
    estimated_calories: int
    difficulty: str
    cook_time_minutes: int

class SuggestResponse(BaseModel):
    suggestions: List[RecipeSuggestion]
    weather_summary: Optional[str] = None
    ai_message: str

async def get_weather(lat: float, lon: float) -> dict:
    if not settings.openweather_api_key:
        return {"temp": 28, "description": "nắng", "feels_like": 30}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"lat": lat, "lon": lon, "appid": settings.openweather_api_key,
                        "units": "metric", "lang": "vi"},
                timeout=5.0)
            d = r.json()
            return {
                "temp": round(d["main"]["temp"]),
                "feels_like": round(d["main"]["feels_like"]),
                "description": d["weather"][0]["description"],
                "humidity": d["main"]["humidity"],
            }
    except Exception:
        return {"temp": 28, "description": "nắng", "feels_like": 30}

@router.post("", response_model=SuggestResponse)
async def suggest_recipes(req: SuggestRequest):
    weather = await get_weather(req.latitude or 21.028, req.longitude or 105.834)
    client = Groq(api_key=settings.groq_api_key)

    allergy_text = f"Dị ứng: {', '.join(req.allergies)}" if req.allergies else "Không có dị ứng"
    ingr_text = f"Có sẵn: {', '.join(req.available_ingredients)}" if req.available_ingredients else ""
    mood_text = f"Tâm trạng hôm nay: {req.mood}" if req.mood else ""

    prompt = f"""Bạn là chuyên gia ẩm thực AI. Gợi ý 4 món ăn phù hợp cho người dùng.

Thông tin người dùng:
- Vị trí: {req.user_location}
- Thời tiết: {weather['temp']}°C, {weather['description']}
- Chế độ ăn: {req.diet_type}
- {allergy_text}
- Mục tiêu calo: {req.calorie_goal} kcal/ngày
- {ingr_text}
- {mood_text}

Trả về JSON:
{{
  "suggestions": [
    {{
      "title": "Tên món",
      "description": "Mô tả ngắn gọn",
      "country": "VN",
      "reason": "Lý do phù hợp (liên quan thời tiết/sức khỏe)",
      "estimated_calories": 400,
      "difficulty": "easy",
      "cook_time_minutes": 30
    }}
  ],
  "weather_summary": "Tóm tắt thời tiết và lý do chọn món",
  "ai_message": "Lời nhắn thân thiện bằng tiếng Việt"
}}

Chỉ trả JSON, không text thêm."""

    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
        temperature=0.7,
    )

    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    data = json.loads(text)
    return SuggestResponse(**data)
