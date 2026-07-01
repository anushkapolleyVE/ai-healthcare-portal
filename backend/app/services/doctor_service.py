from app.models.doctor import Doctor
from app.models.availability import Availability

from app.repository.doctor_repository import (
    create_doctor,
    get_all_doctors,
    get_doctor_by_id
)

from app.repository.availability_repository import (
    create_slot,
    get_slots_by_doctor
)


def add_doctor(db, doctor):

    db_doctor = Doctor(
        name=doctor.name,
        email=doctor.email,
        speciality=doctor.speciality,
        qualification=doctor.qualification,
        experience=doctor.experience,
        hospital=doctor.hospital
    )

    return create_doctor(db, db_doctor)


def list_doctors(db):
    return get_all_doctors(db)


def doctor_details(db, doctor_id):
    return get_doctor_by_id(db, doctor_id)


def add_slot(db, slot):

    db_slot = Availability(
        doctor_id=slot.doctor_id,
        slot_date=slot.slot_date,
        slot_time=slot.slot_time
    )

    return create_slot(db, db_slot)


def doctor_slots(db, doctor_id):
    return get_slots_by_doctor(db, doctor_id)