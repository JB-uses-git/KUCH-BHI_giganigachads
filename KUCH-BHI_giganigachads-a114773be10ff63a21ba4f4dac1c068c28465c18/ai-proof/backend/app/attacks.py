"""
Image attack functions for watermark robustness testing.
Each function applies a specific transformation and returns the modified image.
"""

import cv2
import numpy as np
from PIL import Image
import io


class ImageAttacks:
    """Collection of attack transformations for watermark robustness testing."""
    
    @staticmethod
    def jpeg_compression(image_array, quality):
        """
        Apply JPEG compression to the image.
        
        Args:
            image_array: numpy array (0-255, uint8)
            quality: JPEG quality (1-100, lower = more compression)
        
        Returns:
            Compressed image as numpy array
        """
        # Convert BGR to RGB for PIL
        pil_img = Image.fromarray(cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB))
        
        # Save and reload as JPEG with specified quality
        buffer = io.BytesIO()
        pil_img.save(buffer, format='JPEG', quality=quality)
        buffer.seek(0)
        
        result = Image.open(buffer).convert('RGB')
        result_array = cv2.cvtColor(np.array(result), cv2.COLOR_RGB2BGR)
        
        return result_array
    
    @staticmethod
    def resize(image_array, scale):
        """
        Resize image by a scale factor.
        
        Args:
            image_array: numpy array
            scale: scale factor (0.0-1.0, 0.5 = 50% size)
        
        Returns:
            Resized image as numpy array
        """
        h, w = image_array.shape[:2]
        new_h, new_w = int(h * scale), int(w * scale)
        
        # Downscale
        resized = cv2.resize(image_array, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        
        # Upscale back to original size
        upscaled = cv2.resize(resized, (w, h), interpolation=cv2.INTER_LANCZOS4)
        
        return upscaled
    
    @staticmethod
    def center_crop(image_array, crop_ratio):
        """
        Center crop the image.
        
        Args:
            image_array: numpy array
            crop_ratio: how much to keep (0.0-1.0, 0.9 = keep 90%)
        
        Returns:
            Cropped and upscaled back to original size
        """
        h, w = image_array.shape[:2]
        new_h, new_w = int(h * crop_ratio), int(w * crop_ratio)
        
        # Center crop
        y_start = (h - new_h) // 2
        x_start = (w - new_w) // 2
        cropped = image_array[y_start:y_start+new_h, x_start:x_start+new_w]
        
        # Upscale back to original
        upscaled = cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LANCZOS4)
        
        return upscaled
    
    @staticmethod
    def gaussian_blur(image_array, sigma):
        """
        Apply Gaussian blur.
        
        Args:
            image_array: numpy array
            sigma: blur strength (0-5, typically 1-3)
        
        Returns:
            Blurred image
        """
        kernel_size = int(sigma * 4) * 2 + 1  # Odd kernel size
        kernel_size = max(3, min(kernel_size, 31))  # Clamp to valid range
        
        return cv2.GaussianBlur(image_array, (kernel_size, kernel_size), sigma)
    
    @staticmethod
    def gaussian_noise(image_array, std_dev):
        """
        Add Gaussian noise.
        
        Args:
            image_array: numpy array (0-255, uint8)
            std_dev: noise standard deviation (0-50, typically 5-20)
        
        Returns:
            Noisy image
        """
        noise = np.random.normal(0, std_dev, image_array.shape)
        noisy = np.clip(image_array.astype(np.float32) + noise, 0, 255).astype(np.uint8)
        
        return noisy
    
    @staticmethod
    def rotate(image_array, angle):
        """
        Rotate image by angle in degrees.
        
        Args:
            image_array: numpy array
            angle: rotation angle in degrees (-45 to 45)
        
        Returns:
            Rotated image (padded to maintain size)
        """
        h, w = image_array.shape[:2]
        center = (w // 2, h // 2)
        
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image_array, M, (w, h), borderMode=cv2.BORDER_REFLECT)
        
        return rotated
    
    @staticmethod
    def brightness_contrast(image_array, brightness_delta, contrast_factor):
        """
        Adjust brightness and contrast.
        
        Args:
            image_array: numpy array (0-255)
            brightness_delta: brightness shift (-50 to 50)
            contrast_factor: contrast multiplier (0.5 to 1.5)
        
        Returns:
            Adjusted image
        """
        adjusted = cv2.convertScaleAbs(image_array.astype(np.float32), 
                                       alpha=contrast_factor, 
                                       beta=brightness_delta)
        
        return np.clip(adjusted, 0, 255).astype(np.uint8)
    
    @staticmethod
    def png_to_jpeg_to_png(image_array, quality=90):
        """
        Simulate PNG → JPEG → PNG conversion (lossy format change).
        
        Args:
            image_array: numpy array
            quality: JPEG quality
        
        Returns:
            Result after format conversion roundtrip
        """
        # Convert to JPEG and back (simulates what would happen if saved as JPEG)
        pil_img = Image.fromarray(cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB))
        
        buffer = io.BytesIO()
        pil_img.save(buffer, format='JPEG', quality=quality)
        buffer.seek(0)
        
        result = Image.open(buffer).convert('RGB')
        result_array = cv2.cvtColor(np.array(result), cv2.COLOR_RGB2BGR)
        
        return result_array
    
    @staticmethod
    def apply_attack(image_array, attack_type, severity):
        """
        Apply a specific attack based on type and severity.
        
        Args:
            image_array: numpy array (0-255, uint8)
            attack_type: str - one of: 'jpeg', 'resize', 'crop', 'blur', 'noise', 'rotate', 'brightness', 'format'
            severity: float - 0.0 to 1.0, where 0.0 is minimal and 1.0 is maximum
        
        Returns:
            Attacked image as numpy array
        """
        if attack_type == 'jpeg':
            # severity 0.0 = quality 100, severity 1.0 = quality 10
            quality = int(100 - (severity * 90))
            quality = max(10, min(100, quality))
            return ImageAttacks.jpeg_compression(image_array, quality)
        
        elif attack_type == 'resize':
            # severity 0.0 = 100%, severity 1.0 = 25%
            scale = 1.0 - (severity * 0.75)
            scale = max(0.25, min(1.0, scale))
            return ImageAttacks.resize(image_array, scale)
        
        elif attack_type == 'crop':
            # severity 0.0 = 100%, severity 1.0 = 50%
            crop_ratio = 1.0 - (severity * 0.5)
            crop_ratio = max(0.5, min(1.0, crop_ratio))
            return ImageAttacks.center_crop(image_array, crop_ratio)
        
        elif attack_type == 'blur':
            # severity 0.0 = sigma 0, severity 1.0 = sigma 3
            sigma = severity * 3.0
            sigma = max(0.0, min(5.0, sigma))
            return ImageAttacks.gaussian_blur(image_array, sigma)
        
        elif attack_type == 'noise':
            # severity 0.0 = std 0, severity 1.0 = std 30
            std_dev = severity * 30.0
            std_dev = max(0.0, min(50.0, std_dev))
            return ImageAttacks.gaussian_noise(image_array, std_dev)
        
        elif attack_type == 'rotate':
            # severity 0.0 = 0°, severity 1.0 = ±15°
            angle = (severity * 30.0) - 15.0  # Range: -15 to +15
            return ImageAttacks.rotate(image_array, angle)
        
        elif attack_type == 'brightness':
            # severity 0.0 = no change, severity 1.0 = bright +30, contrast 1.3
            brightness_delta = severity * 30.0
            contrast_factor = 1.0 + (severity * 0.3)
            return ImageAttacks.brightness_contrast(image_array, brightness_delta, contrast_factor)
        
        elif attack_type == 'format':
            # severity 0.0 = quality 100, severity 1.0 = quality 50
            quality = int(100 - (severity * 50))
            quality = max(50, min(100, quality))
            return ImageAttacks.png_to_jpeg_to_png(image_array, quality)
        
        else:
            raise ValueError(f"Unknown attack type: {attack_type}")


