from datetime import date,time

from pydantic import BaseModel


class AppointmentCreate(BaseModel):

    doctor_id:int

    appointment_date:date

    appointment_time:time


class AppointmentResponse(BaseModel):

    id:int

    doctor_id:int

    appointment_date:date

    appointment_time:time

    status:str

    class Config:

        from_attributes=True