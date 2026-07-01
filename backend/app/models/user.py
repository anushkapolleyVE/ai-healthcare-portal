from sqlalchemy import Column, Integer, String, Date

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, nullable=False, index=True)

    password = Column(String(255), nullable=False)

    role = Column(String(20), default="patient")

    phone = Column(String(20), nullable=True)

    date_of_birth = Column(Date, nullable=True)

    gender = Column(String(20), nullable=True)

    address = Column(String(255), nullable=True)