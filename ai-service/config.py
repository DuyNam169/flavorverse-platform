from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    openweather_api_key: str = ""
    backend_url: str = "http://localhost:8080"

    class Config:
        env_file = ".env"

settings = Settings()
