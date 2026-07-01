from pydantic import BaseModel, EmailStr


class DoctorCreate(BaseModel):
    name: str
    email: EmailStr
    speciality: str
    qualification: str
    experience: int
    hospital: str


class DoctorResponse(DoctorCreate):
    id: int

    class Config:
        from_attributes = True