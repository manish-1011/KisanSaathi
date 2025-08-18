# app.py  — simple: load all JSON files, embed, insert
import os, glob, json
from typing import List, Dict, Any, Iterable

from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values, Json
from pgvector.psycopg2 import register_vector
from openai import OpenAI

DIM = 1536  # text-embedding-3-small

def batched(items: List[Any], size: int) -> Iterable[List[Any]]:
    for i in range(0, len(items), size):
        yield items[i:i+size]

def load_rows_from_folder(folder: str) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    # read *.json in folder (and subfolders)
    for path in glob.glob(os.path.join(folder, "**", "*.json"), recursive=True):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            data = [data]
        for r in data:
            content = (r.get("content") or "").strip()
            if not content:
                continue
            rows.append({"content": content, "metadata": r.get("metadata", {})})
    return rows

def ensure_schema(conn):
    # safe to run; keeps things simple if you skipped the SQL step
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS documents (
              id         bigserial PRIMARY KEY,
              content    text  NOT NULL,
              metadata   jsonb NOT NULL DEFAULT '{{}}'::jsonb,
              embedding  vector({DIM}) NOT NULL,
              created_at timestamptz NOT NULL DEFAULT now()
            );
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS documents_metadata_gin ON documents USING gin (metadata);")
        cur.execute(f"""
            CREATE INDEX IF NOT EXISTS documents_embedding_ivfflat
              ON documents USING ivfflat (embedding vector_cosine_ops)
              WITH (lists = 100);
        """)
        conn.commit()

def embed_batch(client: OpenAI, texts: List[str]) -> List[List[float]]:
    res = client.embeddings.create(model="text-embedding-3-small", input=texts)
    return [d.embedding for d in res.data]

def main():
    load_dotenv()
    DB_URL   = os.environ["DATABASE_URL"]
    DATA_DIR = os.environ["DATA_DIR"]
    BATCH    = int(os.getenv("BATCH_SIZE", "32"))

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    rows = load_rows_from_folder(DATA_DIR)
    print(f"Loaded {len(rows)} rows from JSON files.")
    if not rows:
        return

    with psycopg2.connect(DB_URL) as conn:
        register_vector(conn)   # <-- lets us pass Python lists into vector column
        ensure_schema(conn)

        total = 0
        for chunk in batched(rows, BATCH):
            texts = [r["content"] for r in chunk]
            embs  = embed_batch(client, texts)
            payload = [(r["content"], Json(r["metadata"]), e) for r, e in zip(chunk, embs)]
            with conn.cursor() as cur:
                execute_values(
                    cur,
                    "INSERT INTO documents (content, metadata, embedding) VALUES %s",
                    payload,
                    template="(%s, %s, %s)",
                    page_size=1000,
                )
            conn.commit()
            total += len(payload)
            print(f"Inserted {total}/{len(rows)}")

        # optional: refresh stats
        with conn.cursor() as cur:
            cur.execute("ANALYZE documents;")
            conn.commit()

    print("Done.")

if __name__ == "__main__":
    main()
