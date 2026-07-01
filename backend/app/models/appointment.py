from sqlalchemy import (
    Column,
    Integer,
    Date,
    Time,
    String,
    ForeignKey,
    DateTime,
)

from sqlalchemy.sql import func

from app.database.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id")
    )

    appointment_date = Column(Date)

    appointment_time = Column(Time)

    status = Column(
        String(30),
        default="Booked"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )