from fastapi import APIRouter,Depends,HTTPException

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.appointment import AppointmentCreate

from app.services.appointment_service import (
    book_appointment,
    my_appointments
)

from app.auth import get_current_user


router=APIRouter(

    prefix="/appointments",

    tags=["Appointments"]

)


@router.post("/")

def book(

    appointment:AppointmentCreate,

    db:Session=Depends(get_db),

    current_user=Depends(get_current_user)

):

    try:

        return book_appointment(
            db,
            current_user,
            appointment
        )

    except Exception as e:

        raise HTTPException(
            400,
            str(e)
        )


@router.get("/me")

def mine(

    db:Session=Depends(get_db),

    current_user=Depends(get_current_user)

):

    return my_appointments(
        db,
        current_user
    )
from app.services.appointment_service import (
    book_appointment,
    my_appointments,
    cancel_appointment,
)

@router.patch("/{appointment_id}/cancel")
def cancel(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return cancel_appointment(db, current_user, appointment_id)
    except Exception as e:
        raise HTTPException(400, str(e))