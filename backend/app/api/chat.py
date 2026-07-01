from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth import get_current_user
from app.schemas.chat import ChatRequest, ChatMessageResponse
from app.services.chat_service import send_message, chat_history

router = APIRouter(prefix="/chat", tags=["Medical Chatbot"])


@router.post("/", response_model=ChatMessageResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return send_message(db, current_user, payload.message)
    except Exception as e:
        raise HTTPException(400, str(e))


@router.get("/history", response_model=list[ChatMessageResponse])
def history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return chat_history(db, current_user)