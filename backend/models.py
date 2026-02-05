from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# Ping models
class PingRequest(BaseModel):
    client_time: int
    seq: int


class PingResponse(BaseModel):
    seq: int
    client_time: int
    server_time: int
    server_process_time: int


# Upload models
class UploadResponse(BaseModel):
    received_bytes: int
    elapsed_seconds: float
    upload_bps: int
    server_time: int


# IP Info models
class IPInfoResponse(BaseModel):
    ip: str
    user_agent: str
    accept_language: str
    server_time: str
    isp: str
    org: str
    asn: str
    city: str
    region: str
    country: str
    country_code: str
    timezone: str
    ip_type: str
    vpn_detected: bool
    reverse_dns: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


# Network Quality models
class NetworkQualityRequest(BaseModel):
    ping: float
    jitter: float
    download_mbps: float
    upload_mbps: float
    packet_loss: float = 0


class Recommendation(BaseModel):
    category: str
    label: str
    icon: str
    suitable: bool
    description: str


class NetworkQualityResponse(BaseModel):
    overall_score: int
    grade: str
    grade_label: str
    ping_score: int
    jitter_score: int
    download_score: int
    upload_score: int
    recommendations: List[Recommendation]
    summary: str


# Server Region models
class ServerInfo(BaseModel):
    id: str
    name: str
    region: str
    flag: str
    endpoint: str
    ping: Optional[float] = None


class ServerRegion(BaseModel):
    id: str
    name: str
    servers: List[ServerInfo]


class ServerRegionsResponse(BaseModel):
    regions: List[ServerRegion]


# Share Card models
class ShareCardRequest(BaseModel):
    download_mbps: float
    upload_mbps: float
    ping: float
    jitter: float
    quality_score: int
    grade: str
    isp: str
    location: str
    server_region: str
    timestamp: str
    theme: str = "dark"


class ShareCardResponse(BaseModel):
    image_base64: str
    filename: str
