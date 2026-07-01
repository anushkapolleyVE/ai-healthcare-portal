"""
One-time / periodic script to build the RAG knowledge base.
Fetches open-access StatPearls articles (NIH/NCBI Bookshelf),
chunks them, embeds them, and upserts into Pinecone.

Run manually: python -m app.scripts.ingest_knowledge_base
"""

import time
import requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec

from app.core.config import settings

# --- Config ---
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"   # 384-dim, free, local
CHUNK_SIZE = 800        # characters per chunk
CHUNK_OVERLAP = 150

# A starter list of StatPearls NCBI Bookshelf article IDs.
# Add more topics here as needed — find IDs by searching
# https://www.ncbi.nlm.nih.gov/books/NBK430685/ (StatPearls) and
# browsing to any article; the ID is in the URL, e.g. NBK430685.
ARTICLE_IDS = [
    "NBK430685",  # Example: Anatomy overview article - replace/expand with real relevant IDs
    "NBK441870",  # Example: Fever
    "NBK513298",  # Example: Headache
    "NBK534819",  # Example: Hypertension
    "NBK470410",  # Example: Diabetes Mellitus overview
    # Add more IDs relevant to conditions you want covered
]

BASE_URL = "https://www.ncbi.nlm.nih.gov/books/{}/"


def fetch_article_text(article_id: str) -> str:
    url = BASE_URL.format(article_id)
    headers = {"User-Agent": "Mozilla/5.0 (Educational RAG ingestion)"}

    response = requests.get(url, headers=headers, timeout=20)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # StatPearls articles are inside the main article body
    content_div = soup.find("div", {"class": "article"}) or soup.find("body")

    if not content_div:
        return ""

    # Strip nav/script/style elements
    for tag in content_div(["script", "style", "nav", "header", "footer"]):
        tag.decompose()

    text = content_div.get_text(separator=" ", strip=True)
    return text


def chunk_text(text: str, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    return [c for c in chunks if len(c.strip()) > 50]


def main():
    print("Loading embedding model...")
    embedder = SentenceTransformer(EMBED_MODEL_NAME)

    print("Connecting to Pinecone...")
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)

    index_name = settings.PINECONE_INDEX_NAME

    if index_name not in [i.name for i in pc.list_indexes()]:
        print(f"Creating index '{index_name}'...")
        pc.create_index(
            name=index_name,
            dimension=384,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        time.sleep(5)

    index = pc.Index(index_name)

    for article_id in ARTICLE_IDS:
        print(f"Fetching {article_id}...")
        try:
            text = fetch_article_text(article_id)
        except Exception as e:
            print(f"  Failed to fetch {article_id}: {e}")
            continue

        if not text:
            print(f"  No content extracted for {article_id}, skipping.")
            continue

        chunks = chunk_text(text)
        print(f"  {len(chunks)} chunks")

        vectors = []
        for i, chunk in enumerate(chunks):
            embedding = embedder.encode(chunk).tolist()
            vectors.append({
                "id": f"{article_id}-{i}",
                "values": embedding,
                "metadata": {
                    "text": chunk,
                    "source": f"StatPearls {article_id}",
                },
            })

        index.upsert(vectors=vectors)
        time.sleep(1)  # be polite to NCBI's servers

    print("Done.")


if __name__ == "__main__":
    main()