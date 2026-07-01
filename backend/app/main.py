from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine

# Import models BEFORE create_all
from app.models.user import User
from app.models.doctor import Doctor
from app.models.availability import Availability
from app.models.appointment import Appointment
from app.models.symptom_check import SymptomCheck
from app.models.report import ReportSummary
from app.models.chat import ChatMessage
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite
        "http://localhost:3000",  # CRA
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Healthcare Portal"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.api import auth
from app.api import user
from app.api import doctor
from app.api import appointment
from app.api.symptom import router as symptom_router
from app.api.report import router as report_router
from app.api.chat import router as chat_router 
app.include_router(symptom_router)
app.include_router(report_router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(doctor.router)
app.include_router(appointment.router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {
        "message": "AI Healthcare Portal API Running 🚀"
    }