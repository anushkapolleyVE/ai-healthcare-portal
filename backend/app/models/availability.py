from sqlalchemy import Column, Integer, Date, Time, Boolean, ForeignKey

from app.database.database import Base


class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id")
    )

    slot_date = Column(Date)

    slot_time = Column(Time)

    available = Column(Boolean, default=True)