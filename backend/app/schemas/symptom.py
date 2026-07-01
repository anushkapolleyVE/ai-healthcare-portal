from datetime import datetime
from pydantic import BaseModel


class SymptomCheckRequest(BaseModel):
    symptoms: str


class SymptomCheckResponse(BaseModel):
    id: int
    symptoms_text: str
    ai_response: str
    created_at: datetime

    class Config:
        from_attributes = True