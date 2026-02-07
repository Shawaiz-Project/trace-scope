"""
Share router — stores and retrieves shared reports using SQLite.
Reports expire automatically after 7 days.
"""

import uuid
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
from services.share_db import ShareDB

router = APIRouter(prefix="/share", tags=["share"])
db = ShareDB()


class CreateShareRequest(BaseModel):
    report_data: Any


class CreateShareResponse(BaseModel):
    share_id: str
    expires_at: str
    url_path: str


class SharedReportResponse(BaseModel):
    share_id: str
    report_data: Any
    expires_at: str
    created_at: str


@router.post("/create", response_model=CreateShareResponse)
async def create_share_link(request: CreateShareRequest):
    """Create a new shared report link that expires in 7 days."""
    share_id = uuid.uuid4().hex[:12]
    now = datetime.utcnow()
    expires_at = now + timedelta(days=7)

    db.insert_report(
        share_id=share_id,
        report_data=json.dumps(request.report_data),
        created_at=now.isoformat(),
        expires_at=expires_at.isoformat(),
    )

    return CreateShareResponse(
        share_id=share_id,
        expires_at=expires_at.isoformat(),
        url_path=f"/report/{share_id}",
    )


@router.get("/{share_id}", response_model=SharedReportResponse)
async def get_shared_report(share_id: str):
    """Retrieve a shared report by its share ID. Returns 404 if expired or not found."""
    # Clean up expired reports
    db.cleanup_expired()

    row = db.get_report(share_id)
    if not row:
        raise HTTPException(status_code=404, detail="Report not found or expired")

    # Check expiration
    expires_at = datetime.fromisoformat(row["expires_at"])
    if datetime.utcnow() > expires_at:
        db.delete_report(share_id)
        raise HTTPException(status_code=404, detail="Report has expired")

    return SharedReportResponse(
        share_id=row["share_id"],
        report_data=json.loads(row["report_data"]),
        expires_at=row["expires_at"],
        created_at=row["created_at"],
    )
