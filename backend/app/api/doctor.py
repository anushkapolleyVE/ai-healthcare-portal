from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.doctor import DoctorCreate
from app.schemas.availability import AvailabilityCreate

from app.services.doctor_service import (
    add_doctor,
    list_doctors,
    doctor_details,
    add_slot,
    doctor_slots
)

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)


@router.post("/")
def create(
    doctor: DoctorCreate,
    db: Session = Depends(get_db)
):
    return add_doctor(db, doctor)


@router.get("/")
def get_all(
    db: Session = Depends(get_db)
):
    return list_doctors(db)


@router.get("/{doctor_id}")
def get_one(
    doctor_id: int,
    db: Session = Depends(get_db)
):

    doctor = doctor_details(db, doctor_id)

    if doctor is None:
        raise HTTPException(404, "Doctor not found")

    return doctor


@router.post("/availability")
def create_slot(
    slot: AvailabilityCreate,
    db: Session = Depends(get_db)
):
    return add_slot(db, slot)


@router.get("/{doctor_id}/slots")
def get_slots(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    return doctor_slots(db, doctor_id)