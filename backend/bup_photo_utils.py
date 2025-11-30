"""
BUP Photo and Signature Processing
Image processing utilities for BUP admission requirements
"""

from PIL import Image
import io
import os


def process_bup_photo(input_path: str, output_path: str):
    """
    Process candidate photo to meet BUP requirements:
    - Dimensions: 300x300 pixels
    - Format: JPEG
    - Max size: 100 KB
    
    Returns: (success: bool, message: str, file_size: int)
    """
    try:
        # Open and validate image
        img = Image.open(input_path)
        
        # Convert to RGB (remove alpha channel if present)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to exact dimensions (300x300)
        img = img.resize((300, 300), Image.Resampling.LANCZOS)
        
        # Compress to meet size requirement (100 KB)
        quality = 95
        while quality >= 50:
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            size = buffer.tell()
            
            if size <= 100 * 1024:  # 100 KB
                # Save final image
                with open(output_path, 'wb') as f:
                    f.write(buffer.getvalue())
                return True, f"Photo processed successfully ({size/1024:.1f} KB, 300x300px)", size
            
            quality -= 5
        
        return False, "Could not compress photo to under 100KB while maintaining quality", 0
        
    except Exception as e:
        return False, f"Photo processing error: {str(e)}", 0


def process_bup_signature(input_path: str, output_path: str):
    """
    Process signature to meet BUP requirements:
    - Dimensions: 300x80 pixels
    - Format: JPEG
    - Max size: 60 KB
    
    Returns: (success: bool, message: str, file_size: int)
    """
    try:
        img = Image.open(input_path)
        
        # Convert to RGB
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to 300x80 (may distort if aspect ratio very different)
        img = img.resize((300, 80), Image.Resampling.LANCZOS)
        
        # Compress to meet size requirement (60 KB)
        quality = 95
        while quality >= 50:
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            size = buffer.tell()
            
            if size <= 60 * 1024:  # 60 KB
                with open(output_path, 'wb') as f:
                    f.write(buffer.getvalue())
                return True, f"Signature processed successfully ({size/1024:.1f} KB, 300x80px)", size
            
            quality -= 5
        
        return False, "Could not compress signature to under 60KB while maintaining quality", 0
        
    except Exception as e:
        return False, f"Signature processing error: {str(e)}", 0


def validate_bup_photo(file_path: str):
    """
    Validate photo meets BUP requirements before upload
    Returns: (is_valid: bool, errors: list)
    """
    try:
        img = Image.open(file_path)
        width, height = img.size
        file_size = os.path.getsize(file_path)
        
        errors = []
        
        if width != 300 or height != 300:
            errors.append(f"Invalid dimensions: {width}x{height}px (required: 300x300px)")
        
        if file_size > 100 * 1024:
            errors.append(f"File too large: {file_size/1024:.1f}KB (max: 100KB)")
        
        if img.format != 'JPEG':
            errors.append(f"Invalid format: {img.format} (required: JPEG)")
        
        return len(errors) == 0, errors
        
    except Exception as e:
        return False, [f"Validation error: {str(e)}"]


def validate_bup_signature(file_path: str):
    """
    Validate signature meets BUP requirements before upload
    Returns: (is_valid: bool, errors: list)
    """
    try:
        img = Image.open(file_path)
        width, height = img.size
        file_size = os.path.getsize(file_path)
        
        errors = []
        
        if width != 300 or height != 80:
            errors.append(f"Invalid dimensions: {width}x{height}px (required: 300x80px)")
        
        if file_size > 60 * 1024:
            errors.append(f"File too large: {file_size/1024:.1f}KB (max: 60KB)")
        
        if img.format != 'JPEG':
            errors.append(f"Invalid format: {img.format} (required: JPEG)")
        
        return len(errors) == 0, errors
        
    except Exception as e:
        return False, [f"Validation error: {str(e)}"]
