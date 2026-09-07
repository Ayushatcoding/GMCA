from datetime import datetime, timezone
from typing import Annotated
import uuid

from pydantic import BaseModel, Field


NonEmptyText = Annotated[str, Field(min_length=1, max_length=500)]


class EnquiryCreate(BaseModel):
    name: NonEmptyText
    phone: NonEmptyText
    program: NonEmptyText
    message: Annotated[str, Field(min_length=1, max_length=2000)]


class Enquiry(EnquiryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))