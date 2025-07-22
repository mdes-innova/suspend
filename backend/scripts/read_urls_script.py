import fitz  # PyMuPDF
import os
import xml.etree.ElementTree as ET

def extract_attachments(pdf_path, output_dir):
    doc = fitz.open(pdf_path)
    file_info = doc.embfile_info(0)
    filename = file_info["filename"]

    file_data = doc.embfile_get(0)
    xml_string = file_data.decode("utf-8")  # assuming UTF-8
    ns = {'ns': 'https://www.w3schools.com'}
    root = ET.fromstring(xml_string)
    order_data = root.find('ns:OrderData', ns)

    # Extract domain list
    domain_list = order_data.find('ns:DomainList', ns)
    domains = [d.text for d in domain_list.findall('ns:Domain', ns)]
    print(domains)

    # output_path = os.path.join(output_dir, filename)
    # with open(output_path, "wb") as f:
    #     f.write(file_data)
    # print(f"Saved to: {output_path}")

# Example usage
extract_attachments("/app/uploads/document/0bf849cb-e548-4a8c-a828-fc457a0984c7.pdf", "/app/scripts/output")