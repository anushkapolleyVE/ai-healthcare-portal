from io import BytesIO
from pypdf import PdfReader
from groq import Groq

from app.core.config import settings
from app.models.report import ReportSummary
from app.repository.report_repository import (
    create_report_summary,
    get_user_report_summaries,
)

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are a medical report summarizer inside a healthcare app.
You will be given raw text extracted from a patient's medical report (lab results,
scan reports, prescriptions, etc.). Summarize it in plain, easy-to-understand language:

1. Key findings (what the report shows)
2. Any values outside normal range, clearly flagged
3. A plain-language explanation of what this means
4. Suggested next steps (e.g., "discuss with your doctor")

Always end with this exact disclaimer on its own line:
"This is not a medical diagnosis. Please consult a licensed doctor for accurate advice."

Keep it concise and well-structured."""


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    if not text.strip():
        raise Exception("Could not extract any text from this PDF")

    return text


def summarize_report(db, current_user, filename: str, file_bytes: bytes):
    extracted_text = extract_text_from_pdf(file_bytes)

    # Trim extremely long reports to stay within model context limits
    extracted_text = extracted_text[:12000]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": extracted_text},
        ],
        temperature=0.3,
        max_tokens=700,
    )

    summary_text = response.choices[0].message.content

    record = ReportSummary(
        user_id=current_user.id,
        filename=filename,
        summary_text=summary_text,
    )

    return create_report_summary(db, record)


def report_history(db, current_user):
    return get_user_report_summaries(db, current_user.id)