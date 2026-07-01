from sqlalchemy.orm import Session

from app.models.availability import Availability


def create_slot(db: Session, slot: Availability):
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


def get_slots_by_doctor(db: Session, doctor_id: int):
    return (
        db.query(Availability)
        .filter(
            Availability.doctor_id == doctor_id,
            Availability.available == True
        )
        .all()
    )


def get_slot(db: Session, doctor_id, date, time):
    return (
        db.query(Availability)
        .filter(
            Availability.doctor_id == doctor_id,
            Availability.slot_date == date,
            Availability.slot_time == time,
            Availability.available == True
        )
        .first()
    )