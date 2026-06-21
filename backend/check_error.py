from app.db.session import SessionLocal
from app.models.document import Document

db = SessionLocal()
docs = db.query(Document).filter(Document.title.ilike('%1957%')).all()
for doc in docs:
    print(f"ID: {doc.id}")
    print(f"Title: {doc.title}")
    print(f"Status: {doc.status}")
    print(f"Error: {doc.processing_error}")
db.close()
