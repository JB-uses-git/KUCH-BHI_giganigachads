#!/usr/bin/env python3
"""Test watermark detection with existing files.

Usage examples:
  python test_detection.py --screenshot "C:\\path\\to\\clean.jpg"
  python test_detection.py --clean "C:\\path\\to\\clean_for_stamping.jpg" --output stamped.png
  python test_detection.py --screenshot ... --clean ... --url http://localhost:8000
"""
import argparse
import base64
import os
import sys
import requests


def detect(url: str, path: str, mime: str):
    with open(path, 'rb') as f:
        resp = requests.post(
            f"{url.rstrip('/')}/api/detect",
            files={'file': (os.path.basename(path), f, mime)}
        )
    return resp


def stamp(url: str, path: str, mime: str):
    with open(path, 'rb') as f:
        resp = requests.post(
            f"{url.rstrip('/')}/api/stamp",
            files={'file': (os.path.basename(path), f, mime)}
        )
    return resp


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
    parser = argparse.ArgumentParser(description='Test watermark detection with existing files')
    parser.add_argument('--url', default='http://localhost:8000', help='Backend base URL')
    parser.add_argument('--screenshot', help='Path to a clean image to check (no watermark expected)')
    parser.add_argument('--clean', help='Path to a clean image to stamp (will be watermarked then detected)')
    parser.add_argument('--output', default='test_stamped.png', help='Where to save the stamped image')

    # Backward-compatible defaults (only if args are omitted)
    default_screenshot = r'C:\Users\Shrut\OneDrive\Desktop\400.jpg'
    args = parser.parse_args()

    # 1) Test clean image (if provided or default exists)
    screenshot_path = args.screenshot if args.screenshot else default_screenshot
    if screenshot_path and os.path.exists(screenshot_path):
        print('Testing clean image (screenshot)...')
        resp = detect(args.url, screenshot_path, guess_mime(screenshot_path))
        if resp.status_code == 200:
            result = resp.json()
            print(f"  Detected: {result['detected']}")
            print(f"  Confidence: {result['confidence']:.4f}")
            print(f"  Status: {'🤖 AI-Generated' if result['detected'] else '👤 Human-Created'}")
        else:
            print(f"  Error: {resp.status_code} - {resp.text}")
    else:
        if args.screenshot:
            print(f"Skipping clean test: not found -> {args.screenshot}")
        else:
            print(f"Skipping clean test: default not found -> {default_screenshot}")

    # 2) Create and test a stamped image (only if --clean provided and exists)
    if args.clean:
        if not os.path.exists(args.clean):
            print(f"Skipping stamping: clean image not found -> {args.clean}")
        else:
            print('\nCreating stamped image...')
            resp = stamp(args.url, args.clean, guess_mime(args.clean))
            if resp.status_code == 200:
                result = resp.json()
                stamped_data = base64.b64decode(result['stamped_image'])
                out_path = args.output
                with open(out_path, 'wb') as sf:
                    sf.write(stamped_data)
                print(f"  ✓ Created {out_path}")

                # Test stamped image
                print('\nTesting stamped image...')
                resp2 = detect(args.url, out_path, guess_mime(out_path))
                if resp2.status_code == 200:
                    result2 = resp2.json()
                    print(f"  Detected: {result2['detected']}")
                    print(f"  Confidence: {result2['confidence']:.4f}")
                    print(f"  Status: {'🤖 AI-Generated' if result2['detected'] else '👤 Human-Created'}")
                else:
                    print(f"  Error: {resp2.status_code} - {resp2.text}")
            else:
                print(f"  Error creating stamped image: {resp.status_code} - {resp.text}")
    else:
        print("\nSkipping stamping: pass --clean <path> to create and test a stamped image.")


if __name__ == '__main__':
    sys.exit(main())
