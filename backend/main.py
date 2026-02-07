"""
SpeedTest FastAPI Backend
Complete backend for speed test application with network quality scoring,
IP geolocation, shareable result cards, and multi-region server support.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from config import get_settings
from routers import speedtest, network, share


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    print("🚀 SpeedTest API starting up...")
    yield
    print("👋 SpeedTest API shutting down...")


# Create FastAPI application
app = FastAPI(
    title="SpeedTest API",
    description="""
    A comprehensive speed test API with:
    - Ping/latency measurement
    - Download speed testing
    - Upload speed testing  
    - IP geolocation
    - Network quality scoring
    - Server region selection
    - Shareable result card generation
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
settings = get_settings()
origins = settings.cors_origins.split(",") if settings.cors_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "X-Bytes-Total", "X-Server-Time"],
)

# Include routers
app.include_router(speedtest.router, prefix="/api/v1")
app.include_router(network.router, prefix="/api/v1")
app.include_router(share.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SpeedTest API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check for load balancers"""
    return {"status": "ok"}


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
