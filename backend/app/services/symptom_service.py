from groq import Groq

from app.core.config import settings
from app.models.symptom_check import SymptomCheck
from app.repository.symptom_repository import (
    create_symptom_check,
    get_user_symptom_checks,
)

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are a medical symptom-checking assistant inside a healthcare app.
A user will describe their symptoms. Based on what they describe:

1. List 2-4 possible (non-diagnostic) explanations, from most to least likely.
2. Note any symptoms mentioned that could indicate an urgent/emergency situation.
3. Recommend whether they should see a doctor, and how soon.

Always end with this exact disclaimer on its own line:
"This is not a medical diagnosis. Please consult a licensed doctor for accurate advice."

Keep the response concise and easy to read, using short sections."""


def check_symptoms(db, current_user, symptoms_text: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": symptoms_text},
        ],
        temperature=0.3,
        max_tokens=600,
    )

    ai_response = response.choices[0].message.content

    record = SymptomCheck(
        user_id=current_user.id,
        symptoms_text=symptoms_text,
        ai_response=ai_response,
    )

    return create_symptom_check(db, record)


def symptom_history(db, current_user):
    return get_user_symptom_checks(db, current_user.id)