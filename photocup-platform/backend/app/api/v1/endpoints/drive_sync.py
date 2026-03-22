"""
Drive Sync endpoint — downloads updated assets from Google Drive
and places them in the Next.js /public folder.
Only accessible by admin role.
"""
import os
import io
import json
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from app.api.deps import get_current_user
from app.models.user import User, UserRole

router = APIRouter()
logger = logging.getLogger(__name__)

# Paths — resolve relative to this file; work both in Docker (/app) and dev layout
_THIS_FILE = Path(__file__).resolve()
# In Docker: /app/app/api/v1/endpoints/drive_sync.py  -> parents[4] = /app (backend root)
# In dev:    .../photocup-platform/backend/app/api/v1/endpoints/drive_sync.py -> parents[4] = backend
BACKEND_DIR = _THIS_FILE.parents[4]
# Public dir: use env var if set, otherwise look one level above backend for Next.js public/
_public_env = os.environ.get("PUBLIC_DIR", "")
PUBLIC_DIR = Path(_public_env) if _public_env else (BACKEND_DIR.parent / "public")
# SA file
SA_FILE = BACKEND_DIR / "photocupapp-service-account.json"

# Files to keep in sync: (drive_file_id, public_filename)
SYNC_ASSETS = [
    ("1C_aOTSPhSpUKIPRGuw937MKBQpi9HI-x", "poster2026.jpg"),
    ("1nd1T5rC44AcoEfRVBYwsR8B6-bOLGU51", "spark-image.jpg"),
    ("1fl45bHwTO8wLV6yl9ceGf5lASZcI_Ok9", "photocup26-logo-W.png"),
    ("1Hi6kgRKUJtki1RvUQFikbhngNAS-8HM2", "photocup26-logo-G.png"),
    ("1QQddVuciy-9zC4IakiiawprXay8LGrd8", "photocup26-v2-W.png"),
    ("1q0Otb0ySuYVlbof5zVw9HJuu6ol0SXD5", "spark-W.png"),
    ("1Cxh5zYwavtUDHjiXV0b8y8FZ2JcPxQlY", "spark.png"),
    ("1mnDC780Xg9pGd8BVUte2PZ817EBAJT4L", "mi-logo-D.png"),
    ("10jpyqE0Z4-w957E8w8vd8dKQrd3K_r_D", "mi-logo-L.png"),
    ("1tcoXjfRM6ktocReMdJe_PJjvL0AHtIoX", "photolympics26-W.png"),
    ("1e6xbhC1dWkNMWpIwkUzXBQTBgXp_azXX", "photolympics26-G.png"),
]


def _get_drive_service():
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        creds = service_account.Credentials.from_service_account_file(
            str(SA_FILE),
            scopes=["https://www.googleapis.com/auth/drive.readonly"],
        )
        return build("drive", "v3", credentials=creds)
    except Exception as e:
        raise RuntimeError(f"Could not initialise Drive client: {e}")


def _download_file(service, file_id: str) -> bytes:
    from googleapiclient.http import MediaIoBaseDownload
    request = service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    dl = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        _, done = dl.next_chunk()
    return fh.getvalue()


def _get_modified_time(service, file_id: str) -> str:
    meta = service.files().get(fileId=file_id, fields="modifiedTime").execute()
    return meta.get("modifiedTime", "")


def _sync_all() -> dict:
    service = _get_drive_service()
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    results = {}
    for file_id, filename in SYNC_ASSETS:
        dest = PUBLIC_DIR / filename
        try:
            remote_mtime = _get_modified_time(service, file_id)
            # Check cached mtime
            cache_file = PUBLIC_DIR / f".mtime_{filename}"
            if dest.exists() and cache_file.exists():
                cached = cache_file.read_text().strip()
                if cached == remote_mtime:
                    results[filename] = "up-to-date"
                    continue
            data = _download_file(service, file_id)
            dest.write_bytes(data)
            cache_file.write_text(remote_mtime)
            results[filename] = f"updated ({len(data)//1024} KB)"
            logger.info("Synced %s from Drive", filename)
        except Exception as e:
            results[filename] = f"error: {e}"
            logger.error("Error syncing %s: %s", filename, e)
    return results


@router.post("/sync")
async def trigger_sync(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    """Trigger a background sync of Drive assets. Admin only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    background_tasks.add_task(_sync_all)
    return {"status": "sync started", "message": "Assets are being updated in the background."}


@router.get("/status")
async def sync_status(current_user: User = Depends(get_current_user)):
    """Return last-sync mtime cache for each tracked asset. Admin only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    status = {}
    for _, filename in SYNC_ASSETS:
        cache_file = PUBLIC_DIR / f".mtime_{filename}"
        dest = PUBLIC_DIR / filename
        status[filename] = {
            "exists": dest.exists(),
            "last_synced": cache_file.read_text().strip() if cache_file.exists() else None,
            "size_kb": dest.stat().st_size // 1024 if dest.exists() else 0,
        }
    return status
