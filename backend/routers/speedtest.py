import os
import time
import secrets
from fastapi import APIRouter, Request, Response
from fastapi.responses import StreamingResponse
from models import PingRequest, PingResponse, UploadResponse

router = APIRouter(prefix="/speedtest", tags=["speedtest"])


@router.post("/ping", response_model=PingResponse)
async def ping(request: PingRequest):
    """
    Measure ping latency.
    Client sends timestamp, server responds with its timestamp.
    """
    start_time = int(time.time() * 1000)
    server_time = int(time.time() * 1000)
    
    return PingResponse(
        seq=request.seq,
        client_time=request.client_time,
        server_time=server_time,
        server_process_time=server_time - start_time
    )


@router.get("/download")
async def download(size: int = 1048576):
    """
    Download test endpoint.
    Generates random bytes for download speed measurement.
    
    Args:
        size: Number of bytes to generate (default 1MB, max 10MB)
    """
    # Clamp size between 1KB and 10MB
    size = max(1024, min(size, 10 * 1024 * 1024))
    
    def generate_chunks():
        """Generate random data in chunks"""
        chunk_size = 65536  # 64KB chunks
        remaining = size
        
        while remaining > 0:
            current_chunk = min(chunk_size, remaining)
            yield secrets.token_bytes(current_chunk)
            remaining -= current_chunk
    
    headers = {
        "Content-Type": "application/octet-stream",
        "Content-Length": str(size),
        "X-Bytes-Total": str(size),
        "X-Server-Time": str(int(time.time() * 1000)),
        "Cache-Control": "no-store, no-cache, must-revalidate",
    }
    
    return StreamingResponse(
        generate_chunks(),
        media_type="application/octet-stream",
        headers=headers
    )


@router.post("/upload", response_model=UploadResponse)
async def upload(request: Request):
    """
    Upload test endpoint.
    Receives data and measures upload speed.
    """
    start_time = time.time()
    
    # Read the entire body
    body = await request.body()
    total_bytes = len(body)
    
    elapsed = time.time() - start_time
    
    # Check max size (50MB)
    max_size = 50 * 1024 * 1024
    if total_bytes > max_size:
        return Response(
            content='{"error": "Upload too large"}',
            status_code=413,
            media_type="application/json"
        )
    
    bps = int((total_bytes * 8) / elapsed) if elapsed > 0 else 0
    
    return UploadResponse(
        received_bytes=total_bytes,
        elapsed_seconds=elapsed,
        upload_bps=bps,
        server_time=int(time.time() * 1000)
    )
