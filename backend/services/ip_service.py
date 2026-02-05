import httpx
from typing import Dict, Any, Optional


async def get_ip_info(client_ip: str) -> Dict[str, Any]:
    """Get detailed IP information from ip-api.com"""
    
    default_data = {
        "ip": client_ip,
        "isp": "Unknown ISP",
        "org": "",
        "as": "Unknown",
        "city": "Unknown",
        "regionName": "Unknown",
        "country": "Unknown",
        "countryCode": "XX",
        "timezone": "Unknown",
        "proxy": False,
        "hosting": False,
        "lat": None,
        "lon": None,
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"http://ip-api.com/json/{client_ip}",
                params={
                    "fields": "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    return data
                    
    except Exception as e:
        print(f"IP lookup error: {e}")
    
    return default_data


def extract_asn(as_string: str) -> str:
    """Extract ASN from the 'as' field (format: 'AS12345 Company Name')"""
    if not as_string:
        return "Unknown"
    
    parts = as_string.split(" ")
    if parts and parts[0].startswith("AS"):
        return parts[0]
    
    return as_string
