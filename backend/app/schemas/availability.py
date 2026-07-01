from datetime import date
from datetime import time

from pydantic import BaseModel


class AvailabilityCreate(BaseModel):

    doctor_id: int

    slot_date: date

    slot_time: time