from sqlalchemy.orm import Session

from app.models.symptom_check import SymptomCheck


def create_symptom_check(db: Session, symptom_check: SymptomCheck):
    db.add(symptom_check)
    db.commit()
    db.refresh(symptom_check)
    return symptom_check


def get_user_symptom_checks(db: Session, user_id: int):
    return (
        db.query(SymptomCheck)
        .filter(SymptomCheck.user_id == user_id)
        .order_by(SymptomCheck.created_at.desc())
        .all()
    )