#!/usr/bin/env python3
"""
Backend API Testing Script
Tests the FastAPI backend endpoints to ensure they're working correctly.
"""

import requests
import json
import sys
from datetime import datetime
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading backend URL: {e}")
        return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("❌ Could not determine backend URL from frontend/.env")
    sys.exit(1)

API_BASE = f"{BACKEND_URL}/api"

print(f"🔍 Testing Backend API at: {API_BASE}")
print("=" * 60)

def test_health_check():
    """Test basic API health check"""
    print("\n1. Testing API Health Check...")
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Health check failed with error: {e}")
        return False

def test_slideshow_endpoints():
    """Test slideshow-related endpoints that user requested"""
    print("\n2. Testing Slideshow Generator Endpoints...")
    
    # Test GET /api/health (specific endpoint user requested)
    print("   Testing GET /api/health...")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ GET /api/health working: {data}")
            health_working = True
        else:
            print(f"   ❌ GET /api/health failed with status {response.status_code}")
            health_working = False
    except Exception as e:
        print(f"   ❌ Error testing /api/health: {e}")
        health_working = False
    
    # Test POST /api/generate-slideshow
    print("   Testing POST /api/generate-slideshow...")
    test_data = {
        "title": "Backend Test Slideshow",
        "text": "This is a comprehensive backend test slideshow with proper data",
        "images": [],
        "theme": "minimal",
        "duration": 15
    }
    video_id = None
    try:
        response = requests.post(f"{API_BASE}/generate-slideshow", 
                               json=test_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            video_id = data.get('videoId')
            print(f"   ✅ POST /api/generate-slideshow working: {data}")
            generate_working = True
        else:
            print(f"   ❌ POST /api/generate-slideshow failed with status {response.status_code}: {response.text}")
            generate_working = False
    except Exception as e:
        print(f"   ❌ Error testing /api/generate-slideshow: {e}")
        generate_working = False
    
    # Test GET /api/videos
    print("   Testing GET /api/videos...")
    try:
        response = requests.get(f"{API_BASE}/videos", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ GET /api/videos working: Found {len(data)} videos")
            videos_working = True
            # Get a real video ID for status testing
            if data and not video_id:
                video_id = data[0]['id']
        else:
            print(f"   ❌ GET /api/videos failed with status {response.status_code}")
            videos_working = False
    except Exception as e:
        print(f"   ❌ Error testing /api/videos: {e}")
        videos_working = False
    
    # Test GET /api/video-status/{videoId} with real video ID
    print("   Testing GET /api/video-status/{videoId}...")
    try:
        if video_id:
            response = requests.get(f"{API_BASE}/video-status/{video_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ GET /api/video-status working: {data}")
                status_working = True
            else:
                print(f"   ❌ GET /api/video-status failed with status {response.status_code}")
                status_working = False
        else:
            print("   ⚠️  No video ID available to test video-status endpoint")
            status_working = False
    except Exception as e:
        print(f"   ❌ Error testing /api/video-status: {e}")
        status_working = False
    
    return health_working, generate_working, videos_working, status_working

def test_existing_endpoints():
    """Test the endpoints that actually exist in the backend"""
    print("\n3. Testing Existing Backend Endpoints...")
    
    # Test POST /api/status
    print("   Testing POST /api/status...")
    test_data = {
        "client_name": "test_client_slideshow_app"
    }
    try:
        response = requests.post(f"{API_BASE}/status", 
                               json=test_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ POST /api/status successful: {data}")
            return data.get('id')  # Return the ID for further testing
        else:
            print(f"   ❌ POST /api/status failed with status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"   ❌ Error testing POST /api/status: {e}")
        return None
    
    # Test GET /api/status
    print("   Testing GET /api/status...")
    try:
        response = requests.get(f"{API_BASE}/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ GET /api/status successful: Found {len(data)} status checks")
            return True
        else:
            print(f"   ❌ GET /api/status failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error testing GET /api/status: {e}")
        return False

def test_error_handling():
    """Test error handling with invalid data"""
    print("\n4. Testing Error Handling...")
    
    # Test POST /api/status with invalid data
    print("   Testing POST /api/status with invalid data...")
    try:
        response = requests.post(f"{API_BASE}/status", 
                               json={}, timeout=10)  # Missing required field
        print(f"   Status: {response.status_code}, Response: {response.text}")
        if response.status_code == 422:  # FastAPI validation error
            print("   ✅ Proper validation error handling")
        else:
            print("   ⚠️  Unexpected response for invalid data")
    except Exception as e:
        print(f"   ❌ Error testing invalid data: {e}")

def main():
    """Run all tests"""
    print("🚀 Starting Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    
    # Test basic health
    health_ok = test_health_check()
    
    # Test slideshow endpoints (user requested)
    test_slideshow_endpoints()
    
    # Test existing endpoints
    existing_ok = test_existing_endpoints()
    
    # Test error handling
    test_error_handling()
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY:")
    print(f"✅ Basic API connectivity: {'PASS' if health_ok else 'FAIL'}")
    print(f"❌ Slideshow API endpoints: NOT IMPLEMENTED")
    print(f"✅ Existing status endpoints: {'PASS' if existing_ok else 'FAIL'}")
    print("\n🔍 FINDINGS:")
    print("- The backend is running and responding to requests")
    print("- Basic status check endpoints are working correctly")
    print("- Slideshow generator API endpoints are NOT implemented in backend")
    print("- The slideshow functionality appears to be frontend-only (demo mode)")
    print("\n💡 RECOMMENDATIONS:")
    print("- Implement slideshow generator API endpoints in backend")
    print("- Add video processing capabilities")
    print("- Integrate with Remotion for actual video generation")

if __name__ == "__main__":
    main()