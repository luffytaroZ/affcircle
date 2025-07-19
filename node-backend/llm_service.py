#!/usr/bin/env python3
"""
LLM Service for Thread Maker
Handles GPT-4 integration for generating social media threads
"""

import asyncio
import json
import os
import sys
from typing import Dict, List, Optional
from datetime import datetime
import uuid

from emergentintegrations.llm.chat import LlmChat, UserMessage


class SlideshowEnhancerService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    async def enhance_slideshow_content(self, 
                                      title: str, 
                                      text: str = "", 
                                      theme: str = "minimal", 
                                      duration: int = 30) -> Dict:
        """
        Enhance slideshow content using AI to create engaging, structured content
        """
        try:
            # Create unique session ID for this slideshow enhancement
            session_id = f"slideshow_enhancer_{uuid.uuid4().hex[:8]}"
            
            # Initialize chat with system message
            system_message = self._get_slideshow_system_message(theme, duration)
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", "gpt-4o").with_max_tokens(2048)
            
            # Create user message with title and existing text
            user_input = f"Title: {title}"
            if text and text.strip():
                user_input += f"\nExisting content: {text}"
            user_input += f"\nTheme: {theme}\nDuration: {duration} seconds"
            
            user_message = UserMessage(text=user_input)
            
            # Generate response
            response = await chat.send_message(user_message)
            
            # Parse the response into structured slideshow content
            enhanced_content = self._parse_slideshow_response(response, duration)
            
            return {
                "success": True,
                "title": title,
                "theme": theme,
                "duration": duration,
                "enhanced_text": enhanced_content["text"],
                "slides": enhanced_content["slides"],
                "generated_at": datetime.utcnow().isoformat(),
                "session_id": session_id
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "title": title,
                "generated_at": datetime.utcnow().isoformat()
            }
    
    def _get_slideshow_system_message(self, theme: str, duration: int) -> str:
        """Get system message based on theme and duration"""
        
        theme_styles = {
            "minimal": "Clean, simple, focused on key messages with minimal visual distractions",
            "corporate": "Professional, business-oriented, data-driven with corporate aesthetics",
            "storytelling": "Narrative-driven, emotional connection, journey-based structure",
            "modern": "Contemporary, trendy, tech-savvy with modern design elements",
            "creative": "Artistic, innovative, out-of-the-box thinking with creative flair",
            "professional": "Polished, expert-level, industry-focused with authoritative tone",
            "elegant": "Sophisticated, refined, premium feel with elegant presentation",
            "cinematic": "Dramatic, movie-like, high-impact with cinematic storytelling"
        }
        
        style_guide = theme_styles.get(theme, theme_styles["minimal"])
        slides_count = max(3, min(8, duration // 5))  # 3-8 slides based on duration
        
        return f"""You are an expert content creator specializing in creating engaging slideshow presentations.

THEME: {theme.capitalize()}
STYLE: {style_guide}
DURATION: {duration} seconds
TARGET SLIDES: {slides_count} slides

Your task is to enhance and structure content for a compelling slideshow presentation.

CONTENT REQUIREMENTS:
- Create engaging, concise content that fits the theme
- Structure information into {slides_count} distinct slides
- Each slide should have a clear focus and message
- Use compelling headlines and supporting text
- Include relevant emojis and formatting where appropriate
- Ensure content flows logically from slide to slide
- Make it suitable for {duration}-second presentation

OUTPUT FORMAT:
Return the content in this exact structure:

ENHANCED_TEXT: [Provide a comprehensive, enhanced version of the content that incorporates all key points]

SLIDE_STRUCTURE:
[SLIDE_1] Compelling headline for slide 1
Supporting text for slide 1 with key points and engaging elements

[SLIDE_2] Compelling headline for slide 2  
Supporting text for slide 2 with key points and engaging elements

[Continue for all {slides_count} slides...]

Make each slide impactful, visually descriptive, and aligned with the {theme} theme."""

    def _parse_slideshow_response(self, response: str, duration: int) -> Dict:
        """Parse the LLM response into structured slideshow content"""
        slides = []
        enhanced_text = ""
        
        lines = response.strip().split('\n')
        current_slide = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Look for enhanced text section
            if line.startswith('ENHANCED_TEXT:'):
                enhanced_text = line.replace('ENHANCED_TEXT:', '').strip()
                continue
            
            # Look for slide markers [SLIDE_X]
            if line.startswith('[SLIDE_') and ']' in line:
                if current_slide:
                    slides.append(current_slide)
                
                # Extract slide number and headline
                try:
                    bracket_end = line.index(']')
                    slide_info = line[1:bracket_end]
                    headline = line[bracket_end + 1:].strip()
                    
                    slide_number = int(slide_info.replace('SLIDE_', ''))
                    
                    current_slide = {
                        "slide_number": slide_number,
                        "headline": headline,
                        "content": "",
                        "duration": duration // max(3, min(8, duration // 5))  # Distribute duration evenly
                    }
                except (ValueError, IndexError):
                    continue
            elif current_slide and line:
                # Add content to current slide
                if current_slide["content"]:
                    current_slide["content"] += " " + line
                else:
                    current_slide["content"] = line
        
        # Add the last slide
        if current_slide:
            slides.append(current_slide)
        
        # If no enhanced text was found, create one from slides
        if not enhanced_text and slides:
            enhanced_text = " ".join([f"{slide['headline']}. {slide['content']}" for slide in slides])
        
        # Fallback if no slides were parsed
        if not slides:
            slides = [{
                "slide_number": 1,
                "headline": "Enhanced Content",
                "content": enhanced_text or response[:200],
                "duration": duration
            }]
        
        return {
            "text": enhanced_text,
            "slides": slides
        }


class ThreadMakerService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    async def generate_thread(self, 
                            topic: str, 
                            style: str = "engaging", 
                            thread_length: int = 5, 
                            platform: str = "twitter") -> Dict:
        """
        Generate a social media thread based on topic and style
        """
        try:
            # Create unique session ID for this thread generation
            session_id = f"thread_maker_{uuid.uuid4().hex[:8]}"
            
            # Initialize chat with system message
            system_message = self._get_system_message(style, thread_length, platform)
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", "gpt-4o").with_max_tokens(4096)
            
            # Create user message with topic
            user_message = UserMessage(
                text=f"Create a {thread_length}-tweet thread about: {topic}"
            )
            
            # Generate response
            response = await chat.send_message(user_message)
            
            # Parse the response into individual tweets
            tweets = self._parse_thread_response(response, thread_length)
            
            return {
                "success": True,
                "topic": topic,
                "style": style,
                "platform": platform,
                "thread_length": len(tweets),
                "tweets": tweets,
                "generated_at": datetime.utcnow().isoformat(),
                "session_id": session_id
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "topic": topic,
                "generated_at": datetime.utcnow().isoformat()
            }
    
    def _get_system_message(self, style: str, thread_length: int, platform: str) -> str:
        """Get system message based on style and platform"""
        
        platform_specs = {
            "twitter": {
                "char_limit": 280,
                "features": "hashtags, @mentions, emojis",
                "format": "numbered tweets (1/n format)"
            },
            "linkedin": {
                "char_limit": 3000,
                "features": "professional tone, industry insights",
                "format": "professional bullet points"
            },
            "instagram": {
                "char_limit": 2200,
                "features": "hashtags, emojis, visual storytelling",
                "format": "engaging captions with line breaks"
            }
        }
        
        style_guides = {
            "engaging": "Use conversational tone, ask questions, include calls-to-action",
            "educational": "Focus on teaching, provide valuable insights, use clear explanations",
            "storytelling": "Use narrative structure, personal anecdotes, emotional connection",
            "professional": "Maintain business tone, include industry expertise, cite sources when relevant",
            "viral": "Use trending topics, controversial angles, emotional hooks, shareable content"
        }
        
        spec = platform_specs.get(platform, platform_specs["twitter"])
        style_guide = style_guides.get(style, style_guides["engaging"])
        
        return f"""You are an expert social media content creator specializing in {platform} threads.

PLATFORM: {platform.capitalize()}
STYLE: {style.capitalize()}
THREAD LENGTH: {thread_length} posts
CHARACTER LIMIT: {spec['char_limit']} per post
FEATURES: {spec['features']}

STYLE GUIDELINES: {style_guide}

FORMAT REQUIREMENTS:
- Create exactly {thread_length} separate posts
- Each post must be under {spec['char_limit']} characters
- Number each post (1/{thread_length}, 2/{thread_length}, etc.)
- Use engaging hooks in the first post
- End with a strong call-to-action in the last post
- Include relevant emojis and formatting
- Make each post valuable on its own while maintaining thread flow

OUTPUT FORMAT:
Return each tweet/post on a new line with the format:
[POST_NUMBER] Post content here...

Example:
[1/5] 🧵 Here's why [topic] is changing everything...
[2/5] First key point with explanation...
[3/5] Second insight that builds on the first...
[4/5] Practical application or example...
[5/5] Call to action or conclusion with question for engagement...
"""

    def _parse_thread_response(self, response: str, expected_length: int) -> List[Dict]:
        """Parse the LLM response into individual tweets"""
        tweets = []
        lines = response.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Look for numbered posts [1/n], [2/n], etc.
            if line.startswith('[') and ']' in line:
                # Extract post number and content
                try:
                    bracket_end = line.index(']')
                    post_info = line[1:bracket_end]
                    content = line[bracket_end + 1:].strip()
                    
                    # Parse post number (e.g., "1/5" -> post_number=1, total=5)
                    if '/' in post_info:
                        post_num, total = post_info.split('/')
                        post_number = int(post_num)
                    else:
                        post_number = len(tweets) + 1
                        
                    tweets.append({
                        "post_number": post_number,
                        "content": content,
                        "character_count": len(content),
                        "word_count": len(content.split())
                    })
                except (ValueError, IndexError):
                    # If parsing fails, treat as regular content
                    if line:
                        tweets.append({
                            "post_number": len(tweets) + 1,
                            "content": line,
                            "character_count": len(line),
                            "word_count": len(line.split())
                        })
        
        # If we didn't get the expected number of tweets, split longer content
        if len(tweets) < expected_length and len(tweets) > 0:
            # Use what we got
            pass
        elif len(tweets) == 0:
            # Fallback: split the entire response
            tweets = [{
                "post_number": 1,
                "content": response[:280] if len(response) > 280 else response,
                "character_count": len(response[:280]),
                "word_count": len(response[:280].split())
            }]
        
        return tweets


async def main():
    """CLI interface for the LLM service"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        return
        
    command = sys.argv[1]
    
    if command == "generate_thread":
        if len(sys.argv) < 7:
            print(json.dumps({"error": "Missing parameters: api_key topic style thread_length platform"}))
            return
            
        api_key = sys.argv[2]
        topic = sys.argv[3] 
        style = sys.argv[4]
        thread_length = int(sys.argv[5])
        platform = sys.argv[6]
        
        service = ThreadMakerService(api_key)
        result = await service.generate_thread(topic, style, thread_length, platform)
        print(json.dumps(result))
        
    elif command == "enhance_slideshow":
        if len(sys.argv) < 6:
            print(json.dumps({"error": "Missing parameters: api_key title text theme duration"}))
            return
            
        api_key = sys.argv[2]
        title = sys.argv[3] 
        text = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] != "null" else ""
        theme = sys.argv[5] if len(sys.argv) > 5 else "minimal"
        duration = int(sys.argv[6]) if len(sys.argv) > 6 else 30
        
        service = SlideshowEnhancerService(api_key)
        result = await service.enhance_slideshow_content(title, text, theme, duration)
        print(json.dumps(result))
        
    elif command == "health":
        print(json.dumps({"status": "healthy", "timestamp": datetime.utcnow().isoformat()}))
        
    else:
        print(json.dumps({"error": f"Unknown command: {command}"}))


if __name__ == "__main__":
    asyncio.run(main())