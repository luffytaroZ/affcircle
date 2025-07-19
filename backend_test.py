#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Supabase Migration
Tests all critical API endpoints to verify successful migration from MongoDB to Supabase PostgreSQL
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, Optional

# Backend URL from environment
BACKEND_URL = "https://062aa473-7a3a-408b-a5ec-1af80a02bb2a.preview.emergentagent.com"

class BackendTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> tuple:
        """Make HTTP request and return response and success status"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == "GET":
                response = self.session.get(url, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url)
            else:
                return None, False
                
            return response, True
        except Exception as e:
            print(f"   Request error: {str(e)}")
            return None, False

    def test_health_check(self):
        """Test GET /api/health - Should return healthy status with bundleReady"""
        response, success = self.make_request("GET", "/api/health")
        
        if not success or not response:
            self.log_test("Health Check", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Health Check", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if data.get("status") == "healthy" and "bundleReady" in data:
                self.log_test("Health Check", True, f"Status: {data['status']}, Bundle Ready: {data['bundleReady']}")
                return True
            else:
                self.log_test("Health Check", False, f"Unexpected response: {data}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"JSON parse error: {str(e)}")
            return False

    def test_videos_list(self):
        """Test GET /api/videos - Should list videos from Supabase"""
        response, success = self.make_request("GET", "/api/videos")
        
        if not success or not response:
            self.log_test("Videos List", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Videos List", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Videos List", True, f"Retrieved {len(data)} videos from Supabase")
                return True
            else:
                self.log_test("Videos List", False, f"Expected list, got: {type(data)}")
                return False
        except Exception as e:
            self.log_test("Videos List", False, f"JSON parse error: {str(e)}")
            return False

    def test_generate_slideshow(self):
        """Test POST /api/generate-slideshow - Should create video records in Supabase"""
        test_data = {
            "title": "Supabase Migration Test Video",
            "text": "Testing video generation after Supabase migration. This should create a record in PostgreSQL.",
            "theme": "minimal",
            "duration": 15,
            "images": []
        }
        
        response, success = self.make_request("POST", "/api/generate-slideshow", test_data)
        
        if not success or not response:
            self.log_test("Generate Slideshow", False, "Request failed")
            return None
            
        if response.status_code != 200:
            self.log_test("Generate Slideshow", False, f"Status code: {response.status_code}, Response: {response.text}")
            return None
            
        try:
            data = response.json()
            if "videoId" in data and data.get("status") == "processing":
                self.log_test("Generate Slideshow", True, f"Video created with ID: {data['videoId']}")
                return data["videoId"]
            else:
                self.log_test("Generate Slideshow", False, f"Unexpected response: {data}")
                return None
        except Exception as e:
            self.log_test("Generate Slideshow", False, f"JSON parse error: {str(e)}")
            return None

    def test_video_status(self, video_id: str):
        """Test GET /api/video-status/{videoId} - Should fetch video status from Supabase"""
        if not video_id:
            self.log_test("Video Status", False, "No video ID provided")
            return False
            
        response, success = self.make_request("GET", f"/api/video-status/{video_id}")
        
        if not success or not response:
            self.log_test("Video Status", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Video Status", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if "id" in data and "status" in data:
                self.log_test("Video Status", True, f"Video {data['id']} status: {data['status']}")
                return True
            else:
                self.log_test("Video Status", False, f"Unexpected response: {data}")
                return False
        except Exception as e:
            self.log_test("Video Status", False, f"JSON parse error: {str(e)}")
            return False

    def test_threads_list(self):
        """Test GET /api/threads - Should list threads from Supabase"""
        response, success = self.make_request("GET", "/api/threads")
        
        if not success or not response:
            self.log_test("Threads List", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Threads List", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Threads List", True, f"Retrieved {len(data)} threads from Supabase")
                return True
            else:
                self.log_test("Threads List", False, f"Expected list, got: {type(data)}")
                return False
        except Exception as e:
            self.log_test("Threads List", False, f"JSON parse error: {str(e)}")
            return False

    def test_generate_thread(self):
        """Test POST /api/generate-thread - Should create thread records in Supabase with OpenAI integration"""
        test_data = {
            "topic": "The future of AI in 2025",
            "style": "educational",
            "thread_length": 5,
            "platform": "twitter"
        }
        
        response, success = self.make_request("POST", "/api/generate-thread", test_data)
        
        if not success or not response:
            self.log_test("Generate Thread", False, "Request failed")
            return None
            
        if response.status_code != 200:
            self.log_test("Generate Thread", False, f"Status code: {response.status_code}, Response: {response.text}")
            return None
            
        try:
            data = response.json()
            if "thread_id" in data and data.get("success"):
                self.log_test("Generate Thread", True, f"Thread created with ID: {data['thread_id']}")
                return data["thread_id"]
            else:
                self.log_test("Generate Thread", False, f"Unexpected response: {data}")
                return None
        except Exception as e:
            self.log_test("Generate Thread", False, f"JSON parse error: {str(e)}")
            return None

    def test_thread_status(self, thread_id: str):
        """Test GET /api/thread-status/{threadId} - Should fetch thread status from Supabase"""
        if not thread_id:
            self.log_test("Thread Status", False, "No thread ID provided")
            return False
            
        response, success = self.make_request("GET", f"/api/thread-status/{thread_id}")
        
        if not success or not response:
            self.log_test("Thread Status", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Thread Status", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if "id" in data and "status" in data:
                self.log_test("Thread Status", True, f"Thread {data['id']} status: {data['status']}")
                return True
            else:
                self.log_test("Thread Status", False, f"Unexpected response: {data}")
                return False
        except Exception as e:
            self.log_test("Thread Status", False, f"JSON parse error: {str(e)}")
            return False

    def test_delete_thread(self, thread_id: str):
        """Test DELETE /api/thread/{threadId} - Should delete threads from Supabase"""
        if not thread_id:
            self.log_test("Delete Thread", False, "No thread ID provided")
            return False
            
        response, success = self.make_request("DELETE", f"/api/thread/{thread_id}")
        
        if not success or not response:
            self.log_test("Delete Thread", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Delete Thread", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if data.get("success"):
                self.log_test("Delete Thread", True, f"Thread {thread_id} deleted successfully")
                return True
            else:
                self.log_test("Delete Thread", False, f"Unexpected response: {data}")
                return False
        except Exception as e:
            self.log_test("Delete Thread", False, f"JSON parse error: {str(e)}")
            return False

    def test_funnels_list(self):
        """Test GET /api/funnels - Should list funnels from Supabase"""
        response, success = self.make_request("GET", "/api/funnels")
        
        if not success or not response:
            self.log_test("Funnels List", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Funnels List", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Funnels List", True, f"Retrieved {len(data)} funnels from Supabase")
                return True
            else:
                self.log_test("Funnels List", False, f"Expected list, got: {type(data)}")
                return False
        except Exception as e:
            self.log_test("Funnels List", False, f"JSON parse error: {str(e)}")
            return False

    def test_create_funnel(self):
        """Test POST /api/funnels - Should create funnel records in Supabase"""
        test_data = {
            "name": "Supabase Migration Test Funnel",
            "description": "Testing funnel creation after Supabase migration",
            "templateId": "basic"
        }
        
        response, success = self.make_request("POST", "/api/funnels", test_data)
        
        if not success or not response:
            self.log_test("Create Funnel", False, "Request failed")
            return None
            
        if response.status_code != 200:
            self.log_test("Create Funnel", False, f"Status code: {response.status_code}, Response: {response.text}")
            return None
            
        try:
            data = response.json()
            if "funnel_id" in data and data.get("success"):
                self.log_test("Create Funnel", True, f"Funnel created with ID: {data['funnel_id']}")
                return data["funnel_id"]
            else:
                self.log_test("Create Funnel", False, f"Unexpected response: {data}")
                return None
        except Exception as e:
            self.log_test("Create Funnel", False, f"JSON parse error: {str(e)}")
            return None

    def test_get_funnel(self, funnel_id: str):
        """Test GET /api/funnels/{funnelId} - Should fetch specific funnel from Supabase"""
        if not funnel_id:
            self.log_test("Get Funnel", False, "No funnel ID provided")
            return False
            
        response, success = self.make_request("GET", f"/api/funnels/{funnel_id}")
        
        if not success or not response:
            self.log_test("Get Funnel", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Get Funnel", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if "id" in data and "name" in data:
                self.log_test("Get Funnel", True, f"Funnel {data['id']} retrieved: {data['name']}")
                return True
            else:
                self.log_test("Get Funnel", False, f"Unexpected response: {data}")
                return False
        except Exception as e:
            self.log_test("Get Funnel", False, f"JSON parse error: {str(e)}")
            return False

    def test_update_funnel(self, funnel_id: str):
        """Test PUT /api/funnels/{funnelId} - Should update funnel in Supabase"""
        if not funnel_id:
            self.log_test("Update Funnel", False, "No funnel ID provided")
            return False
            
        update_data = {
            "name": "Updated Supabase Test Funnel",
            "description": "Updated description after Supabase migration test",
            "seo": {
                "title": "Updated SEO Title",
                "description": "Updated SEO description",
                "keywords": "supabase, migration, test"
            }
        }
        
        response, success = self.make_request("PUT", f"/api/funnels/{funnel_id}", update_data)
        
        if not success or not response:
            self.log_test("Update Funnel", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Update Funnel", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if data.get("success") and "funnel" in data:
                self.log_test("Update Funnel", True, f"Funnel {funnel_id} updated successfully")
                return True
            else:
                self.log_test("Update Funnel", False, f"Unexpected response: {data}")
                return False
        except Exception as e:
            self.log_test("Update Funnel", False, f"JSON parse error: {str(e)}")
            return False

    def test_delete_funnel(self, funnel_id: str):
        """Test DELETE /api/funnels/{funnelId} - Should delete funnel from Supabase"""
        if not funnel_id:
            self.log_test("Delete Funnel", False, "No funnel ID provided")
            return False
            
        response, success = self.make_request("DELETE", f"/api/funnels/{funnel_id}")
        
        if not success or not response:
            self.log_test("Delete Funnel", False, "Request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Delete Funnel", False, f"Status code: {response.status_code}")
            return False
            
        try:
            data = response.json()
            if data.get("success"):
                self.log_test("Delete Funnel", True, f"Funnel {funnel_id} deleted successfully")
                return True
            else:
                self.log_test("Delete Funnel", False, f"Unexpected response: {data}")
                return False
        except Exception as e:
            self.log_test("Delete Funnel", False, f"JSON parse error: {str(e)}")
            return False

    def test_thread_generation_with_content_validation(self):
        """Test complete thread generation flow with content validation"""
        print("\n🧵 Testing Thread Generation with OpenAI Integration...")
        
        # Step 1: Generate thread with specific test parameters
        test_data = {
            "topic": "The future of AI in 2025",
            "style": "educational",
            "thread_length": 5,
            "platform": "twitter"
        }
        
        response, success = self.make_request("POST", "/api/generate-thread", test_data)
        
        if not success or not response:
            self.log_test("Thread Generation Flow", False, "Initial request failed")
            return False
            
        if response.status_code != 200:
            self.log_test("Thread Generation Flow", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False
            
        try:
            data = response.json()
            if not ("thread_id" in data and data.get("success")):
                self.log_test("Thread Generation Flow", False, f"Unexpected response: {data}")
                return False
                
            thread_id = data["thread_id"]
            self.log_test("Thread Generation Started", True, f"Thread ID: {thread_id}")
            
            # Step 2: Monitor thread generation progress
            max_attempts = 30  # Wait up to 30 seconds
            for attempt in range(max_attempts):
                time.sleep(1)  # Wait 1 second between checks
                
                status_response, status_success = self.make_request("GET", f"/api/thread-status/{thread_id}")
                
                if not status_success or not status_response or status_response.status_code != 200:
                    continue
                    
                try:
                    status_data = status_response.json()
                    current_status = status_data.get("status", "unknown")
                    
                    print(f"   Attempt {attempt + 1}: Status = {current_status}")
                    
                    if current_status == "completed":
                        # Step 3: Validate thread content
                        content = status_data.get("content")
                        if content:
                            # Parse content to check if it's actual AI-generated content
                            if isinstance(content, dict) and "tweets" in content:
                                tweets = content["tweets"]
                                if len(tweets) >= 3:  # Should have at least 3 tweets
                                    # Check if tweets contain actual content (not just placeholders)
                                    first_tweet = tweets[0].get("content", "")
                                    if len(first_tweet) > 20 and "AI" in first_tweet and "2025" in first_tweet:
                                        self.log_test("Thread Content Validation", True, f"Generated {len(tweets)} tweets with relevant AI content")
                                        self.log_test("Thread Generation Flow", True, f"Complete flow successful - Generated actual AI content about '{test_data['topic']}'")
                                        return True
                                    else:
                                        self.log_test("Thread Content Validation", False, f"Content seems generic or placeholder: {first_tweet[:100]}...")
                                else:
                                    self.log_test("Thread Content Validation", False, f"Expected at least 3 tweets, got {len(tweets)}")
                            else:
                                self.log_test("Thread Content Validation", False, f"Content format unexpected: {type(content)}")
                        else:
                            self.log_test("Thread Content Validation", False, "No content found in completed thread")
                        
                        self.log_test("Thread Generation Flow", False, "Thread completed but content validation failed")
                        return False
                        
                    elif current_status == "failed":
                        error_msg = status_data.get("error", "Unknown error")
                        self.log_test("Thread Generation Flow", False, f"Thread generation failed: {error_msg}")
                        return False
                        
                except Exception as e:
                    print(f"   Error parsing status response: {str(e)}")
                    continue
            
            # If we get here, thread generation timed out
            self.log_test("Thread Generation Flow", False, f"Thread generation timed out after {max_attempts} seconds")
            return False
            
        except Exception as e:
            self.log_test("Thread Generation Flow", False, f"JSON parse error: {str(e)}")
            return False

    def test_data_validation(self):
        """Test data validation and error handling"""
        print("\n🔍 Testing Data Validation and Error Handling...")
        
        # Test invalid slideshow data
        invalid_slideshow = {
            "title": "",  # Empty title
            "theme": "invalid_theme",  # Invalid theme
            "duration": 45  # Invalid duration
        }
        
        try:
            url = f"{self.base_url}/api/generate-slideshow"
            response = requests.post(url, json=invalid_slideshow, timeout=10)
            if response.status_code == 400:
                try:
                    error_data = response.json()
                    self.log_test("Slideshow Validation", True, f"Properly rejected invalid data: {error_data.get('error', 'Unknown error')}")
                except:
                    self.log_test("Slideshow Validation", True, "Properly rejected invalid slideshow data")
            else:
                self.log_test("Slideshow Validation", False, f"Expected 400 status, got {response.status_code}")
        except Exception as e:
            self.log_test("Slideshow Validation", False, f"Request failed: {str(e)}")
        
        # Test invalid thread data
        invalid_thread = {
            "topic": "",  # Empty topic
            "style": "invalid_style",  # Invalid style
            "thread_length": 25,  # Invalid length
            "platform": "invalid_platform"  # Invalid platform
        }
        
        try:
            url = f"{self.base_url}/api/generate-thread"
            response = requests.post(url, json=invalid_thread, timeout=10)
            if response.status_code == 400:
                try:
                    error_data = response.json()
                    self.log_test("Thread Validation", True, f"Properly rejected invalid data: {error_data.get('error', 'Unknown error')}")
                except:
                    self.log_test("Thread Validation", True, "Properly rejected invalid thread data")
            else:
                self.log_test("Thread Validation", False, f"Expected 400 status, got {response.status_code}")
        except Exception as e:
            self.log_test("Thread Validation", False, f"Request failed: {str(e)}")
        
        # Test invalid funnel data
        invalid_funnel = {
            "name": ""  # Empty name
        }
        
        try:
            url = f"{self.base_url}/api/funnels"
            response = requests.post(url, json=invalid_funnel, timeout=10)
            if response.status_code == 400:
                try:
                    error_data = response.json()
                    self.log_test("Funnel Validation", True, f"Properly rejected invalid data: {error_data.get('error', 'Unknown error')}")
                except:
                    self.log_test("Funnel Validation", True, "Properly rejected invalid funnel data")
            else:
                self.log_test("Funnel Validation", False, f"Expected 400 status, got {response.status_code}")
        except Exception as e:
            self.log_test("Funnel Validation", False, f"Request failed: {str(e)}")

    def run_comprehensive_tests(self):
        """Run all comprehensive tests for Supabase migration"""
        print("🚀 Starting Comprehensive Backend Testing for Supabase Migration")
        print("=" * 70)
        
        # Test 1: Health Check
        print("\n🏥 Testing Health Check...")
        self.test_health_check()
        
        # Test 2: Videos/Slideshow Generation
        print("\n🎬 Testing Videos/Slideshow Generation...")
        self.test_videos_list()
        video_id = self.test_generate_slideshow()
        if video_id:
            time.sleep(1)  # Brief pause
            self.test_video_status(video_id)
        
        # Test 3: Thread Maker with OpenAI Integration
        print("\n🧵 Testing Thread Maker...")
        self.test_threads_list()
        
        # Run comprehensive thread generation test
        self.test_thread_generation_with_content_validation()
        
        # Also run basic thread tests
        thread_id = self.test_generate_thread()
        if thread_id:
            time.sleep(1)  # Brief pause
            self.test_thread_status(thread_id)
            # Test delete thread
            self.test_delete_thread(thread_id)
        
        # Test 4: Funnel Builder
        print("\n🔧 Testing Funnel Builder...")
        self.test_funnels_list()
        funnel_id = self.test_create_funnel()
        if funnel_id:
            time.sleep(1)  # Brief pause
            self.test_get_funnel(funnel_id)
            self.test_update_funnel(funnel_id)
            self.test_delete_funnel(funnel_id)
        
        # Test 5: Data Validation
        self.test_data_validation()
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['details']}")
        
        print("\n🎯 MIGRATION STATUS:")
        if failed_tests == 0:
            print("✅ Supabase migration SUCCESSFUL - All endpoints working correctly!")
        elif failed_tests <= 2:
            print("⚠️  Supabase migration mostly successful with minor issues")
        else:
            print("❌ Supabase migration has significant issues requiring attention")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = BackendTester(BACKEND_URL)
    success = tester.run_comprehensive_tests()
    exit(0 if success else 1)