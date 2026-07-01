from sqlalchemy import Column, Integer, String

from app.database.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True)

    speciality = Column(String(100), nullable=False)

    qualification = Column(String(150))

    experience = Column(Integer)

    hospital = Column(String(150))