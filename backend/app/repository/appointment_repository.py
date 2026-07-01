from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.models.availability import Availability


def create_appointment(db: Session, appointment: Appointment):
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def get_slot(db, doctor_id, date, time):
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


def book_slot_atomic(db, doctor_id, date, time):
    result = (
        db.query(Availability)
        .filter(
            Availability.doctor_id == doctor_id,
            Availability.slot_date == date,
            Availability.slot_time == time,
            Availability.available == True
        )
        .update({"available": False}, synchronize_session=False)
    )

    db.commit()

    if result == 0:
        return None

    return (
        db.query(Availability)
        .filter(
            Availability.doctor_id == doctor_id,
            Availability.slot_date == date,
            Availability.slot_time == time,
        )
        .first()
    )


def free_slot(db, doctor_id, date, time):
    slot = (
        db.query(Availability)
        .filter(
            Availability.doctor_id == doctor_id,
            Availability.slot_date == date,
            Availability.slot_time == time,
        )
        .first()
    )

    if slot:
        slot.available = True
        db.commit()

    return slot


def get_user_appointments(db, user_id):
    return (
        db.query(Appointment)
        .filter(Appointment.user_id == user_id)
        .all()
    )


def get_appointment_by_id(db, appointment_id):
    return (
        db.query(Appointment)
        .filter(Appointment.id == appointment_id)
        .first()
    )


def get_active_user_appointment(db, user_id, doctor_id, date, time):
    return (
        db.query(Appointment)
        .filter(
            Appointment.user_id == user_id,
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == date,
            Appointment.appointment_time == time,
            Appointment.status != "Cancelled"
        )
        .first()
    )