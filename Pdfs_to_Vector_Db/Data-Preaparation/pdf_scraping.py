import os
import json
import pathlib
from typing import List, Tuple, Dict, Any
import pdfplumber
import pandas as pd
import re
from langchain.text_splitter import RecursiveCharacterTextSplitter

# These functions are unchanged from your original code.
def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def bbox_intersects(b1: Tuple[float, float, float, float], b2: Tuple[float, float, float, float]) -> bool:
    (x0, y0, x1, y1) = b1
    (a0, b0, a1, b1_) = b2
    if x1 <= a0 or a1 <= x0:
        return False
    if y1 <= b0 or b1_ <= y0:
        return False
    return True

def words_in_band(words: List[Dict[str, Any]], y0: float, y1: float) -> List[Dict[str, Any]]:
    kept = []
    for w in words:
        top = float(w["top"]); bottom = float(w["bottom"])
        y_center = 0.5 * (top + bottom)
        if y0 <= y_center < y1:
            kept.append(w)
    return kept

def remove_words_overlapping_tables(words: List[Dict[str, Any]], table_bboxes: List[Tuple[float, float, float, float]]) -> List[Dict[str, Any]]:
    filtered = []
    for w in words:
        wb = (float(w["x0"]), float(w["top"]), float(w["x1"]), float(w["bottom"]))
        if any(bbox_intersects(wb, tb) for tb in table_bboxes):
            continue
        filtered.append(w)
    return filtered

def words_to_text(words: List[Dict[str, Any]], line_y_tol: float = 2.0) -> str:
    if not words:
        return ""
    from collections import defaultdict
    lines = defaultdict(list)
    for w in words:
        ykey = round(float(w["top"]) / line_y_tol)
        lines[ykey].append(w)
    ordered_lines = []
    for ykey in sorted(lines.keys()):
        row = sorted(lines[ykey], key=lambda ww: float(ww["x0"]))
        ordered_lines.append(" ".join(r["text"] for r in row))
    return "\n".join(ordered_lines)

def extract_tables_to_json(pdf_path: str, out_dir: str) -> Dict[int, List[Dict[str, Any]]]:
    ensure_dir(out_dir)
    tables_dir = os.path.join(out_dir, "tables")
    ensure_dir(tables_dir)

    pdf_stem = pathlib.Path(pdf_path).stem
    page_to_tables: Dict[int, List[Dict[str, Any]]] = {}

    with pdfplumber.open(pdf_path) as pdf:
        for pageno, page in enumerate(pdf.pages, start=1):
            detected = page.find_tables()
            page_tables = []
            for idx, tbl in enumerate(detected, start=1):
                table_id = f"{pdf_stem}_p{pageno}_t{idx}"
                rows = tbl.extract()
                norm = [[str(cell) if cell is not None else "" for cell in row] for row in rows]
                out_path = os.path.join(tables_dir, f"{table_id}.json")
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(norm, f, ensure_ascii=False, indent=2)
                page_tables.append({
                    "id": table_id,
                    "bbox": tuple(map(float, tbl.bbox)),
                    "path": out_path,
                })
            page_to_tables[pageno] = page_tables
    return page_to_tables

def build_text_with_placeholders(pdf_path: str, out_dir: str, page_to_tables: Dict[int, List[Dict[str, Any]]]) -> str:
    pdf_stem = pathlib.Path(pdf_path).stem
    parts: List[str] = []
    PAGE_DELIM = "-------------------- [PAGE BREAK] --------------------"

    with pdfplumber.open(pdf_path) as pdf:
        for pageno, page in enumerate(pdf.pages, start=1):
            page_height = float(page.height)
            words = page.extract_words(use_text_flow=True, keep_blank_chars=False)

            tinfo = sorted(page_to_tables.get(pageno, []), key=lambda t: float(t["bbox"][1]))
            table_bboxes = [tuple(t["bbox"]) for t in tinfo]

            bands = []
            cursor_top = 0.0
            for t in tinfo:
                (x0, t_top, x1, t_bot) = t["bbox"]
                bands.append(("text", (cursor_top, float(t_top))))
                bands.append(("placeholder", t["id"]))
                cursor_top = float(t_bot)
            bands.append(("text", (cursor_top, page_height)))

            page_segments: List[str] = []
            for kind, payload in bands:
                if kind == "placeholder":
                    page_segments.append(f"[{payload}]")
                else:
                    y0, y1 = payload
                    wband = words_in_band(words, y0, y1)
                    wclean = remove_words_overlapping_tables(wband, table_bboxes)
                    seg_text = words_to_text(wclean)
                    if seg_text.strip():
                        page_segments.append(seg_text.strip())

            page_text = "\n\n".join(page_segments).strip()
            parts.append(page_text)

    full_text = ("\n\n" + PAGE_DELIM + "\n\n").join(parts)

    ensure_dir(out_dir)
    out_text_path = os.path.join(out_dir, f"{pdf_stem}_with_placeholders.txt")
    with open(out_text_path, "w", encoding="utf-8") as f:
        f.write(full_text)

    return full_text, out_text_path

def process_pdf(pdf_path: str, out_dir: str) -> Tuple[str, str, Dict[int, List[Dict[str, Any]]]]:
    ensure_dir(out_dir)
    table_index = extract_tables_to_json(pdf_path, out_dir)
    full_text, text_path = build_text_with_placeholders(pdf_path, out_dir, table_index)
    return full_text, text_path, table_index

# --- Chunking and Enrichment functions ---

PAGE_DELIM = "-------------------- [PAGE BREAK] --------------------"
_placeholder_pat = re.compile(r"\[([^\]]+?)\]")

def load_pages(with_placeholders_txt: str) -> List[Dict[str, Any]]:
    text = pathlib.Path(with_placeholders_txt).read_text(encoding="utf-8")
    pages = [p.strip() for p in text.split(PAGE_DELIM)]
    return [{"page_number": i+1, "text": p} for i, p in enumerate(pages) if p]

def split_into_paragraphs(page_text: str) -> List[str]:
    paras, current = [], []
    for line in page_text.splitlines():
        s = line.strip()
        if not s:
            if current:
                paras.append(" ".join(current).strip())
                current = []
        else:
            current.append(s)
    if current:
        paras.append(" ".join(current).strip())
    return paras

def extract_placeholders(s: str) -> List[str]:
    return _placeholder_pat.findall(s or "")

def remove_placeholders(s: str) -> str:
    return _placeholder_pat.sub("", s or "").strip()

def create_chunks_attach_to_previous(
    with_placeholders_txt: str,
    out_json_path: str,
    chunk_size: int = 500,
    chunk_overlap: int = 20
):
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    pages = load_pages(with_placeholders_txt)
    chunks: List[Dict[str, Any]] = []
    last_text_chunk_idx: int | None = None

    for page in pages:
        page_num = page["page_number"]
        paras = split_into_paragraphs(page["text"])

        for para in paras:
            here_tables = extract_placeholders(para)
            if here_tables:
                if last_text_chunk_idx is not None:
                    prev_tables = chunks[last_text_chunk_idx]["metadata"].get("tables", [])
                    new_tables = list(dict.fromkeys(prev_tables + here_tables))
                    chunks[last_text_chunk_idx]["metadata"]["tables"] = new_tables
                else:
                    chunks.append({
                        "content": "(preamble: tables before any text)",
                        "metadata": {
                            "page_number": page_num,
                            "tables": list(dict.fromkeys(here_tables))
                        }
                    })
                    last_text_chunk_idx = len(chunks) - 1

            cleaned = remove_placeholders(para)
            if not cleaned:
                continue

            subtexts = splitter.split_text(cleaned)
            for sub in subtexts:
                chunks.append({
                    "content": sub.strip(),
                    "metadata": {
                        "page_number": page_num,
                        "tables": []
                    }
                })
                last_text_chunk_idx = len(chunks) - 1

    pathlib.Path(out_json_path).write_text(json.dumps(chunks, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ Created {len(chunks)} chunks and saved to {out_json_path}")

def load_chunks(json_path: str) -> List[Dict[str, Any]]:
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_table_data(table_id: str, tables_root_folder: str) -> Any:
    table_file_path = os.path.join(tables_root_folder, f"{table_id}.json")
    if not os.path.exists(table_file_path):
        print(f"Warning: Table file not found for ID: {table_id} at {table_file_path}")
        return None
    with open(table_file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def enrich_chunks_with_table_data(chunks: List[Dict[str, Any]], tables_root_folder: str) -> List[Dict[str, Any]]:
    enriched_chunks = []
    for chunk in chunks:
        metadata = chunk.get("metadata", {})
        if "tables" in metadata and metadata["tables"]:
            table_data_dict = {}
            for table_id in metadata["tables"]:
                data = load_table_data(table_id, tables_root_folder)
                if data is not None:
                    table_data_dict[table_id] = data
            metadata["tables"] = table_data_dict
        enriched_chunks.append(chunk)
    return enriched_chunks

# ----------------- The New Main Logic -----------------
def process_pdf_folder(input_folder: str, output_directory: str):
    """
    Processes all PDF files in the input_folder and saves the final JSON
    outputs for each PDF in the output_directory.
    """
    # Ensure the output directory exists
    ensure_dir(output_directory)

    # Iterate through all files in the input folder
    for filename in os.listdir(input_folder):
        if filename.endswith(".pdf"):
            pdf_path = os.path.join(input_folder, filename)
            pdf_stem = pathlib.Path(pdf_path).stem
            
            # Create a specific output folder for each PDF
            pdf_output_dir = os.path.join(output_directory, pdf_stem)
            ensure_dir(pdf_output_dir)

            print(f"Processing PDF: {filename}...")
            
            # Step 1: Extract tables and create a text file with placeholders
            _ = process_pdf(pdf_path, pdf_output_dir)

            # Define paths for the intermediate files
            with_placeholders_txt_path = os.path.join(pdf_output_dir, f"{pdf_stem}_with_placeholders.txt")
            chunks_json_path = os.path.join(pdf_output_dir, f"{pdf_stem}_chunks.json")
            final_json_path = os.path.join(pdf_output_dir, f"{pdf_stem}_final.json")
            tables_root_folder = os.path.join(pdf_output_dir, "tables")
            
            # Step 2: Create chunks from the text with placeholders
            create_chunks_attach_to_previous(with_placeholders_txt_path, chunks_json_path)

            # Step 3: Load the chunks and enrich them with the actual table data
            chunks_data = load_chunks(chunks_json_path)
            enriched_chunks_data = enrich_chunks_with_table_data(chunks_data, tables_root_folder)

            # Step 4: Save the final enriched JSON
            with open(final_json_path, "w", encoding="utf-8") as f:
                json.dump(enriched_chunks_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Final JSON saved for {filename} to {final_json_path}\n")


if __name__ == "__main__":
    
    INPUT_FOLDER = "D:\chatbot-adk\Data"  # <-- Set your input folder path
    OUTPUT_DIRECTORY = "D:\chatbot-adk\Structured-Data" # <-- Set your output directory path

    
    if not os.path.isdir(INPUT_FOLDER):
        raise FileNotFoundError(f"Input folder not found at: {INPUT_FOLDER}")

    process_pdf_folder(INPUT_FOLDER, OUTPUT_DIRECTORY)