"""Pydantic schemas for the Zaninettis API."""

from __future__ import annotations

import re

from pydantic import BaseModel, EmailStr, Field, field_validator

_SERVICE_TITLE_INDEX = re.compile(r"^\s*\d+\s*[.)—-]\s*")


class NewsArticle(BaseModel):
    id: str
    title: str
    summary: str
    content: str = ""
    source_name: str = ""
    source_url: str = ""
    region: str = "BR"
    status: str = "approved"
    published_at: str = ""
    tags: list[str] = Field(default_factory=list)


class NewsArticleCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=240)
    summary: str = Field(..., min_length=10, max_length=600)
    content: str = ""
    source_name: str = ""
    source_url: str = ""
    region: str = "BR"
    tags: list[str] = Field(default_factory=list)


class BlogPost(BaseModel):
    id: str
    slug: str
    title: str
    excerpt: str
    content_markdown: str = ""
    tags: list[str] = Field(default_factory=list)
    published_at: str = ""
    author_name: str = "Zaninettis"
    source_url: str = ""


class BlogPostCreate(BaseModel):
    slug: str = Field(..., min_length=2, max_length=160)
    title: str = Field(..., min_length=3, max_length=240)
    excerpt: str = Field(..., min_length=10, max_length=600)
    content_markdown: str = ""
    tags: list[str] = Field(default_factory=list)
    source_url: str = ""


class ServiceOffering(BaseModel):
    id: str
    title: str
    description: str
    icon: str = "mark"
    highlights: list[str] = Field(default_factory=list)

    @field_validator("title")
    @classmethod
    def strip_list_index(cls, value: str) -> str:
        return _SERVICE_TITLE_INDEX.sub("", value).strip()


class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)


class ContactMessageResponse(BaseModel):
    success: bool
    message: str


class ConsultingRequestCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    company: str = Field("", max_length=160)
    phone: str = Field("", max_length=40)
    service_ids: list[str] = Field(default_factory=list, max_length=20)
    message: str = Field(..., min_length=10, max_length=5000)

    @field_validator("name", "company", "phone", "message")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("service_ids")
    @classmethod
    def unique_service_ids(cls, value: list[str]) -> list[str]:
        seen: list[str] = []
        for item in value:
            cleaned = item.strip()
            if cleaned and cleaned not in seen:
                seen.append(cleaned)
        return seen


class ConsultingRequestResponse(BaseModel):
    success: bool
    message: str
    email_sent: bool = False
    email_error: str | None = None


class StudioBlock(BaseModel):
    """One slice of a studio issue, in display order (text or image)."""

    type: str = Field(..., pattern="^(text|image)$")
    text: str = ""
    name: str = ""
    mime: str = "image/png"
    data_base64: str = ""

    @field_validator("text", "name", "mime", "data_base64")
    @classmethod
    def strip_optional(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value


class StudioIssueCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=256)
    blocks: list[StudioBlock] = Field(..., min_length=1, max_length=40)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        return value.strip()


class StudioIssueResponse(BaseModel):
    success: bool
    issue_url: str = ""
    issue_number: int = 0
    message: str = ""


class StudioStatusResponse(BaseModel):
    configured: bool
    missing: list[str] = Field(default_factory=list)


class StudioUnlockResponse(BaseModel):
    success: bool
    message: str = ""


class ReviewItem(BaseModel):
    id: str
    kind: str = "news"
    title: str
    summary: str = ""
    source_url: str = ""
    status: str = "pending"


class ReviewDecision(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")


class HealthResponse(BaseModel):
    status: str
    version: str = "0.1.0"
    environment: str
    smtp_configured: bool = False
    studio_configured: bool = False
