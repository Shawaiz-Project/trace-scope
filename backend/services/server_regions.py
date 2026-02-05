from typing import List, Dict
from models import ServerInfo, ServerRegion


# Server region definitions
# Note: All endpoints point to the same backend for now
# In production, you would deploy to multiple regions
SERVER_REGIONS: List[Dict] = [
    {
        "id": "auto",
        "name": "Auto (Best)",
        "servers": [
            {
                "id": "auto-best",
                "name": "Automatic Selection",
                "region": "auto",
                "flag": "🌐",
                "endpoint": ""  # Will be set dynamically
            }
        ]
    },
    {
        "id": "asia",
        "name": "Asia Pacific",
        "servers": [
            {
                "id": "asia-singapore",
                "name": "Singapore",
                "region": "asia",
                "flag": "🇸🇬",
                "endpoint": ""
            },
            {
                "id": "asia-tokyo",
                "name": "Tokyo, Japan",
                "region": "asia",
                "flag": "🇯🇵",
                "endpoint": ""
            },
            {
                "id": "asia-mumbai",
                "name": "Mumbai, India",
                "region": "asia",
                "flag": "🇮🇳",
                "endpoint": ""
            },
            {
                "id": "asia-sydney",
                "name": "Sydney, Australia",
                "region": "asia",
                "flag": "🇦🇺",
                "endpoint": ""
            }
        ]
    },
    {
        "id": "europe",
        "name": "Europe",
        "servers": [
            {
                "id": "eu-london",
                "name": "London, UK",
                "region": "europe",
                "flag": "🇬🇧",
                "endpoint": ""
            },
            {
                "id": "eu-frankfurt",
                "name": "Frankfurt, Germany",
                "region": "europe",
                "flag": "🇩🇪",
                "endpoint": ""
            },
            {
                "id": "eu-amsterdam",
                "name": "Amsterdam, Netherlands",
                "region": "europe",
                "flag": "🇳🇱",
                "endpoint": ""
            },
            {
                "id": "eu-paris",
                "name": "Paris, France",
                "region": "europe",
                "flag": "🇫🇷",
                "endpoint": ""
            }
        ]
    },
    {
        "id": "north-america",
        "name": "North America",
        "servers": [
            {
                "id": "us-east",
                "name": "New York, USA",
                "region": "north-america",
                "flag": "🇺🇸",
                "endpoint": ""
            },
            {
                "id": "us-west",
                "name": "Los Angeles, USA",
                "region": "north-america",
                "flag": "🇺🇸",
                "endpoint": ""
            },
            {
                "id": "us-central",
                "name": "Dallas, USA",
                "region": "north-america",
                "flag": "🇺🇸",
                "endpoint": ""
            },
            {
                "id": "ca-toronto",
                "name": "Toronto, Canada",
                "region": "north-america",
                "flag": "🇨🇦",
                "endpoint": ""
            }
        ]
    },
    {
        "id": "south-america",
        "name": "South America",
        "servers": [
            {
                "id": "br-saopaulo",
                "name": "São Paulo, Brazil",
                "region": "south-america",
                "flag": "🇧🇷",
                "endpoint": ""
            }
        ]
    },
    {
        "id": "middle-east",
        "name": "Middle East",
        "servers": [
            {
                "id": "me-dubai",
                "name": "Dubai, UAE",
                "region": "middle-east",
                "flag": "🇦🇪",
                "endpoint": ""
            }
        ]
    }
]


def get_all_regions(base_url: str) -> List[ServerRegion]:
    """Get all server regions with endpoints set"""
    regions = []
    
    for region_data in SERVER_REGIONS:
        servers = []
        for server_data in region_data["servers"]:
            server = ServerInfo(
                id=server_data["id"],
                name=server_data["name"],
                region=server_data["region"],
                flag=server_data["flag"],
                endpoint=base_url  # All use same endpoint for now
            )
            servers.append(server)
        
        region = ServerRegion(
            id=region_data["id"],
            name=region_data["name"],
            servers=servers
        )
        regions.append(region)
    
    return regions


def get_server_by_id(server_id: str, base_url: str) -> ServerInfo:
    """Get a specific server by ID"""
    for region_data in SERVER_REGIONS:
        for server_data in region_data["servers"]:
            if server_data["id"] == server_id:
                return ServerInfo(
                    id=server_data["id"],
                    name=server_data["name"],
                    region=server_data["region"],
                    flag=server_data["flag"],
                    endpoint=base_url
                )
    
    # Return default if not found
    return ServerInfo(
        id="auto-best",
        name="Automatic Selection",
        region="auto",
        flag="🌐",
        endpoint=base_url
    )
