from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth import get_current_user
from app.schemas.symptom import SymptomCheckRequest, SymptomCheckResponse
from app.services.symptom_service import check_symptoms, symptom_history

router = APIRouter(prefix="/symptom-checker", tags=["Symptom Checker"])


@router.post("/", response_model=SymptomCheckResponse)
def check(
    payload: SymptomCheckRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return check_symptoms(db, current_user, payload.symptoms)
    except Exception as e:
        raise HTTPException(400, str(e))


@router.get("/history", response_model=list[SymptomCheckResponse])
def history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return symptom_history(db, current_user)