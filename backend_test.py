#!/usr/bin/env python3
"""
Comprehensive Backend Testing Suite for Node.js AI Content Creator
Tests all API endpoints, database operations, and system health
"""

import requests
import json
import time
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://961aa6a1-0e44-4a95-9e4d-2cc18df1b817.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.auth_token = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        
    def test_health_check(self):
        """Test system health and service status"""
        print("\n🔍 Testing Health Check...")
        
        try:
            # Test basic API info
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Info", True, f"API version {data.get('version', 'unknown')}")
            else:
                self.log_test("API Info", False, f"Status code: {response.status_code}")
                
            # Test health endpoint
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                health = response.json()
                services = health.get('services', {})
                
                # Check individual services
                remotion_status = services.get('remotion') == 'ready'
                db_status = services.get('database') == 'connected'
                ai_status = services.get('ai') == 'connected'
                server_status = services.get('server') == 'running'
                
                self.log_test("Remotion Service", remotion_status, 
                            f"Status: {services.get('remotion', 'unknown')}")
                self.log_test("Database Service", db_status, 
                            f"Status: {services.get('database', 'unknown')}")
                self.log_test("AI Service", ai_status, 
                            f"Status: {services.get('ai', 'unknown')}")
                self.log_test("Server Service", server_status, 
                            f"Status: {services.get('server', 'unknown')}")
                
                overall_health = remotion_status and db_status and ai_status and server_status
                self.log_test("Overall Health", overall_health, 
                            f"All services {'healthy' if overall_health else 'have issues'}")
                            
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            
    def test_video_endpoints(self):
        """Test slideshow/video generation endpoints"""
        print("\n🎬 Testing Video Endpoints...")
        
        try:
            # Test video listing
            response = self.session.get(f"{self.base_url}/videos")
            if response.status_code == 200:
                videos = response.json()
                self.log_test("List Videos", True, f"Retrieved {len(videos)} videos")
            else:
                self.log_test("List Videos", False, f"Status code: {response.status_code}")
                
            # Test slideshow generation with valid data
            slideshow_data = {
                "title": "Backend Test Slideshow",
                "text": "This is a comprehensive test of the slideshow generation system with Node.js backend and Supabase PostgreSQL database.",
                "theme": "minimal",
                "duration": 15,
                "images": []
            }
            
            response = self.session.post(f"{self.base_url}/generate-slideshow", 
                                       json=slideshow_data)
            
            if response.status_code == 200:
                result = response.json()
                video_id = result.get('videoId')
                self.log_test("Generate Slideshow", True, 
                            f"Created video with ID: {video_id}")
                
                # Test video status tracking
                if video_id:
                    self.test_video_status(video_id)
                    
            else:
                self.log_test("Generate Slideshow", False, 
                            f"Status code: {response.status_code}, Response: {response.text}")
                
            # Test validation errors
            invalid_data = {
                "title": "Test",
                "theme": "invalid_theme",
                "duration": 45  # Invalid duration
            }
            
            response = self.session.post(f"{self.base_url}/generate-slideshow", 
                                       json=invalid_data)
            
            if response.status_code == 400:
                self.log_test("Validation Errors", True, "Properly rejected invalid data")
            else:
                self.log_test("Validation Errors", False, 
                            f"Should have returned 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Video Endpoints", False, f"Exception: {str(e)}")
            
    def test_video_status(self, video_id):
        """Test video status tracking"""
        print(f"📊 Testing Video Status for {video_id}...")
        
        try:
            max_attempts = 30  # 30 seconds max
            attempt = 0
            
            while attempt < max_attempts:
                response = self.session.get(f"{self.base_url}/video-status/{video_id}")
                
                if response.status_code == 200:
                    status_data = response.json()
                    status = status_data.get('status')
                    progress = status_data.get('progress', 0)
                    
                    print(f"  Status: {status}, Progress: {progress}%")
                    
                    if status == 'completed':
                        output_url = status_data.get('output_url')
                        self.log_test("Video Processing", True, 
                                    f"Video completed successfully with output: {output_url}")
                        
                        # Test if video file exists
                        if output_url:
                            video_response = self.session.head(f"{self.base_url.replace('/api', '')}{output_url}")
                            if video_response.status_code == 200:
                                self.log_test("Video File Generation", True, 
                                            "MP4 file accessible via URL")
                            else:
                                self.log_test("Video File Generation", False, 
                                            f"Video file not accessible: {video_response.status_code}")
                        break
                        
                    elif status == 'failed':
                        error_msg = status_data.get('error_message', 'Unknown error')
                        self.log_test("Video Processing", False, f"Video failed: {error_msg}")
                        break
                        
                    elif status in ['pending', 'processing']:
                        time.sleep(1)  # Wait 1 second before next check
                        attempt += 1
                        continue
                        
                else:
                    self.log_test("Video Status Check", False, 
                                f"Status code: {response.status_code}")
                    break
                    
            if attempt >= max_attempts:
                self.log_test("Video Processing", False, "Timeout waiting for video completion")
                
        except Exception as e:
            self.log_test("Video Status", False, f"Exception: {str(e)}")
            
    def test_thread_endpoints(self):
        """Test thread maker endpoints"""
        print("\n🧵 Testing Thread Endpoints...")
        
        try:
            # Test thread listing
            response = self.session.get(f"{self.base_url}/threads")
            if response.status_code == 200:
                threads = response.json()
                self.log_test("List Threads", True, f"Retrieved {len(threads)} threads")
            else:
                self.log_test("List Threads", False, f"Status code: {response.status_code}")
                
            # Test thread generation
            thread_data = {
                "topic": "The future of AI in content creation",
                "style": "educational",
                "thread_length": 5,
                "platform": "twitter"
            }
            
            response = self.session.post(f"{self.base_url}/generate-thread", 
                                       json=thread_data)
            
            if response.status_code == 200:
                result = response.json()
                thread_id = result.get('threadId')
                self.log_test("Generate Thread", True, 
                            f"Created thread with ID: {thread_id}")
                
                # Test thread status
                if thread_id:
                    self.test_thread_status(thread_id)
                    
            else:
                self.log_test("Generate Thread", False, 
                            f"Status code: {response.status_code}, Response: {response.text}")
                
            # Test thread validation
            invalid_thread = {
                "topic": "",  # Empty topic
                "style": "invalid_style",
                "thread_length": 25  # Too long
            }
            
            response = self.session.post(f"{self.base_url}/generate-thread", 
                                       json=invalid_thread)
            
            if response.status_code == 400:
                self.log_test("Thread Validation", True, "Properly rejected invalid thread data")
            else:
                self.log_test("Thread Validation", False, 
                            f"Should have returned 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Thread Endpoints", False, f"Exception: {str(e)}")
            
    def test_thread_status(self, thread_id):
        """Test thread status tracking"""
        print(f"📊 Testing Thread Status for {thread_id}...")
        
        try:
            max_attempts = 20  # 20 seconds max
            attempt = 0
            
            while attempt < max_attempts:
                response = self.session.get(f"{self.base_url}/thread-status/{thread_id}")
                
                if response.status_code == 200:
                    status_data = response.json()
                    status = status_data.get('status')
                    
                    print(f"  Thread Status: {status}")
                    
                    if status == 'completed':
                        content = status_data.get('content')
                        if content and len(content) > 0:
                            self.log_test("Thread Generation", True, 
                                        f"Thread completed with {len(content)} posts")
                        else:
                            self.log_test("Thread Generation", False, "Thread completed but no content")
                        break
                        
                    elif status == 'failed':
                        error_msg = status_data.get('error_message', 'Unknown error')
                        self.log_test("Thread Generation", False, f"Thread failed: {error_msg}")
                        break
                        
                    elif status in ['pending', 'processing']:
                        time.sleep(1)
                        attempt += 1
                        continue
                        
                else:
                    self.log_test("Thread Status Check", False, 
                                f"Status code: {response.status_code}")
                    break
                    
            if attempt >= max_attempts:
                self.log_test("Thread Generation", False, "Timeout waiting for thread completion")
                
        except Exception as e:
            self.log_test("Thread Status", False, f"Exception: {str(e)}")
            
    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        try:
            # Test registration with unique email
            timestamp = int(time.time())
            test_email = f"test{timestamp}@example.com"
            test_password = "TestPassword123!"
            
            register_data = {
                "email": test_email,
                "password": test_password
            }
            
            response = self.session.post(f"{self.base_url}/auth/register", 
                                       json=register_data)
            
            if response.status_code == 201:
                self.log_test("User Registration", True, "Successfully registered new user")
                
                # Test login
                login_data = {
                    "email": test_email,
                    "password": test_password
                }
                
                response = self.session.post(f"{self.base_url}/auth/login", 
                                           json=login_data)
                
                if response.status_code == 200:
                    login_result = response.json()
                    self.auth_token = login_result.get('access_token')
                    self.log_test("User Login", True, "Successfully logged in")
                    
                    # Test profile access
                    if self.auth_token:
                        headers = {"Authorization": f"Bearer {self.auth_token}"}
                        response = self.session.get(f"{self.base_url}/auth/profile", 
                                                  headers=headers)
                        
                        if response.status_code == 200:
                            profile = response.json()
                            self.log_test("Profile Access", True, 
                                        f"Retrieved profile for user: {profile.get('user', {}).get('email', 'unknown')}")
                        else:
                            self.log_test("Profile Access", False, 
                                        f"Status code: {response.status_code}")
                            
                    # Test logout
                    if self.auth_token:
                        headers = {"Authorization": f"Bearer {self.auth_token}"}
                        response = self.session.post(f"{self.base_url}/auth/logout", 
                                                   headers=headers)
                        
                        if response.status_code == 200:
                            self.log_test("User Logout", True, "Successfully logged out")
                        else:
                            self.log_test("User Logout", False, 
                                        f"Status code: {response.status_code}")
                            
                else:
                    self.log_test("User Login", False, 
                                f"Status code: {response.status_code}")
                    
            else:
                self.log_test("User Registration", False, 
                            f"Status code: {response.status_code}, Response: {response.text}")
                
            # Test auth validation
            invalid_auth = {
                "email": "invalid-email",
                "password": ""
            }
            
            response = self.session.post(f"{self.base_url}/auth/register", 
                                       json=invalid_auth)
            
            if response.status_code == 400:
                self.log_test("Auth Validation", True, "Properly rejected invalid auth data")
            else:
                self.log_test("Auth Validation", False, 
                            f"Should have returned 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Auth Endpoints", False, f"Exception: {str(e)}")
            
    def test_database_operations(self):
        """Test database connectivity and operations"""
        print("\n🗄️ Testing Database Operations...")
        
        try:
            # Test video listing (database read)
            response = self.session.get(f"{self.base_url}/videos")
            if response.status_code == 200:
                videos = response.json()
                self.log_test("Database Read (Videos)", True, 
                            f"Successfully read {len(videos)} video records")
                
                # Check if we have the successful test video
                test_video = None
                for video in videos:
                    if video.get('id') == '59275ea7-f04b-4b49-b20a-3c2aa6e84919':
                        test_video = video
                        break
                        
                if test_video:
                    self.log_test("Test Video Verification", True, 
                                f"Found successful test video: {test_video.get('title', 'Unknown')}")
                else:
                    self.log_test("Test Video Verification", False, 
                                "Could not find the successful test video mentioned in review")
                    
            else:
                self.log_test("Database Read (Videos)", False, 
                            f"Status code: {response.status_code}")
                
            # Test thread listing (database read)
            response = self.session.get(f"{self.base_url}/threads")
            if response.status_code == 200:
                threads = response.json()
                self.log_test("Database Read (Threads)", True, 
                            f"Successfully read {len(threads)} thread records")
            else:
                self.log_test("Database Read (Threads)", False, 
                            f"Status code: {response.status_code}")
                
        except Exception as e:
            self.log_test("Database Operations", False, f"Exception: {str(e)}")
            
    def test_error_handling(self):
        """Test error handling and edge cases"""
        print("\n⚠️ Testing Error Handling...")
        
        try:
            # Test 404 for non-existent video
            response = self.session.get(f"{self.base_url}/video-status/non-existent-id")
            if response.status_code == 404:
                self.log_test("404 Error Handling", True, "Properly returned 404 for non-existent video")
            else:
                self.log_test("404 Error Handling", False, 
                            f"Expected 404, got {response.status_code}")
                
            # Test 404 for non-existent thread
            response = self.session.get(f"{self.base_url}/thread-status/non-existent-id")
            if response.status_code == 404:
                self.log_test("Thread 404 Handling", True, "Properly returned 404 for non-existent thread")
            else:
                self.log_test("Thread 404 Handling", False, 
                            f"Expected 404, got {response.status_code}")
                
            # Test invalid route
            response = self.session.get(f"{self.base_url}/invalid-route")
            if response.status_code == 404:
                self.log_test("Invalid Route Handling", True, "Properly returned 404 for invalid route")
            else:
                self.log_test("Invalid Route Handling", False, 
                            f"Expected 404, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Error Handling", False, f"Exception: {str(e)}")
            
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend Testing...")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Run all test suites
        self.test_health_check()
        self.test_database_operations()
        self.test_video_endpoints()
        self.test_thread_endpoints()
        self.test_auth_endpoints()
        self.test_error_handling()
        
        # Generate summary
        self.generate_summary()
        
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for test in self.test_results:
                if not test['success']:
                    print(f"  - {test['test']}: {test['message']}")
                    
        print("\n✅ CRITICAL SYSTEMS STATUS:")
        
        # Check critical systems
        critical_tests = [
            'Overall Health',
            'Database Read (Videos)',
            'Generate Slideshow',
            'Video Processing'
        ]
        
        for critical_test in critical_tests:
            test_result = next((t for t in self.test_results if t['test'] == critical_test), None)
            if test_result:
                status = "✅" if test_result['success'] else "❌"
                print(f"  {status} {critical_test}: {test_result['message']}")
            else:
                print(f"  ⚠️ {critical_test}: Not tested")
                
        return passed_tests, failed_tests

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()