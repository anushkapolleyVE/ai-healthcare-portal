from sqlalchemy.orm import Session

from app.models.chat import ChatMessage


def save_message(db: Session, user_id: int, role: str, message: str):
    record = ChatMessage(user_id=user_id, role=role, message=message)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_recent_messages(db: Session, user_id: int, limit: int = 10):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(messages))


def get_all_messages(db: Session, user_id: int):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )