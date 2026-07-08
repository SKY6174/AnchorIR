import os
import glob
from pypdf import PdfReader

def extract_pdf_texts():
    pdf_dir = "/Users/thomas/Documents/AnchorIR/data/documents/2026사업AP"
    pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    
    output_filepath = "/Users/thomas/Documents/AnchorIR/scripts/parse_pdf_output.txt"
    
    with open(output_filepath, "w", encoding="utf-8") as out_f:
        for pdf_path in sorted(pdf_files):
            filename = os.path.basename(pdf_path)
            out_f.write(f"=== FILE: {filename} ===\n")
            print(f"Reading {filename}...")
            try:
                reader = PdfReader(pdf_path)
                for idx, page in enumerate(reader.pages):
                    text = page.extract_text()
                    out_f.write(f"--- PAGE {idx+1} ---\n")
                    out_f.write(text + "\n")
            except Exception as e:
                out_f.write(f"ERROR reading pdf: {str(e)}\n")
            out_f.write("\n\n")
            
    print(f"Extraction completed. Saved to {output_filepath}")

if __name__ == "__main__":
    extract_pdf_texts()
