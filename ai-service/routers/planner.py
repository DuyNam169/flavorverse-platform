from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict
from groq import Groq
from config import settings
import json

router = APIRouter()

class GeneratePlanRequest(BaseModel):
    diet_type: str = "normal"
    calorie_goal: int = 2000
    allergies: List[str] = []
    country_preference: Optional[str] = None
    week_start: Optional[str] = None
    num_days: int = 7

class MealEntry(BaseModel):
    title: str
    description: str
    estimated_calories: int
    country: str
    difficulty: str

class DayPlan(BaseModel):
    day: str
    breakfast: Optional[MealEntry]
    lunch: MealEntry
    dinner: MealEntry
    total_calories: int

class GeneratePlanResponse(BaseModel):
    week_plan: List[DayPlan]
    weekly_calories: int
    nutrition_summary: str
    tips: List[str]

DAYS_VN = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

@router.post("/generate", response_model=GeneratePlanResponse)
async def generate_meal_plan(req: GeneratePlanRequest):
    client = Groq(api_key=settings.groq_api_key)

    allergy_text = f"Tránh: {', '.join(req.allergies)}" if req.allergies else ""
    country_pref = f"Ưu tiên ẩm thực: {req.country_preference}" if req.country_preference else "Đa dạng ẩm thực"

    prompt = f"""Lập thực đơn {req.num_days} ngày cho người dùng.

Yêu cầu:
- Chế độ ăn: {req.diet_type}
- Mục tiêu: {req.calorie_goal} kcal/ngày
- {allergy_text}
- {country_pref}
- Đa dạng, không lặp món

Trả về JSON:
{{
  "week_plan": [
    {{
      "day": "Thứ 2",
      "breakfast": {{"title":"Tên","description":"Mô tả","estimated_calories":350,"country":"VN","difficulty":"easy"}},
      "lunch": {{"title":"Tên","description":"Mô tả","estimated_calories":600,"country":"VN","difficulty":"medium"}},
      "dinner": {{"title":"Tên","description":"Mô tả","estimated_calories":700,"country":"VN","difficulty":"medium"}},
      "total_calories": 1650
    }}
  ],
  "weekly_calories": 11550,
  "nutrition_summary": "Nhận xét về cân bằng dinh dưỡng cả tuần",
  "tips": ["Mẹo 1", "Mẹo 2", "Mẹo 3"]
}}

Các ngày: {', '.join(DAYS_VN[:req.num_days])}
Chỉ trả JSON, không text thêm."""

    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=3000,
        temperature=0.6,
    )

    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    data = json.loads(text)
    return GeneratePlanResponse(**data)
