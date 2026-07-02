from groq import Groq
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone

from app.core.config import settings
from app.repository.chat_repository import (
    save_message,
    get_recent_messages,
    get_all_messages,
)
if not settings.GROQ_API_KEY:
    raise Exception("GROQ_API_KEY missing")
client = Groq(api_key=settings.GROQ_API_KEY)
if not settings.PINECONE_API_KEY:
    raise Exception("PINECONE_API_KEY missing")
# --- RAG setup ---
embedder = SentenceTransformer("all-MiniLM-L6-v2")
pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index(settings.PINECONE_INDEX_NAME)

SYSTEM_PROMPT = """You are a helpful medical assistant chatbot inside a healthcare app.
You will be given CONTEXT retrieved from a medical knowledge base, followed by the
conversation. Use the CONTEXT to ground your answer whenever it's relevant. If the
CONTEXT doesn't cover the question, answer using your general knowledge but make
clear you're doing so.

You are not a doctor and must not provide a diagnosis or prescribe medication.

If the user describes symptoms, gently suggest they use the app's dedicated
Symptom Checker feature, and/or book an appointment with a doctor for anything serious.

If the user describes anything that sounds like a medical emergency
(chest pain, difficulty breathing, severe bleeding, loss of consciousness, etc.),
tell them clearly to seek emergency care immediately.

Keep responses conversational, concise, and friendly. Do not quote the context
verbatim at length — explain things in your own words."""


def retrieve_context(query: str, top_k: int = 3) -> str:
    query_embedding = embedder.encode(query).tolist()

    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
    )

    if not results.matches:
        return ""

    chunks = []
    for match in results.matches:
        if match.score < 0.3:  # skip weak/irrelevant matches
            continue
        text = match.metadata.get("text", "")
        source = match.metadata.get("source", "unknown")
        chunks.append(f"[Source: {source}]\n{text}")

    return "\n\n---\n\n".join(chunks)


def send_message(db, current_user, message: str):
    # Save the user's message first
    save_message(db, current_user.id, "user", message)

    # Retrieve relevant context from the knowledge base
    context = retrieve_context(message)

    # Pull recent conversation history
    history = get_recent_messages(db, current_user.id, limit=10)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if context:
        messages.append({
            "role": "system",
            "content": f"CONTEXT from medical knowledge base:\n\n{context}"
        })

    for msg in history:
        role = "assistant" if msg.role == "assistant" else "user"
        messages.append({"role": role, "content": msg.message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.4,
        max_tokens=500,
    )

    ai_reply = response.choices[0].message.content

    saved_reply = save_message(db, current_user.id, "assistant", ai_reply)

    return saved_reply


def chat_history(db, current_user):
    return get_all_messages(db, current_user.id)