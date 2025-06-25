import os
import uuid


def document_file_path(instance, filename):
    """Generate file path for new recipe file."""
    ext = os.path.splitext(filename)[1]
    filename = '{}{}'.format(uuid.uuid4(), ext)
    return os.path.join('uploads', 'document', filename)


def mail_file_path(instance, filename):
    """Generate file path for new recipe file."""
    ext = os.path.splitext(filename)[1]
    filename = '{}{}'.format(uuid.uuid4(), ext)
    return os.path.join('uploads', 'mail', filename)
