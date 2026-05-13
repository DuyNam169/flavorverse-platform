from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq
from config import settings

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user_diet: Optional[str] = "normal"
    user_allergies: Optional[List[str]] = []

class ChatResponse(BaseModel):
    reply: str

SYSTEM_PROMPT = """Bạn là FlavorBot — trợ lý ẩm thực AI thân thiện của FlavorVerse.
Bạn giúp người dùng:
- Gợi ý công thức nấu ăn
- Giải thích kỹ thuật nấu ăn
- Tư vấn dinh dưỡng
- Lên thực đơn theo sở thích và sức khỏe
- Thay thế nguyên liệu dị ứng

Trả lời bằng tiếng Việt, thân thiện, ngắn gọn và hữu ích.
Khi gợi ý công thức, nêu rõ nguyên liệu chính và thời gian nấu."""

@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    client = Groq(api_key=settings.groq_api_key)

    system = SYSTEM_PROMPT
    if req.user_allergies:
        system += f"\nLưu ý: Người dùng dị ứng với: {', '.join(req.user_allergies)}. Không gợi ý các món có nguyên liệu này."
    if req.user_diet != "normal":
        system += f"\nChế độ ăn của người dùng: {req.user_diet}."

    messages = [{"role": "system", "content": system}]
    for h in (req.history or []):
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": req.message})

    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=messages,
        max_tokens=800,
        temperature=0.7,
    )

    return ChatResponse(reply=response.choices[0].message.content)
