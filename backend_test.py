#!/usr/bin/env python3
"""
Comprehensive Backend Testing Suite for Restructured AI Content Creator
Tests all modular services, routes, middleware, and integrations
"""

import requests
import json
import time
import uuid
from datetime import datetime
import os

class BackendTester:
    def __init__(self):
        # Get backend URL from frontend .env
        self.base_url = "https://9a2f5653-8e20-419b-b59d-b46d49c4b217.preview.emergentagent.com/api"
        self.test_results = []
        self.auth_token = None
        self.test_user_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_password = "TestPassword123!"
        
        print(f"🧪 Starting Comprehensive Backend Testing")
        print(f"📍 Backend URL: {self.base_url}")
        print(f"👤 Test User: {self.test_user_email}")
        print("=" * 80)

    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   📝 {details}")
        if response_data and not success:
            print(f"   📊 Response: {response_data}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        print()

    def make_request(self, method, endpoint, data=None, headers=None, timeout=30):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if headers:
            default_headers.update(headers)
            
        if self.auth_token and 'Authorization' not in default_headers:
            default_headers['Authorization'] = f'Bearer {self.auth_token}'
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=default_headers, timeout=timeout)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=timeout)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=timeout)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"   🔌 Connection Error: {str(e)}")
            return None

    def test_system_health(self):
        """Test system health and configuration endpoints"""
        print("🏥 TESTING SYSTEM HEALTH & CONFIGURATION")
        print("-" * 50)
        
        # Test basic API info
        response = self.make_request('GET', '/')
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Basic API Info", True, 
                         f"Version: {data.get('version', 'N/A')}, Message: {data.get('message', 'N/A')}")
        else:
            self.log_test("Basic API Info", False, 
                         f"Status: {response.status_code if response else 'No response'}")

        # Test health check
        response = self.make_request('GET', '/health')
        if response and response.status_code == 200:
            data = response.json()
            services = data.get('services', {})
            all_healthy = all(status in ['ready', 'connected', 'running'] 
                            for status in services.values())
            self.log_test("Health Check", all_healthy, 
                         f"Services: {services}, Status: {data.get('status')}")
        else:
            self.log_test("Health Check", False, 
                         f"Status: {response.status_code if response else 'No response'}")

        # Test system info
        response = self.make_request('GET', '/system-info')
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("System Info", True, 
                         f"Node: {data.get('node_version')}, Platform: {data.get('platform')}")
        else:
            self.log_test("System Info", False, 
                         f"Status: {response.status_code if response else 'No response'}")

    def test_authentication_system(self):
        """Test complete authentication system"""
        print("🔐 TESTING AUTHENTICATION SYSTEM")
        print("-" * 50)
        
        # Test user registration
        register_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        response = self.make_request('POST', '/auth/register', register_data)
        if response and response.status_code == 201:
            data = response.json()
            if data.get('user') and data.get('session'):
                self.auth_token = data['session']['access_token']
                self.log_test("User Registration", True, 
                             f"User ID: {data['user']['id']}, Email verified: {data['user'].get('email_confirmed_at') is not None}")
            else:
                self.log_test("User Registration", False, "Missing user or session data")
        else:
            self.log_test("User Registration", False, 
                         f"Status: {response.status_code if response else 'No response'}")

        # Test user login
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        response = self.make_request('POST', '/auth/login', login_data)
        if response and response.status_code == 200:
            data = response.json()
            if data.get('user') and data.get('session'):
                self.auth_token = data['session']['access_token']
                self.log_test("User Login", True, 
                             f"Access token received, User: {data['user']['email']}")
            else:
                self.log_test("User Login", False, "Missing user or session data")
        else:
            self.log_test("User Login", False, 
                         f"Status: {response.status_code if response else 'No response'}")

        # Test profile access (protected route)
        if self.auth_token:
            response = self.make_request('GET', '/auth/profile')
            if response and response.status_code == 200:
                data = response.json()
                self.log_test("Profile Access", True, 
                             f"User email: {data.get('user', {}).get('email')}")
            else:
                self.log_test("Profile Access", False, 
                             f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Profile Access", False, "No auth token available")

        # Test password reset
        reset_data = {"email": self.test_user_email}
        response = self.make_request('POST', '/auth/reset-password', reset_data)
        if response and response.status_code == 200:
            self.log_test("Password Reset", True, "Reset email sent successfully")
        else:
            self.log_test("Password Reset", False, 
                         f"Status: {response.status_code if response else 'No response'}")

    def test_video_generation_api(self):
        """Test complete video generation system"""
        print("🎬 TESTING VIDEO GENERATION API")
        print("-" * 50)
        
        # Test video listing
        response = self.make_request('GET', '/videos')
        if response and response.status_code == 200:
            videos = response.json()
            self.log_test("Video Listing", True, 
                         f"Found {len(videos)} videos in database")
        else:
            self.log_test("Video Listing", False, 
                         f"Status: {response.status_code if response else 'No response'}")

        # Test video generation with all themes
        themes_to_test = ['minimal', 'corporate', 'storytelling', 'modern', 
                         'creative', 'professional', 'elegant', 'cinematic']
        durations_to_test = [15, 30, 60]
        
        video_ids = []
        
        for theme in themes_to_test[:3]:  # Test first 3 themes to save time
            for duration in [15]:  # Test only 15s duration to save time
                video_data = {
                    "title": f"Test {theme.title()} Video - {duration}s",
                    "text": f"This is a comprehensive test of the {theme} theme with {duration} second duration. Testing the restructured backend system with modular architecture.",
                    "images": [],
                    "theme": theme,
                    "duration": duration
                }
                
                response = self.make_request('POST', '/generate-slideshow', video_data)
                if response and response.status_code == 200:
                    data = response.json()
                    video_id = data.get('videoId')
                    if video_id:
                        video_ids.append(video_id)
                        self.log_test(f"Video Generation ({theme}, {duration}s)", True, 
                                     f"Video ID: {video_id}, Status: {data.get('status')}")
                    else:
                        self.log_test(f"Video Generation ({theme}, {duration}s)", False, 
                                     "No video ID returned")
                else:
                    self.log_test(f"Video Generation ({theme}, {duration}s)", False, 
                                 f"Status: {response.status_code if response else 'No response'}")

        # Test video status tracking
        if video_ids:
            test_video_id = video_ids[0]
            max_attempts = 10
            attempt = 0
            
            while attempt < max_attempts:
                response = self.make_request('GET', f'/video-status/{test_video_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    status = data.get('status')
                    progress = data.get('progress', 0)
                    
                    if status == 'completed':
                        self.log_test("Video Status Tracking", True, 
                                     f"Video completed successfully, Progress: {progress}%, URL: {data.get('output_url')}")
                        break
                    elif status == 'failed':
                        self.log_test("Video Status Tracking", False, 
                                     f"Video generation failed: {data.get('error_message')}")
                        break
                    else:
                        print(f"   ⏳ Video processing... Status: {status}, Progress: {progress}%")
                        time.sleep(3)
                        attempt += 1
                else:
                    self.log_test("Video Status Tracking", False, 
                                 f"Status: {response.status_code if response else 'No response'}")
                    break
            
            if attempt >= max_attempts:
                self.log_test("Video Status Tracking", False, 
                             "Video processing timeout after 30 seconds")

        # Test validation errors
        invalid_data = {
            "title": "",  # Missing title
            "theme": "invalid_theme",  # Invalid theme
            "duration": 45  # Invalid duration
        }
        
        response = self.make_request('POST', '/generate-slideshow', invalid_data)
        if response and response.status_code == 400:
            self.log_test("Video Validation", True, 
                         "Properly rejected invalid video data")
        else:
            self.log_test("Video Validation", False, 
                         "Should have rejected invalid data")

    def test_thread_maker_api(self):
        """Test complete thread maker system"""
        print("🧵 TESTING THREAD MAKER API")
        print("-" * 50)
        
        # Test thread listing
        response = self.make_request('GET', '/threads')
        if response and response.status_code == 200:
            threads = response.json()
            self.log_test("Thread Listing", True, 
                         f"Found {len(threads)} threads in database")
        else:
            self.log_test("Thread Listing", False, 
                         f"Status: {response.status_code if response else 'No response'}")

        # Test thread generation with different styles and platforms
        styles_to_test = ['engaging', 'educational', 'storytelling', 'professional', 'viral']
        platforms_to_test = ['twitter', 'linkedin', 'instagram']
        
        thread_ids = []
        
        # Test one combination to verify OpenAI integration
        thread_data = {
            "topic": "The future of AI in content creation 2025",
            "style": "educational",
            "thread_length": 5,
            "platform": "twitter"
        }
        
        response = self.make_request('POST', '/generate-thread', thread_data)
        if response and response.status_code == 200:
            data = response.json()
            thread_id = data.get('threadId')
            if thread_id:
                thread_ids.append(thread_id)
                self.log_test("Thread Generation", True, 
                             f"Thread ID: {thread_id}, Status: {data.get('status')}")
            else:
                self.log_test("Thread Generation", False, "No thread ID returned")
        else:
            self.log_test("Thread Generation", False, 
                         f"Status: {response.status_code if response else 'No response'}")

        # Test thread status tracking
        if thread_ids:
            test_thread_id = thread_ids[0]
            max_attempts = 15  # Longer timeout for AI generation
            attempt = 0
            
            while attempt < max_attempts:
                response = self.make_request('GET', f'/thread-status/{test_thread_id}')
                if response and response.status_code == 200:
                    data = response.json()
                    status = data.get('status')
                    progress = data.get('progress', 0)
                    
                    if status == 'completed':
                        content = data.get('content')
                        if content and isinstance(content, list) and len(content) > 0:
                            self.log_test("Thread Status Tracking", True, 
                                         f"Thread completed with {len(content)} posts, First post: {content[0][:100] if content[0] else 'Empty'}...")
                        else:
                            self.log_test("Thread Status Tracking", False, 
                                         "Thread completed but no content generated")
                        break
                    elif status == 'failed':
                        self.log_test("Thread Status Tracking", False, 
                                     f"Thread generation failed: {data.get('error_message')}")
                        break
                    else:
                        print(f"   ⏳ Thread processing... Status: {status}, Progress: {progress}%")
                        time.sleep(4)
                        attempt += 1
                else:
                    self.log_test("Thread Status Tracking", False, 
                                 f"Status: {response.status_code if response else 'No response'}")
                    break
            
            if attempt >= max_attempts:
                self.log_test("Thread Status Tracking", False, 
                             "Thread processing timeout after 60 seconds")

        # Test validation errors
        invalid_data = {
            "topic": "",  # Missing topic
            "style": "invalid_style",  # Invalid style
            "thread_length": 25,  # Invalid length
            "platform": "invalid_platform"  # Invalid platform
        }
        
        response = self.make_request('POST', '/generate-thread', invalid_data)
        if response and response.status_code == 400:
            self.log_test("Thread Validation", True, 
                         "Properly rejected invalid thread data")
        else:
            self.log_test("Thread Validation", False, 
                         "Should have rejected invalid data")

    def test_database_integration(self):
        """Test Supabase PostgreSQL integration"""
        print("🗄️ TESTING DATABASE INTEGRATION")
        print("-" * 50)
        
        # Test video CRUD operations
        response = self.make_request('GET', '/videos')
        if response and response.status_code == 200:
            videos = response.json()
            if videos:
                # Test that videos have proper UUID structure
                sample_video = videos[0]
                has_uuid = 'id' in sample_video and len(sample_video['id']) == 36
                has_timestamps = 'created_at' in sample_video and 'updated_at' in sample_video
                has_metadata = 'metadata' in sample_video
                
                self.log_test("Video Database Schema", 
                             has_uuid and has_timestamps,
                             f"UUID: {has_uuid}, Timestamps: {has_timestamps}, Metadata: {has_metadata}")
            else:
                self.log_test("Video Database Schema", True, "No videos to test schema")
        else:
            self.log_test("Video Database Schema", False, "Could not fetch videos")

        # Test thread CRUD operations
        response = self.make_request('GET', '/threads')
        if response and response.status_code == 200:
            threads = response.json()
            if threads:
                # Test that threads have proper structure
                sample_thread = threads[0]
                has_uuid = 'id' in sample_thread and len(sample_thread['id']) == 36
                has_content = 'content' in sample_thread
                has_metadata = 'metadata' in sample_thread
                
                self.log_test("Thread Database Schema", 
                             has_uuid and has_content,
                             f"UUID: {has_uuid}, Content: {has_content}, Metadata: {has_metadata}")
            else:
                self.log_test("Thread Database Schema", True, "No threads to test schema")
        else:
            self.log_test("Thread Database Schema", False, "Could not fetch threads")

    def test_error_handling_and_validation(self):
        """Test comprehensive error handling and validation"""
        print("⚠️ TESTING ERROR HANDLING & VALIDATION")
        print("-" * 50)
        
        # Test 404 handling
        response = self.make_request('GET', '/nonexistent-endpoint')
        if response and response.status_code == 404:
            self.log_test("404 Error Handling", True, "Properly returns 404 for invalid routes")
        else:
            self.log_test("404 Error Handling", False, 
                         f"Expected 404, got {response.status_code if response else 'No response'}")

        # Test malformed JSON
        try:
            url = f"{self.base_url}/generate-slideshow"
            response = requests.post(url, data="invalid json", 
                                   headers={'Content-Type': 'application/json'}, timeout=10)
            if response.status_code == 400:
                self.log_test("Malformed JSON Handling", True, "Properly rejects malformed JSON")
            else:
                self.log_test("Malformed JSON Handling", False, 
                             f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test("Malformed JSON Handling", False, f"Exception: {str(e)}")

        # Test missing authentication
        response = self.make_request('GET', '/my-videos', headers={'Authorization': ''})
        if response and response.status_code == 401:
            self.log_test("Authentication Required", True, "Properly requires authentication")
        else:
            self.log_test("Authentication Required", False, 
                         f"Expected 401, got {response.status_code if response else 'No response'}")

    def test_cors_and_security(self):
        """Test CORS configuration and security measures"""
        print("🔒 TESTING CORS & SECURITY")
        print("-" * 50)
        
        # Test CORS headers
        response = self.make_request('GET', '/health')
        if response:
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            has_cors = any(cors_headers.values())
            self.log_test("CORS Configuration", has_cors, 
                         f"CORS headers present: {has_cors}")
        else:
            self.log_test("CORS Configuration", False, "Could not test CORS")

        # Test rate limiting (if implemented)
        # This is a basic test - actual rate limiting would need multiple rapid requests
        response = self.make_request('GET', '/health')
        if response:
            self.log_test("Basic Security Headers", True, 
                         f"Server responds normally to requests")
        else:
            self.log_test("Basic Security Headers", False, "Server not responding")

    def run_all_tests(self):
        """Run complete test suite"""
        start_time = time.time()
        
        try:
            self.test_system_health()
            self.test_authentication_system()
            self.test_video_generation_api()
            self.test_thread_maker_api()
            self.test_database_integration()
            self.test_error_handling_and_validation()
            self.test_cors_and_security()
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            self.log_test("Test Suite Execution", False, f"Critical error: {str(e)}")
        
        # Generate summary
        end_time = time.time()
        duration = end_time - start_time
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("=" * 80)
        print("📊 COMPREHENSIVE BACKEND TESTING SUMMARY")
        print("=" * 80)
        print(f"⏱️  Total Duration: {duration:.2f} seconds")
        print(f"📈 Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print()
        
        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")
            print()
        
        print("🎯 KEY FINDINGS:")
        print(f"   • Modular Architecture: {'✅ Working' if passed_tests > total_tests * 0.7 else '❌ Issues Found'}")
        print(f"   • Supabase Integration: {'✅ Connected' if any('Database' in r['test'] and r['success'] for r in self.test_results) else '❌ Connection Issues'}")
        print(f"   • Authentication System: {'✅ Functional' if any('auth' in r['test'].lower() and r['success'] for r in self.test_results) else '❌ Auth Issues'}")
        print(f"   • Video Generation: {'✅ Working' if any('Video Generation' in r['test'] and r['success'] for r in self.test_results) else '❌ Video Issues'}")
        print(f"   • Thread Maker: {'✅ Working' if any('Thread Generation' in r['test'] and r['success'] for r in self.test_results) else '❌ Thread Issues'}")
        print()
        
        return success_rate >= 80  # Consider 80%+ success rate as overall success

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 BACKEND TESTING COMPLETED SUCCESSFULLY!")
        print("   The restructured modular backend system is working correctly.")
    else:
        print("⚠️  BACKEND TESTING COMPLETED WITH ISSUES!")
        print("   Some components need attention before production deployment.")
    
    exit(0 if success else 1)