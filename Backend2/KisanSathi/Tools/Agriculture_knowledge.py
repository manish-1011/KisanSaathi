# KisanSathi/Tools/Agriculture_knowledge.py

import os
import json
import time
from typing import Any, Dict, List, Tuple

import psycopg2
from psycopg2.extras import RealDictCursor
from pgvector.psycopg2 import register_vector

from openai import OpenAI
from openai import APIError, APIConnectionError, RateLimitError

from dotenv import load_dotenv
load_dotenv()

DB_URL = os.environ.get("DATABASE_URL")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

if not DB_URL:
    raise ValueError("DATABASE_URL environment variable not set.")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set.")

client = OpenAI(api_key=OPENAI_API_KEY)
EMBED_MODEL = "text-embedding-3-small"  # 1536-d

def _embed_query(text: str) -> List[float]:
    """Return embedding vector (list of floats) for `text` with simple retries."""
    retries = 2
    for i in range(retries):
        try:
            return client.embeddings.create(model=EMBED_MODEL, input=text).data[0].embedding
        except (APIError, APIConnectionError, RateLimitError) as e:
            if i < retries - 1:
                time.sleep(0.0001)
            else:
                raise
        except Exception:
            raise

def _search_top_k_db(qvec: List[float], k: int) -> List[Dict[str, Any]]:
    """Query Postgres/pgvector for top-k matches and return Python-JSON friendly dicts."""
    retries = 2
    for i in range(retries):
        try:
            with psycopg2.connect(DB_URL) as conn:
                register_vector(conn)
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    # Optional probe tuning if you use IVFFlat
                    try:
                        cur.execute("SET LOCAL ivfflat.probes = 10;")
                    except Exception:
                        pass  # harmless if index type differs

                    cur.execute(
                        """
                        SELECT id,
                               content,
                               metadata,
                               (1 - (embedding <=> %s::vector)) AS cosine_similarity
                        FROM documents
                        ORDER BY embedding <=> %s::vector
                        LIMIT %s;
                        """,
                        (qvec, qvec, k),
                    )
                    rows = cur.fetchall()

            # Ensure everything is JSON-serializable (float, str, dict)
            results: List[Dict[str, Any]] = []
            for r in rows:
                results.append({
                    "id": str(r["id"]),
                    "content": r.get("content") or "",
                    "metadata": r.get("metadata") or {},
                    "score": float(r["cosine_similarity"]) if r.get("cosine_similarity") is not None else None,
                })
            return results

        except psycopg2.OperationalError as e:
            if i < retries - 1:
                time.sleep(0.0001)
            else:
                raise
        except Exception:
            raise

def search_top_k(query: str, k: int = 5) -> dict:
    """
    Tool: Retrieve **top-k agronomy facts/snippets** from a Supabase Postgres (pgvector) knowledge base.

    When to use:
    - The user asks agronomy/extension questions (crop practices, soil, irrigation, pests, varieties, sowing windows, etc.).
    - You need factual context/snippets before answering.

    Args:
        query: Natural-language query (e.g., "How to prepare land for rice?")
        k: Number of results to fetch (default 5). Keep small (<=10).

    Returns:
        dict with:
          - "results": list of {id, content, metadata, score}
          - "notice": short guidance on how to cite/use results

    Always **read** the results and synthesize a concise answer; cite key lines from "content".
    """
    qvec = _embed_query(query)
    hits = _search_top_k_db(qvec, k)
    
    return {
        "results": hits,
        "notice": "Use the most relevant snippets to answer. If multiple crops are present, pick the crop mentioned in the user query.",
    }

if __name__ == "__main__":
    # Simple manual test
    test_query = "In what periods do i have to irrigate my Rice crop ?"
    try:
        print(f"🔍 Testing search_top_k for query: {test_query!r}\n")
        results = search_top_k(test_query, k=5)

        for idx, r in enumerate(results["results"], start=1):
            print(f"[{idx}] score={r['score']:.4f} id={r['id']}")
            print("Content:", r["content"][:200].replace("\n", " "), "...")
            print("Metadata:", json.dumps(r["metadata"], ensure_ascii=False))
            print("-" * 60)

        print("\nNotice:", results["notice"])

    except Exception as e:
        print(f"❌ Error during search: {e}")

        
 