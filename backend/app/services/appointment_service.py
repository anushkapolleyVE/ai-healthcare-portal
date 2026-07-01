from app.models.appointment import Appointment
from app.models.user import User
from app.models.doctor import Doctor

from app.repository.appointment_repository import (
    create_appointment,
    book_slot_atomic,
    free_slot,
    get_user_appointments,
    get_appointment_by_id,
    get_active_user_appointment,
)

from app.services.email_service import send_booking_email
from app.services.calendar_service import create_calendar_invite


def book_appointment(db, current_user, appointment):

    # Prevent the same user from double-booking the same doctor/slot
    existing = get_active_user_appointment(
        db,
        current_user.id,
        appointment.doctor_id,
        appointment.appointment_date,
        appointment.appointment_time
    )

    if existing:
        raise Exception("You already have an appointment for this slot")

    # Atomically claim the slot (prevents race conditions)
    slot = book_slot_atomic(
        db,
        appointment.doctor_id,
        appointment.appointment_date,
        appointment.appointment_time
    )

    if slot is None:
        raise Exception("Slot not available")

    db_appointment = Appointment(
        user_id=current_user.id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        status="Booked"
    )

    try:
        appointment = create_appointment(db, db_appointment)
    except Exception:
        # roll back the slot claim if appointment creation fails
        free_slot(
            db,
            appointment.doctor_id,
            appointment.appointment_date,
            appointment.appointment_time
        )
        raise

    doctor = db.query(Doctor).filter(
        Doctor.id == appointment.doctor_id
    ).first()

    calendar_file = create_calendar_invite(
        appointment.id,
        current_user.name,
        doctor.name,
        str(appointment.appointment_date),
        str(appointment.appointment_time)
    )

    send_booking_email(
        patient_email=current_user.email,
        patient_name=current_user.name,
        doctor_name=doctor.name,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        attachment_path=calendar_file
    )

    return appointment


def my_appointments(db, current_user):
    return get_user_appointments(db, current_user.id)


def cancel_appointment(db, current_user, appointment_id):
    appointment = get_appointment_by_id(db, appointment_id)

    if appointment is None:
        raise Exception("Appointment not found")

    if appointment.user_id != current_user.id:
        raise Exception("You cannot cancel someone else's appointment")

    if appointment.status == "Cancelled":
        raise Exception("Appointment is already cancelled")

    appointment.status = "Cancelled"
    db.commit()
    db.refresh(appointment)

    # free the slot back up
    free_slot(
        db,
        appointment.doctor_id,
        appointment.appointment_date,
        appointment.appointment_time
    )

    return appointment