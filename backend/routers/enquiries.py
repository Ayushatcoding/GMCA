from datetime import timezone

from fastapi import APIRouter

from lib.db import db
from models.enquiry import Enquiry, EnquiryCreate


router = APIRouter(prefix="/enquiries", tags=["enquiries"])


def enquiry_from_document(document: dict) -> Enquiry:
    created_at = document.get("created_at")
    if created_at is not None and created_at.tzinfo is None:
        document["created_at"] = created_at.replace(tzinfo=timezone.utc)
    return Enquiry(**document)


@router.post("", response_model=Enquiry, status_code=201)
async def create_enquiry(input: EnquiryCreate) -> Enquiry:
    enquiry = Enquiry(**input.model_dump())
    await db.enquiries.insert_one(enquiry.model_dump())
    return enquiry


@router.get("", response_model=list[Enquiry])
async def list_enquiries() -> list[Enquiry]:
    documents = await db.enquiries.find().sort("created_at", -1).to_list(1000)
    return [enquiry_from_document(document) for document in documents]