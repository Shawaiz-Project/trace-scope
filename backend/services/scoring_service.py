from typing import List, Dict
from models import Recommendation


def calculate_network_quality(
    ping: float,
    jitter: float,
    download_mbps: float,
    upload_mbps: float,
    packet_loss: float = 0
) -> Dict:
    """
    Calculate network quality score and recommendations.
    
    Scoring weights:
    - Ping: 30%
    - Jitter: 20%
    - Download: 30%
    - Upload: 20%
    """
    
    # Calculate individual scores (0-100)
    ping_score = max(0, min(100, 100 - (ping - 10) * 2))
    jitter_score = max(0, min(100, 100 - jitter * 5))
    download_score = min(100, download_mbps)
    upload_score = min(100, upload_mbps * 2)
    
    # Penalty for packet loss
    loss_penalty = packet_loss * 10
    
    # Calculate overall score
    overall = (
        ping_score * 0.30 +
        jitter_score * 0.20 +
        download_score * 0.30 +
        upload_score * 0.20 -
        loss_penalty
    )
    overall = max(0, min(100, overall))
    
    # Determine grade
    grade, grade_label = get_grade(overall)
    
    # Generate recommendations
    recommendations = generate_recommendations(
        ping, jitter, download_mbps, upload_mbps, packet_loss
    )
    
    # Generate summary
    summary = generate_summary(overall, recommendations)
    
    return {
        "overall_score": int(overall),
        "grade": grade,
        "grade_label": grade_label,
        "ping_score": int(ping_score),
        "jitter_score": int(jitter_score),
        "download_score": int(download_score),
        "upload_score": int(upload_score),
        "recommendations": recommendations,
        "summary": summary
    }


def get_grade(score: float) -> tuple:
    """Convert score to letter grade"""
    if score >= 90:
        return "A+", "Exceptional"
    elif score >= 80:
        return "A", "Excellent"
    elif score >= 70:
        return "B", "Good"
    elif score >= 60:
        return "C", "Fair"
    elif score >= 50:
        return "D", "Poor"
    else:
        return "F", "Very Poor"


def generate_recommendations(
    ping: float,
    jitter: float,
    download_mbps: float,
    upload_mbps: float,
    packet_loss: float
) -> List[Recommendation]:
    """Generate activity-specific recommendations"""
    
    recommendations = []
    
    # Gaming recommendation
    gaming_suitable = ping < 50 and jitter < 15 and packet_loss < 1
    if gaming_suitable:
        if ping < 20 and jitter < 5:
            gaming_desc = "Ideal for competitive gaming with minimal latency"
        else:
            gaming_desc = "Good for online gaming with stable connection"
    else:
        gaming_desc = "May experience lag in fast-paced online games"
    
    recommendations.append(Recommendation(
        category="gaming",
        label="Gaming",
        icon="🎮",
        suitable=gaming_suitable,
        description=gaming_desc
    ))
    
    # 4K Streaming recommendation
    streaming_4k_suitable = download_mbps >= 25 and jitter < 30
    if streaming_4k_suitable:
        if download_mbps >= 50:
            streaming_desc = "Perfect for 4K HDR streaming on multiple devices"
        else:
            streaming_desc = "Suitable for 4K streaming on one device"
    else:
        streaming_desc = "May buffer during 4K playback, HD recommended"
    
    recommendations.append(Recommendation(
        category="streaming_4k",
        label="4K Streaming",
        icon="📺",
        suitable=streaming_4k_suitable,
        description=streaming_desc
    ))
    
    # Video Calls recommendation
    video_suitable = upload_mbps >= 3 and ping < 150 and jitter < 50
    if video_suitable:
        if upload_mbps >= 10 and ping < 50:
            video_desc = "Excellent for HD group video conferencing"
        else:
            video_desc = "Good for standard video calls"
    else:
        video_desc = "May experience quality issues in video calls"
    
    recommendations.append(Recommendation(
        category="video_calls",
        label="Video Calls",
        icon="📹",
        suitable=video_suitable,
        description=video_desc
    ))
    
    # Work from Home recommendation
    wfh_suitable = download_mbps >= 10 and upload_mbps >= 5 and ping < 100
    if wfh_suitable:
        if download_mbps >= 50 and upload_mbps >= 20:
            wfh_desc = "Perfect for remote work with large file transfers"
        else:
            wfh_desc = "Suitable for standard remote work tasks"
    else:
        wfh_desc = "Consider upgrading for better remote work experience"
    
    recommendations.append(Recommendation(
        category="work_from_home",
        label="Remote Work",
        icon="💼",
        suitable=wfh_suitable,
        description=wfh_desc
    ))
    
    # Live Streaming recommendation
    live_suitable = upload_mbps >= 10 and ping < 100 and jitter < 20
    if live_suitable:
        if upload_mbps >= 25:
            live_desc = "Great for 1080p live streaming to platforms"
        else:
            live_desc = "Suitable for 720p live streaming"
    else:
        live_desc = "Upload speed may limit streaming quality"
    
    recommendations.append(Recommendation(
        category="live_streaming",
        label="Live Streaming",
        icon="🎥",
        suitable=live_suitable,
        description=live_desc
    ))
    
    # Cloud Gaming recommendation
    cloud_gaming_suitable = ping < 40 and jitter < 10 and download_mbps >= 35
    if cloud_gaming_suitable:
        cloud_desc = "Ideal for cloud gaming services like GeForce NOW"
    else:
        cloud_desc = "May experience input lag in cloud gaming"
    
    recommendations.append(Recommendation(
        category="cloud_gaming",
        label="Cloud Gaming",
        icon="☁️",
        suitable=cloud_gaming_suitable,
        description=cloud_desc
    ))
    
    return recommendations


def generate_summary(score: float, recommendations: List[Recommendation]) -> str:
    """Generate a human-readable summary"""
    
    suitable_count = sum(1 for r in recommendations if r.suitable)
    total = len(recommendations)
    
    if score >= 90:
        return f"Exceptional connection! Your network excels at all {suitable_count}/{total} tested activities."
    elif score >= 80:
        return f"Excellent connection suitable for {suitable_count}/{total} activities with great performance."
    elif score >= 70:
        return f"Good connection handling {suitable_count}/{total} activities well."
    elif score >= 60:
        return f"Fair connection. Works for {suitable_count}/{total} activities but may have limitations."
    elif score >= 50:
        return f"Below average connection. Only {suitable_count}/{total} activities may work smoothly."
    else:
        return f"Poor connection quality. Consider troubleshooting or upgrading your network."
