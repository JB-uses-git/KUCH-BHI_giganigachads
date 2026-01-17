#!/usr/bin/env python3
"""Test a specific image for watermark detection.

Usage examples:
  python test_my_image.py --image "C:\\path\\to\\image.png"
  python test_my_image.py --image my.jpg --url http://localhost:8000
"""
import argparse
import os
import sys
import requests


def guess_mime(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext in {'.jpg', '.jpeg'}:
        return 'image/jpeg'
    if ext == '.png':
        return 'image/png'
    if ext == '.bmp':
        return 'image/bmp'
    if ext == '.webp':
        return 'image/webp'
    return 'application/octet-stream'


def main():
    parser = argparse.ArgumentParser(description='Test a specific image for watermark detection')
    parser.add_argument('--image', required=True, help='Path to the image to test')
    parser.add_argument('--url', default='http://localhost:8000', help='Backend base URL')
    args = parser.parse_args()

    image_path = args.image
    if not os.path.exists(image_path):
        print(f"✗ Image not found: {image_path}")
        return 1

    print(f"Testing image: {image_path}")
    print("=" * 60)

    with open(image_path, 'rb') as f:
        response = requests.post(
            f"{args.url.rstrip('/')}/api/detect",
            files={'file': (os.path.basename(image_path), f, guess_mime(image_path))}
        )

    if response.status_code == 200:
        result = response.json()
        print(f"✓ Watermark Detected: {result['detected']}")
        print(f"✓ Confidence: {result['confidence']:.4f}")
        print(f"✓ Status: {'🤖 AI-Generated' if result['detected'] else '👤 Human-Created'}")
        if result.get('payload') is not None and result['detected']:
            print(f"✓ Payload: {result['payload']}")
    else:
        print(f"✗ Error: {response.status_code}")
        print(f"  {response.text}")
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())

