from datetime import datetime, timedelta
from pathlib import Path


def create_calendar_invite(
    appointment_id,
    patient_name,
    doctor_name,
    appointment_date,
    appointment_time
):
    """
    Creates a simple .ics calendar invite.
    """

    start = datetime.fromisoformat(
        f"{appointment_date} {appointment_time}"
    )

    end = start + timedelta(minutes=30)

    content = f"""BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:{appointment_id}
SUMMARY:Appointment with {doctor_name}
DESCRIPTION:Medical Appointment
DTSTART:{start.strftime("%Y%m%dT%H%M%S")}
DTEND:{end.strftime("%Y%m%dT%H%M%S")}
LOCATION:AI Healthcare Portal
END:VEVENT
END:VCALENDAR
"""

    Path("calendar_invites").mkdir(exist_ok=True)

    filename = f"calendar_invites/appointment_{appointment_id}.ics"

    with open(filename, "w") as file:
        file.write(content)

    return filename