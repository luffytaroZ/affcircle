#!/usr/bin/env python3
"""
Comprehensive Backend Testing Suite for AI Content Creator
Tests all backend APIs including health check, slideshow generation, video status tracking, and database connectivity
"""

import requests
import json
import time
import sys
import uuid
from datetime import datetime

# Configuration
BACKEND_URL = "https://583cf182-02fd-44b5-810f-1005bc946497.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    def log_test(self, test_name, passed, details="", error_msg=""):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "error": error_msg,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if error_msg:
            print(f"   Error: {error_msg}")
        print()

    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{API_BASE}/health", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                services = data.get('services', {})
                
                # Check individual services
                remotion_status = services.get('remotion', 'unknown')
                db_status = services.get('database', 'unknown')
                ai_status = services.get('ai', 'unknown')
                server_status = services.get('server', 'unknown')
                
                details = f"Services: Remotion={remotion_status}, DB={db_status}, AI={ai_status}, Server={server_status}"
                
                if all(status in ['ready', 'connected', 'running'] for status in [remotion_status, db_status, server_status]):
                    self.log_test("Health Check Endpoint", True, details)
                    return True
                else:
                    self.log_test("Health Check Endpoint", False, details, "Some services not healthy")
                    return False
            else:
                self.log_test("Health Check Endpoint", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Health Check Endpoint", False, "", str(e))
            return False

    def test_basic_api_info(self):
        """Test basic API info endpoint"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                message = data.get('message', '')
                version = data.get('version', '')
                
                if 'AI Content Creator' in message and version:
                    self.log_test("Basic API Info", True, f"Version: {version}")
                    return True
                else:
                    self.log_test("Basic API Info", False, "Missing expected fields", str(data))
                    return False
            else:
                self.log_test("Basic API Info", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Basic API Info", False, "", str(e))
            return False

    def test_video_listing(self):
        """Test video listing endpoint"""
        try:
            response = requests.get(f"{API_BASE}/videos", timeout=15)
            
            if response.status_code == 200:
                videos = response.json()
                
                if isinstance(videos, list):
                    self.log_test("Video Listing", True, f"Found {len(videos)} videos")
                    return videos
                else:
                    self.log_test("Video Listing", False, "Response not a list", str(videos))
                    return []
            else:
                self.log_test("Video Listing", False, f"Status: {response.status_code}", response.text)
                return []
                
        except Exception as e:
            self.log_test("Video Listing", False, "", str(e))
            return []

    def test_slideshow_generation(self):
        """Test slideshow generation endpoint"""
        try:
            # Test data for slideshow generation
            test_data = {
                "title": "Backend Test Slideshow",
                "text": "This is a comprehensive test of the slideshow generation system. Testing database connectivity, video processing, and API functionality.",
                "theme": "minimal",
                "duration": 15
            }
            
            response = requests.post(
                f"{API_BASE}/generate-slideshow",
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                video_id = result.get('videoId') or result.get('id')  # Handle both possible field names
                status = result.get('status')
                
                if video_id:
                    self.log_test("Slideshow Generation", True, f"Created video ID: {video_id}, Status: {status}")
                    return video_id
                else:
                    self.log_test("Slideshow Generation", False, "No video ID returned", str(result))
                    return None
            else:
                self.log_test("Slideshow Generation", False, f"Status: {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_test("Slideshow Generation", False, "", str(e))
            return None

    def test_video_status_tracking(self, video_id):
        """Test video status tracking endpoint"""
        if not video_id:
            self.log_test("Video Status Tracking", False, "", "No video ID provided")
            return False
            
        try:
            response = requests.get(f"{API_BASE}/video-status/{video_id}", timeout=15)
            
            if response.status_code == 200:
                status_data = response.json()
                
                required_fields = ['id', 'title', 'status', 'created_at']
                missing_fields = [field for field in required_fields if field not in status_data]
                
                if not missing_fields:
                    status = status_data.get('status', 'unknown')
                    title = status_data.get('title', 'unknown')
                    self.log_test("Video Status Tracking", True, f"Status: {status}, Title: {title}")
                    return True
                else:
                    self.log_test("Video Status Tracking", False, f"Missing fields: {missing_fields}", str(status_data))
                    return False
            elif response.status_code == 404:
                self.log_test("Video Status Tracking", False, "Video not found", "Video may not exist in database")
                return False
            else:
                self.log_test("Video Status Tracking", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Video Status Tracking", False, "", str(e))
            return False

    def test_thread_listing(self):
        """Test thread listing endpoint"""
        try:
            response = requests.get(f"{API_BASE}/threads", timeout=15)
            
            if response.status_code == 200:
                threads = response.json()
                
                if isinstance(threads, list):
                    self.log_test("Thread Listing", True, f"Found {len(threads)} threads")
                    return True
                else:
                    self.log_test("Thread Listing", False, "Response not a list", str(threads))
                    return False
            else:
                self.log_test("Thread Listing", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Thread Listing", False, "", str(e))
            return False

    def test_thread_generation(self):
        """Test thread generation endpoint"""
        try:
            # Test data for thread generation
            test_data = {
                "topic": "Backend API Testing Best Practices",
                "style": "educational",
                "thread_length": 3,
                "platform": "twitter"
            }
            
            response = requests.post(
                f"{API_BASE}/generate-thread",
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                thread_id = result.get('threadId') or result.get('id')  # Handle both possible field names
                status = result.get('status')
                
                if thread_id:
                    self.log_test("Thread Generation", True, f"Created thread ID: {thread_id}, Status: {status}")
                    return thread_id
                else:
                    self.log_test("Thread Generation", False, "No thread ID returned", str(result))
                    return None
            else:
                self.log_test("Thread Generation", False, f"Status: {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_test("Thread Generation", False, "", str(e))
            return None

    def test_thread_status_tracking(self, thread_id):
        """Test thread status tracking endpoint"""
        if not thread_id:
            self.log_test("Thread Status Tracking", False, "", "No thread ID provided")
            return False
            
        try:
            response = requests.get(f"{API_BASE}/thread-status/{thread_id}", timeout=15)
            
            if response.status_code == 200:
                status_data = response.json()
                
                required_fields = ['id', 'topic', 'status', 'created_at']
                missing_fields = [field for field in required_fields if field not in status_data]
                
                if not missing_fields:
                    status = status_data.get('status', 'unknown')
                    topic = status_data.get('topic', 'unknown')
                    self.log_test("Thread Status Tracking", True, f"Status: {status}, Topic: {topic}")
                    return True
                else:
                    self.log_test("Thread Status Tracking", False, f"Missing fields: {missing_fields}", str(status_data))
                    return False
            elif response.status_code == 404:
                self.log_test("Thread Status Tracking", False, "Thread not found", "Thread may not exist in database")
                return False
            else:
                self.log_test("Thread Status Tracking", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Thread Status Tracking", False, "", str(e))
            return False

    def test_database_connectivity(self):
        """Test database connectivity through API operations"""
        try:
            # Test by creating and retrieving a video record
            test_video_data = {
                "title": "Database Connectivity Test",
                "text": "Testing Supabase PostgreSQL connectivity",
                "theme": "minimal",
                "duration": 15
            }
            
            # Create video
            create_response = requests.post(
                f"{API_BASE}/generate-slideshow",
                json=test_video_data,
                timeout=30
            )
            
            if create_response.status_code == 200:
                video_data = create_response.json()
                video_id = video_data.get('id')
                
                if video_id:
                    # Try to retrieve the video
                    time.sleep(1)  # Brief pause
                    status_response = requests.get(f"{API_BASE}/video-status/{video_id}", timeout=15)
                    
                    if status_response.status_code == 200:
                        self.log_test("Database Connectivity (Supabase PostgreSQL)", True, f"Successfully created and retrieved video {video_id}")
                        return True
                    else:
                        self.log_test("Database Connectivity (Supabase PostgreSQL)", False, "Failed to retrieve created video", status_response.text)
                        return False
                else:
                    self.log_test("Database Connectivity (Supabase PostgreSQL)", False, "Video creation failed", str(video_data))
                    return False
            else:
                self.log_test("Database Connectivity (Supabase PostgreSQL)", False, f"Create failed: {create_response.status_code}", create_response.text)
                return False
                
        except Exception as e:
            self.log_test("Database Connectivity (Supabase PostgreSQL)", False, "", str(e))
            return False

    def test_error_handling(self):
        """Test API error handling"""
        try:
            # Test invalid slideshow data
            invalid_data = {
                "title": "",  # Empty title should fail validation
                "theme": "invalid_theme",
                "duration": 999  # Invalid duration
            }
            
            response = requests.post(
                f"{API_BASE}/generate-slideshow",
                json=invalid_data,
                timeout=15
            )
            
            if response.status_code in [400, 422]:  # Should return validation error
                self.log_test("Error Handling (Validation)", True, f"Properly rejected invalid data with status {response.status_code}")
                return True
            else:
                self.log_test("Error Handling (Validation)", False, f"Unexpected status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Error Handling (Validation)", False, "", str(e))
            return False

    def test_nonexistent_endpoints(self):
        """Test 404 handling for non-existent endpoints"""
        try:
            response = requests.get(f"{API_BASE}/nonexistent-endpoint", timeout=10)
            
            if response.status_code == 404:
                self.log_test("404 Error Handling", True, "Properly returns 404 for non-existent endpoints")
                return True
            else:
                self.log_test("404 Error Handling", False, f"Unexpected status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("404 Error Handling", False, "", str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend Testing Suite")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 80)
        print()
        
        # Core functionality tests
        self.test_basic_api_info()
        health_ok = self.test_health_check()
        
        # Video-related tests
        videos = self.test_video_listing()
        video_id = self.test_slideshow_generation()
        if video_id:
            time.sleep(2)  # Wait for video to be processed
            self.test_video_status_tracking(video_id)
        
        # Thread-related tests (from current_focus)
        self.test_thread_listing()
        thread_id = self.test_thread_generation()
        if thread_id:
            time.sleep(2)  # Wait for thread to be processed
            self.test_thread_status_tracking(thread_id)
        
        # Database and system tests
        self.test_database_connectivity()
        self.test_error_handling()
        self.test_nonexistent_endpoints()
        
        # Print summary
        print("=" * 80)
        print("🎯 BACKEND TESTING SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests} ✅")
        print(f"Failed: {self.failed_tests} ❌")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        print()
        
        if self.failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if "FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['error']}")
            print()
        
        # Check for specific issues mentioned in review request
        print("🔍 SPECIFIC ISSUE VERIFICATION:")
        if health_ok:
            print("✅ All services running properly")
        else:
            print("❌ Some services not healthy")
            
        if video_id:
            print("✅ Slideshow generation working - 'Failed to fetch' error resolved")
        else:
            print("❌ Slideshow generation still has issues")
            
        print()
        
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 ALL TESTS PASSED! Backend system is fully operational.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the details above.")
        sys.exit(1)