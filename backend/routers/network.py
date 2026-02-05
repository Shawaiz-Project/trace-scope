from fastapi import APIRouter, Request
from datetime import datetime
from models import (
    IPInfoResponse, 
    NetworkQualityRequest, 
    NetworkQualityResponse,
    ServerRegionsResponse,
    ShareCardRequest,
    ShareCardResponse
)
from services.ip_service import get_ip_info, extract_asn
from services.scoring_service import calculate_network_quality
from services.server_regions import get_all_regions
from services.card_generator import create_share_card

router = APIRouter(tags=["network"])


def get_client_ip(request: Request) -> str:
    """Extract client IP from request headers"""
    # Check various headers for the real IP
    xff = request.headers.get("x-forwarded-for")
    real_ip = request.headers.get("x-real-ip")
    cf_connecting_ip = request.headers.get("cf-connecting-ip")
    
    if cf_connecting_ip:
        return cf_connecting_ip
    elif xff:
        return xff.split(",")[0].strip()
    elif real_ip:
        return real_ip
    else:
        return request.client.host if request.client else "Unknown"


@router.get("/ip-info", response_model=IPInfoResponse)
async def get_ip_information(request: Request):
    """
    Get detailed IP information including geolocation, ISP, and VPN detection.
    """
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "Unknown")
    accept_language = request.headers.get("accept-language", "Unknown")
    
    # Fetch geo data from ip-api.com
    geo_data = await get_ip_info(client_ip)
    
    # Extract ASN
    asn = extract_asn(geo_data.get("as", "Unknown"))
    
    # Determine IP type
    ip_type = "IPv6" if ":" in client_ip else "IPv4"
    
    # VPN detection
    vpn_detected = geo_data.get("proxy", False) or geo_data.get("hosting", False)
    
    return IPInfoResponse(
        ip=client_ip,
        user_agent=user_agent,
        accept_language=accept_language,
        server_time=datetime.utcnow().isoformat(),
        isp=geo_data.get("isp", "Unknown ISP"),
        org=geo_data.get("org", ""),
        asn=asn,
        city=geo_data.get("city", "Unknown"),
        region=geo_data.get("regionName", "Unknown"),
        country=geo_data.get("country", "Unknown"),
        country_code=geo_data.get("countryCode", "XX"),
        timezone=geo_data.get("timezone", "Unknown"),
        ip_type=ip_type,
        vpn_detected=vpn_detected,
        reverse_dns="",
        latitude=geo_data.get("lat"),
        longitude=geo_data.get("lon")
    )


@router.post("/network-quality", response_model=NetworkQualityResponse)
async def calculate_quality(request: NetworkQualityRequest):
    """
    Calculate network quality score based on speed test results.
    
    Returns quality grade, score, and activity-specific recommendations.
    """
    result = calculate_network_quality(
        ping=request.ping,
        jitter=request.jitter,
        download_mbps=request.download_mbps,
        upload_mbps=request.upload_mbps,
        packet_loss=request.packet_loss
    )
    
    return NetworkQualityResponse(**result)


@router.get("/server-regions", response_model=ServerRegionsResponse)
async def get_server_regions(request: Request):
    """
    Get available speed test server regions.
    """
    # Build base URL from request
    base_url = str(request.base_url).rstrip("/")
    
    regions = get_all_regions(base_url)
    
    return ServerRegionsResponse(regions=regions)


@router.post("/generate-share-card", response_model=ShareCardResponse)
async def generate_share_card(request: ShareCardRequest):
    """
    Generate a shareable image card with speed test results.
    
    Returns base64 encoded PNG image.
    """
    image_base64, filename = create_share_card(
        download_mbps=request.download_mbps,
        upload_mbps=request.upload_mbps,
        ping=request.ping,
        jitter=request.jitter,
        quality_score=request.quality_score,
        grade=request.grade,
        isp=request.isp,
        location=request.location,
        server_region=request.server_region,
        timestamp=request.timestamp,
        theme=request.theme
    )
    
    return ShareCardResponse(
        image_base64=image_base64,
        filename=filename
    )
