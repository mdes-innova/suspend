from django.core.files import File
import os
from reportlab.platypus import SimpleDocTemplate, Paragraph, Flowable
from reportlab.lib.styles import getSampleStyleSheet


def generate_file(subject, date, user, group, documents):
    pdf_path =\
        f'/tmp/mail/{subject}-{date if date else ""}-{user.id}-{group.id}.pdf'
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    doc = SimpleDocTemplate(pdf_path)
    styles = getSampleStyleSheet()

    content: list[Flowable] = [
        Paragraph("This is a paragraph that will wrap" + " " +
                  "automatically and follow document flow.", styles["Normal"])]

    doc.build(content)

    return pdf_path
