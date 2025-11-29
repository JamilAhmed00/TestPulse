from PIL import Image
import os
from typing import Tuple


def validate_photo(file_path: str) -> Tuple[bool, str]:
    """
    Validate photo file type
    Returns: (is_valid, error_message)
    """
    try:
        img = Image.open(file_path)
        if img.format not in ['JPEG', 'JPG']:
            return False, "Only JPEG/JPG images are allowed"
        return True, ""
    except Exception as e:
        return False, f"Invalid image file: {str(e)}"


def process_photo(input_path: str, output_path: str) -> Tuple[bool, str]:
    """
    Process photo to meet DU requirements:
    - Width: 460-480 px
    - Height: 600-620 px
    - Size: 30-200 KB
    - Format: JPEG
    
    Returns: (success, message)
    """
    try:
        # Open image
        img = Image.open(input_path)
        
        # Convert to RGB if necessary (for PNG with transparency, etc.)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Target dimensions (middle of the range)
        target_width = 470
        target_height = 610
        
        # Resize image maintaining aspect ratio, then crop to exact size
        img_ratio = img.width / img.height
        target_ratio = target_width / target_height
        
        if img_ratio > target_ratio:
            # Image is wider, fit to height
            new_height = target_height
            new_width = int(target_height * img_ratio)
        else:
            # Image is taller, fit to width
            new_width = target_width
            new_height = int(target_width / img_ratio)
        
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Crop to exact dimensions (center crop)
        left = (new_width - target_width) // 2
        top = (new_height - target_height) // 2
        right = left + target_width
        bottom = top + target_height
        img = img.crop((left, top, right, bottom))
        
        # Save with compression to meet size requirements (30-200 KB)
        quality = 85
        img.save(output_path, 'JPEG', quality=quality, optimize=True)
        
        # Check file size and adjust quality if needed
        file_size_kb = os.path.getsize(output_path) / 1024
        
        # If too large, reduce quality
        while file_size_kb > 200 and quality > 50:
            quality -= 5
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            file_size_kb = os.path.getsize(output_path) / 1024
        
        # If too small, increase quality
        while file_size_kb < 30 and quality < 95:
            quality += 5
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            file_size_kb = os.path.getsize(output_path) / 1024
        
        # Final check
        if file_size_kb < 30 or file_size_kb > 200:
            return False, f"Unable to compress image to required size (current: {file_size_kb:.1f} KB)"
        
        return True, f"Photo processed successfully ({file_size_kb:.1f} KB, {target_width}x{target_height}px)"
        
    except Exception as e:
        return False, f"Error processing photo: {str(e)}"


def get_photo_info(file_path: str) -> dict:
    """Get photo dimensions and file size"""
    try:
        img = Image.open(file_path)
        file_size_kb = os.path.getsize(file_path) / 1024
        return {
            "width": img.width,
            "height": img.height,
            "size_kb": round(file_size_kb, 2),
            "format": img.format
        }
    except Exception as e:
        return {"error": str(e)}