def get_predefined_attacks():
    """
    Return a list of predefined attack configurations for the pipeline.
    
    Returns:
        List of dicts with 'name', 'type', 'severity' keys
    """
    return [
        # JPEG Compression
        {'name': 'JPEG 90', 'type': 'jpeg', 'severity': 0.1},
        {'name': 'JPEG 70', 'type': 'jpeg', 'severity': 0.3},
        {'name': 'JPEG 50', 'type': 'jpeg', 'severity': 0.5},
        {'name': 'JPEG 25', 'type': 'jpeg', 'severity': 0.8},
        
        # Resize/Downscale
        {'name': 'Resize 90%', 'type': 'resize', 'severity': 0.1},
        {'name': 'Resize 75%', 'type': 'resize', 'severity': 0.25},
        {'name': 'Resize 50%', 'type': 'resize', 'severity': 0.5},
        
        # Cropping
        {'name': 'Crop 95%', 'type': 'crop', 'severity': 0.1},
        {'name': 'Crop 85%', 'type': 'crop', 'severity': 0.3},
        {'name': 'Crop 75%', 'type': 'crop', 'severity': 0.5},
        
        # Blur
        {'name': 'Blur (σ=0.5)', 'type': 'blur', 'severity': 0.17},
        {'name': 'Blur (σ=1.0)', 'type': 'blur', 'severity': 0.33},
        {'name': 'Blur (σ=2.0)', 'type': 'blur', 'severity': 0.67},
        
        # Noise
        {'name': 'Noise (σ=5)', 'type': 'noise', 'severity': 0.17},
        {'name': 'Noise (σ=15)', 'type': 'noise', 'severity': 0.5},
        {'name': 'Noise (σ=30)', 'type': 'noise', 'severity': 1.0},
        
        # Rotation
        {'name': 'Rotate ±5°', 'type': 'rotate', 'severity': 0.33},
        {'name': 'Rotate ±10°', 'type': 'rotate', 'severity': 0.67},
        
        # Brightness/Contrast
        {'name': 'Brightness +15', 'type': 'brightness', 'severity': 0.5},
        
        # Format Conversion
        {'name': 'JPEG Roundtrip', 'type': 'format', 'severity': 0.5},
    ]
