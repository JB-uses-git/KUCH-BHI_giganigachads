#!/usr/bin/env python3
"""
Test the full attack pipeline with all 20 attacks
"""

import requests
import io
from PIL import Image
import base64
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

def test_full_pipeline():
    print("=" * 70)
    print("FULL ATTACK PIPELINE TEST - ALL 20 VARIANTS")
    print("=" * 70)
    
    # Step 1: Create test image
    print("\n1. Creating test image...")
    test_image = create_test_image()
    print("   ✓ Test image created (256x256 blue square)")
    
    # Step 2: Get all available attacks
    print("\n2. Fetching all available attacks...")
    try:
        response = requests.get(f"{BASE_URL}/api/attacks")
        attacks = response.json()['attacks']
        print(f"   ✓ Got {len(attacks)} attack variants")
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
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return
    
    # Step 4: Run all attacks
    print("\n4. Running all attacks on stamped image...")
    print("-" * 70)
    
    stamped_b64 = stamp_data['stamped_image']
    stamped_bytes = base64.b64decode(stamped_b64)
    
    results = []
    
    for i, attack in enumerate(attacks, 1):
        try:
            stamped_image = io.BytesIO(stamped_bytes)
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
            
            results.append({
                'name': attack['name'],
                'type': attack['type'],
                'severity': attack['severity'],
                'detected': detected,
                'confidence': confidence
            })
            
            status = "✓" if detected else "✗"
            print(f"  {i:2d}. {attack['name']:20} {status} conf: {confidence:.2f}")
            
        except Exception as e:
            print(f"  {i:2d}. {attack['name']:20} ✗ Error: {str(e)[:40]}")
    
    # Step 5: Summary
    print("-" * 70)
    print("\nSUMMARY")
    print("=" * 70)
    
    survived = sum(1 for r in results if r['detected'])
    total = len(results)
    robustness = (survived / total * 100) if total > 0 else 0
    avg_confidence = (sum(r['confidence'] for r in results) / total) if total > 0 else 0
    
    print(f"Total attacks tested:  {total}")
    print(f"Watermark survived:    {survived}/{total} ({robustness:.1f}%)")
    print(f"Average confidence:    {avg_confidence:.2f}")
    
    # Group by attack type
    print("\nResults by attack type:")
    print("-" * 70)
    attack_types = {}
    for r in results:
        if r['type'] not in attack_types:
            attack_types[r['type']] = []
        attack_types[r['type']].append(r)
    
    for atype in sorted(attack_types.keys()):
        type_results = attack_types[atype]
        type_survived = sum(1 for r in type_results if r['detected'])
        type_total = len(type_results)
        type_robustness = (type_survived / type_total * 100) if type_total > 0 else 0
        
        print(f"  {atype.upper():15} {type_survived:2d}/{type_total:2d} survived ({type_robustness:5.1f}%)")
        for r in type_results:
            status = "✓" if r['detected'] else "✗"
            print(f"    {status} {r['name']:22} confidence: {r['confidence']:.2f}")
    
    print("\n" + "=" * 70)
    if robustness >= 90:
        print("✓ EXCELLENT - Watermark is highly robust!")
    elif robustness >= 75:
        print("✓ GOOD - Watermark shows good resilience")
    elif robustness >= 50:
        print("⚠ FAIR - Watermark could be more robust")
    else:
        print("✗ POOR - Watermark needs improvement")
    print("=" * 70)

if __name__ == "__main__":
    test_full_pipeline()
