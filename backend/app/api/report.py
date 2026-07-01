from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth import get_current_user
from app.schemas.report import ReportSummaryResponse
from app.services.report_service import summarize_report, report_history

router = APIRouter(prefix="/reports", tags=["Report Summarizer"])


@router.post("/summarize", response_model=ReportSummaryResponse)
async def summarize(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are supported")

    file_bytes = await file.read()

    try:
        return summarize_report(db, current_user, file.filename, file_bytes)
    except Exception as e:
        raise HTTPException(400, str(e))


@router.get("/history", response_model=list[ReportSummaryResponse])
def history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return report_history(db, current_user)