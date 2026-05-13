from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq
from config import settings
import json

router = APIRouter()

class IngredientItem(BaseModel):
    name: str
    amount: float
    unit: str

class NutritionRequest(BaseModel):
    ingredients: List[IngredientItem]
    servings: int = 4

class NutritionResponse(BaseModel):
    calories_per_serving: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sugar_g: float
    health_notes: Optional[str] = None

@router.post("", response_model=NutritionResponse)
async def analyze_nutrition(req: NutritionRequest):
    client = Groq(api_key=settings.groq_api_key)

    ingredients_text = "\n".join(
        f"- {i.amount} {i.unit} {i.name}" for i in req.ingredients
    )

    prompt = f"""Phân tích dinh dưỡng cho {req.servings} khẩu phần với các nguyên liệu:

{ingredients_text}

Trả về JSON với các trường:
- calories_per_serving: int (kcal)
- protein_g: float
- carbs_g: float
- fat_g: float
- fiber_g: float
- sugar_g: float
- health_notes: string (nhận xét ngắn bằng tiếng Việt về giá trị dinh dưỡng)

Chỉ trả JSON, không có text thêm."""

    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.1,
    )

    text = response.choices[0].message.content.strip()
    # Strip markdown fences if any
    text = text.replace("```json", "").replace("```", "").strip()
    data = json.loads(text)
    return NutritionResponse(**data)
