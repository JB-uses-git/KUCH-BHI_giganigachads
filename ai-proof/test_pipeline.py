#!/usr/bin/env python3
"""
Test the full attack pipeline end-to-end
"""

import requests
import io
from PIL import Image
import json
import time

# Create a simple test image
def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (256, 256), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

BASE_URL = "http://localhost:8000"

def test_pipeline():
    print("=" * 60)
    print("ATTACK PIPELINE TEST")
    print("=" * 60)
    
    # Step 1: Create test image
    print("\n1. Creating test image...")
    test_image = create_test_image()
    print("   ✓ Test image created (256x256 blue square)")
    
    # Step 2: Get available attacks
    print("\n2. Fetching available attacks...")
    try:
        response = requests.get(f"{BASE_URL}/api/attacks")
        attacks = response.json()['attacks']
        print(f"   ✓ Got {len(attacks)} attack variants")
        for attack in attacks[:3]:
            print(f"     - {attack['name']} ({attack['type']} @ {attack['severity']})")
        if len(attacks) > 3:
            print(f"     ... and {len(attacks) - 3} more")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return
    
    # Step 3: Stamp the image
    print("\n3. Stamping image with watermark...")
    test_image.seek(0)
    files = {'file': ('test.png', test_image, 'image/png')}
    try:
        response = requests.post(f"{BASE_URL}/api/stamp", files=files)
        stamp_data = response.json()
        print(f"   ✓ Image stamped successfully")
        print(f"     - Stamped image received ({len(stamp_data['stamped_image'])} bytes base64)")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return
    
    # Step 4: Convert stamped image back to file
    print("\n4. Running attacks on stamped image...")
    stamped_b64 = stamp_data['stamped_image']
    
    # Convert base64 to image
    import base64
    stamped_bytes = base64.b64decode(stamped_b64)
    stamped_image = io.BytesIO(stamped_bytes)
    
    # Test a few attacks
    test_attacks = attacks[:5]  # Test first 5 attacks
    results = []
    
    for i, attack in enumerate(test_attacks, 1):
        try:
            stamped_image.seek(0)
            files = {'file': ('stamped.png', stamped_image, 'image/png')}
            params = {
                'attack_type': attack['type'],
                'severity': attack['severity']
            }
            
            response = requests.post(
                f"{BASE_URL}/api/attack",
                files=files,
                params=params
            )
            
            data = response.json()
            detected = data.get('detected', False)
            confidence = data.get('confidence', 0)
            
            status = "✓ SURVIVED" if detected else "✗ BROKEN"
            results.append({
                'name': attack['name'],
                'detected': detected,
                'confidence': confidence
            })
            
            print(f"   {i}. {attack['name']}: {status} (confidence: {confidence:.2f})")
            time.sleep(0.5)  # Small delay between requests
            
        except Exception as e:
            print(f"   {i}. {attack['name']}: ✗ Error - {e}")
    
    # Step 5: Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    survived = sum(1 for r in results if r['detected'])
    total = len(results)
    robustness = (survived / total * 100) if total > 0 else 0
    avg_confidence = (sum(r['confidence'] for r in results) / total) if total > 0 else 0
    
    print(f"Attacks tested: {total}")
    print(f"Survived: {survived}/{total} ({robustness:.1f}%)")
    print(f"Avg confidence: {avg_confidence:.2f}")
    print("\nDetailed results:")
    for r in results:
        status = "SURVIVED ✓" if r['detected'] else "BROKEN ✗"
        print(f"  {r['name']:20} {status:15} confidence: {r['confidence']:.2f}")
    
    print("\n✓ Pipeline test completed successfully!")

if __name__ == "__main__":
    test_pipeline()
