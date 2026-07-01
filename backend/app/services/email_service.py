import os
import yagmail
from dotenv import load_dotenv

load_dotenv()


def get_email_client():
    return yagmail.SMTP(
        user=os.getenv("EMAIL_USER"),
        password=os.getenv("EMAIL_PASSWORD")
    )


def send_welcome_email(email: str, name: str):
    """
    Sends a welcome email after successful signup.
    """

    yag = get_email_client()

    subject = "Welcome to AI Healthcare Portal"

    body = f"""
Hello {name},

Welcome to AI Healthcare Portal!

Your account has been created successfully.

You can now:
- Chat with the AI Medical Assistant
- Book appointments
- Upload medical reports
- Use the Symptom Checker

Thank you for joining us.

Regards,
AI Healthcare Portal Team
"""

    yag.send(
        to=email,
        subject=subject,
        contents=body
    )

    return True


def send_booking_email(
    patient_email,
    patient_name,
    doctor_name,
    appointment_date,
    appointment_time,
    attachment_path=None
):
    """
    Sends appointment confirmation email.
    """

    yag = get_email_client()

    subject = "Appointment Confirmation"

    body = f"""
Hello {patient_name},

Your appointment has been confirmed.

Doctor: {doctor_name}

Date: {appointment_date}

Time: {appointment_time}

Thank you for choosing AI Healthcare Portal.
"""

    if attachment_path:
        yag.send(
            to=patient_email,
            subject=subject,
            contents=body,
            attachments=attachment_path
        )
    else:
        yag.send(
            to=patient_email,
            subject=subject,
            contents=body
        )

    return True