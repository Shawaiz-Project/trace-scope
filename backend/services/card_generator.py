import io
import base64
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple


def create_share_card(
    download_mbps: float,
    upload_mbps: float,
    ping: float,
    jitter: float,
    quality_score: int,
    grade: str,
    isp: str,
    location: str,
    server_region: str,
    timestamp: str,
    theme: str = "dark"
) -> Tuple[str, str]:
    """
    Generate a shareable speed test result card as a PNG image.
    
    Returns:
        Tuple of (base64_encoded_image, filename)
    """
    
    # Card dimensions (social media optimized)
    width, height = 1200, 630
    
    # Theme colors
    if theme == "dark":
        bg_color = (17, 24, 39)  # Dark blue-gray
        card_bg = (31, 41, 55)  # Slightly lighter
        text_primary = (255, 255, 255)
        text_secondary = (156, 163, 175)
        accent_color = (59, 130, 246)  # Blue
        download_color = (34, 197, 94)  # Green
        upload_color = (168, 85, 247)  # Purple
    else:
        bg_color = (249, 250, 251)
        card_bg = (255, 255, 255)
        text_primary = (17, 24, 39)
        text_secondary = (107, 114, 128)
        accent_color = (59, 130, 246)
        download_color = (34, 197, 94)
        upload_color = (168, 85, 247)
    
    # Create image
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a nice font, fallback to default
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        font_tiny = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_tiny = ImageFont.load_default()
    
    # Draw main card background with rounded corners effect
    padding = 40
    draw.rectangle(
        [padding, padding, width - padding, height - padding],
        fill=card_bg,
        outline=accent_color,
        width=2
    )
    
    # Header - Title
    title = "Speed Test Results"
    draw.text((80, 70), title, fill=accent_color, font=font_medium)
    
    # Grade badge
    grade_colors = {
        "A+": (34, 197, 94),
        "A": (34, 197, 94),
        "B": (234, 179, 8),
        "C": (249, 115, 22),
        "D": (239, 68, 68),
        "F": (239, 68, 68)
    }
    grade_color = grade_colors.get(grade, accent_color)
    
    # Draw grade circle
    grade_x, grade_y = 1050, 100
    draw.ellipse([grade_x - 50, grade_y - 50, grade_x + 50, grade_y + 50], fill=grade_color)
    draw.text((grade_x - 25, grade_y - 30), grade, fill=(255, 255, 255), font=font_medium)
    
    # Score text
    draw.text((grade_x - 35, grade_y + 60), f"Score: {quality_score}", fill=text_secondary, font=font_tiny)
    
    # Main metrics section
    metrics_y = 180
    
    # Download speed
    draw.text((80, metrics_y), "↓ DOWNLOAD", fill=download_color, font=font_small)
    draw.text((80, metrics_y + 40), f"{download_mbps:.1f}", fill=text_primary, font=font_large)
    draw.text((280, metrics_y + 80), "Mbps", fill=text_secondary, font=font_small)
    
    # Upload speed
    draw.text((450, metrics_y), "↑ UPLOAD", fill=upload_color, font=font_small)
    draw.text((450, metrics_y + 40), f"{upload_mbps:.1f}", fill=text_primary, font=font_large)
    draw.text((630, metrics_y + 80), "Mbps", fill=text_secondary, font=font_small)
    
    # Ping
    draw.text((800, metrics_y), "PING", fill=accent_color, font=font_small)
    draw.text((800, metrics_y + 40), f"{ping:.0f}", fill=text_primary, font=font_large)
    draw.text((920, metrics_y + 80), "ms", fill=text_secondary, font=font_small)
    
    # Jitter
    draw.text((1000, metrics_y), "JITTER", fill=text_secondary, font=font_small)
    draw.text((1000, metrics_y + 40), f"{jitter:.1f}", fill=text_primary, font=font_medium)
    draw.text((1080, metrics_y + 60), "ms", fill=text_secondary, font=font_tiny)
    
    # Divider line
    draw.line([(80, 350), (width - 80, 350)], fill=text_secondary, width=1)
    
    # Info section
    info_y = 380
    
    # ISP
    draw.text((80, info_y), "ISP:", fill=text_secondary, font=font_small)
    draw.text((150, info_y), isp[:40], fill=text_primary, font=font_small)
    
    # Location
    draw.text((80, info_y + 45), "Location:", fill=text_secondary, font=font_small)
    draw.text((200, info_y + 45), location[:35], fill=text_primary, font=font_small)
    
    # Server
    draw.text((650, info_y), "Server:", fill=text_secondary, font=font_small)
    draw.text((750, info_y), server_region[:25], fill=text_primary, font=font_small)
    
    # Timestamp
    draw.text((650, info_y + 45), "Tested:", fill=text_secondary, font=font_small)
    draw.text((750, info_y + 45), timestamp[:25], fill=text_primary, font=font_small)
    
    # Footer branding
    draw.text((80, height - 80), "SpeedTest Dashboard", fill=accent_color, font=font_small)
    draw.text((width - 280, height - 80), "speedtest.app", fill=text_secondary, font=font_small)
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG', quality=95)
    buffer.seek(0)
    
    base64_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    # Generate filename
    dt = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"speedtest_result_{dt}.png"
    
    return base64_image, filename
