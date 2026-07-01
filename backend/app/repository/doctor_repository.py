from app.models.user import User
from app.models.doctor import Doctor
from app.models.availability import Availability
from app.models.appointment import Appointment
from sqlalchemy.orm import Session
from app.models.doctor import Doctor


def create_doctor(db: Session, doctor: Doctor):
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


def get_all_doctors(db: Session):
    return db.query(Doctor).all()


def get_doctor_by_id(db: Session, doctor_id: int):
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()


def get_doctors_by_speciality(db: Session, speciality: str):
    return (
        db.query(Doctor)
        .filter(Doctor.speciality == speciality)
        .all()
    )