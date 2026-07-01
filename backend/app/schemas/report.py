from datetime import datetime
from pydantic import BaseModel


class ReportSummaryResponse(BaseModel):
    id: int
    filename: str
    summary_text: str
    created_at: datetime

    class Config:
        from_attributes = True