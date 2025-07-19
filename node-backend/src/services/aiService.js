/**
 * AI Service - Pure Node.js Implementation
 * Replaces Python subprocess calls with direct OpenAI API integration
 */

const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

class AIService {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OPENAI_API_KEY not found in environment variables');
      this.openai = null;
    } else if (!apiKey.startsWith('sk-')) {
      console.warn('⚠️ OPENAI_API_KEY format appears invalid - should start with sk-');
      this.openai = null;
    } else {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey.trim(), // Trim any whitespace
        });
        console.log('✅ OpenAI client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI client:', error.message);
        this.openai = null;
      }
    }
  }

  /**
   * Generate social media thread using OpenAI GPT-4
   */
  async generateThread(topic, style = 'engaging', threadLength = 5, platform = 'twitter') {
    try {
      if (!this.openai) {
        console.warn('⚠️ OpenAI not available, using fallback content generation');
        return this._generateFallbackThread(topic, style, threadLength, platform);
      }

      const systemMessage = this._getThreadSystemMessage(style, threadLength, platform);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `Create a ${threadLength}-post thread about: ${topic}` }
        ],
        max_tokens: 4096,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      const tweets = this._parseThreadResponse(response, threadLength);

      return {
        success: true,
        topic,
        style,
        platform,
        thread_length: tweets.length,
        tweets,
        generated_at: new Date().toISOString(),
        session_id: `thread_${uuidv4().substring(0, 8)}`,
        source: 'openai'
      };
    } catch (error) {
      console.error('AI Service - Thread generation error:', error);
      console.warn('⚠️ OpenAI failed, using fallback content generation');
      return this._generateFallbackThread(topic, style, threadLength, platform);
    }
  }

  /**
   * Enhance slideshow content using OpenAI GPT-4
   */
  async enhanceSlideshowContent(title, text = '', theme = 'minimal', duration = 30) {
    try {
      const systemMessage = this._getSlideshowSystemMessage(theme, duration);
      
      let userInput = `Title: ${title}`;
      if (text && text.trim()) {
        userInput += `\nExisting content: ${text}`;
      }
      userInput += `\nTheme: ${theme}\nDuration: ${duration} seconds`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userInput }
        ],
        max_tokens: 2048,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      const enhancedContent = this._parseSlideshowResponse(response, duration);

      return {
        success: true,
        title,
        theme,
        duration,
        enhanced_text: enhancedContent.text,
        slides: enhancedContent.slides,
        generated_at: new Date().toISOString(),
        session_id: `slideshow_${uuidv4().substring(0, 8)}`
      };
    } catch (error) {
      console.error('AI Service - Slideshow enhancement error:', error);
      return {
        success: false,
        error: error.message,
        title,
        generated_at: new Date().toISOString()
      };
    }
  }

  /**
   * System message for thread generation
   */
  _getThreadSystemMessage(style, threadLength, platform) {
    const platformSpecs = {
      twitter: {
        charLimit: 280,
        features: "hashtags, @mentions, emojis",
        format: "numbered tweets (1/n format)"
      },
      linkedin: {
        charLimit: 3000,
        features: "professional tone, industry insights",
        format: "professional bullet points"
      },
      instagram: {
        charLimit: 2200,
        features: "hashtags, emojis, visual storytelling",
        format: "engaging captions with line breaks"
      }
    };

    const styleGuides = {
      engaging: "Use conversational tone, ask questions, include calls-to-action",
      educational: "Focus on teaching, provide valuable insights, use clear explanations",
      storytelling: "Use narrative structure, personal anecdotes, emotional connection",
      professional: "Maintain business tone, include industry expertise, cite sources when relevant",
      viral: "Use trending topics, controversial angles, emotional hooks, shareable content"
    };

    const spec = platformSpecs[platform] || platformSpecs.twitter;
    const styleGuide = styleGuides[style] || styleGuides.engaging;

    return `You are an expert social media content creator specializing in ${platform} threads.

PLATFORM: ${platform.charAt(0).toUpperCase() + platform.slice(1)}
STYLE: ${style.charAt(0).toUpperCase() + style.slice(1)}
THREAD LENGTH: ${threadLength} posts
CHARACTER LIMIT: ${spec.charLimit} per post
FEATURES: ${spec.features}

STYLE GUIDELINES: ${styleGuide}

FORMAT REQUIREMENTS:
- Create exactly ${threadLength} separate posts
- Each post must be under ${spec.charLimit} characters
- Number each post (1/${threadLength}, 2/${threadLength}, etc.)
- Use engaging hooks in the first post
- End with a strong call-to-action in the last post
- Include relevant emojis and formatting
- Make each post valuable on its own while maintaining thread flow

OUTPUT FORMAT:
Return each tweet/post on a new line with the format:
[POST_NUMBER] Post content here...

Example:
[1/${threadLength}] 🧵 Here's why [topic] is changing everything...
[2/${threadLength}] First key point with explanation...
[3/${threadLength}] Second insight that builds on the first...
[${threadLength}/${threadLength}] Call to action or conclusion with question for engagement...`;
  }

  /**
   * System message for slideshow enhancement
   */
  _getSlideshowSystemMessage(theme, duration) {
    const themeStyles = {
      minimal: "Clean, simple, focused on key messages with minimal visual distractions",
      corporate: "Professional, business-oriented, data-driven with corporate aesthetics",
      storytelling: "Narrative-driven, emotional connection, journey-based structure",
      modern: "Contemporary, trendy, tech-savvy with modern design elements",
      creative: "Artistic, innovative, out-of-the-box thinking with creative flair",
      professional: "Polished, expert-level, industry-focused with authoritative tone",
      elegant: "Sophisticated, refined, premium feel with elegant presentation",
      cinematic: "Dramatic, movie-like, high-impact with cinematic storytelling"
    };

    const styleGuide = themeStyles[theme] || themeStyles.minimal;
    const slidesCount = Math.max(3, Math.min(8, Math.floor(duration / 5))); // 3-8 slides based on duration

    return `You are an expert content creator specializing in creating engaging slideshow presentations.

THEME: ${theme.charAt(0).toUpperCase() + theme.slice(1)}
STYLE: ${styleGuide}
DURATION: ${duration} seconds
TARGET SLIDES: ${slidesCount} slides

Your task is to enhance and structure content for a compelling slideshow presentation.

CONTENT REQUIREMENTS:
- Create engaging, concise content that fits the theme
- Structure information into ${slidesCount} distinct slides
- Each slide should have a clear focus and message
- Use compelling headlines and supporting text
- Include relevant emojis and formatting where appropriate
- Ensure content flows logically from slide to slide
- Make it suitable for ${duration}-second presentation

OUTPUT FORMAT:
Return the content in this exact structure:

ENHANCED_TEXT: [Provide a comprehensive, enhanced version of the content that incorporates all key points]

SLIDE_STRUCTURE:
[SLIDE_1] Compelling headline for slide 1
Supporting text for slide 1 with key points and engaging elements

[SLIDE_2] Compelling headline for slide 2  
Supporting text for slide 2 with key points and engaging elements

[Continue for all ${slidesCount} slides...]

Make each slide impactful, visually descriptive, and aligned with the ${theme} theme.`;
  }

  /**
   * Fallback thread generation when OpenAI is not available
   */
  _generateFallbackThread(topic, style, threadLength, platform) {
    const templates = {
      engaging: [
        `🧵 Let's talk about ${topic} - here's what you need to know:`,
        `🔥 Here's an interesting take on ${topic}:`,
        `💡 Key insights about ${topic}:`,
        `🚀 Ready to explore ${topic}? Let's dive in:`,
        `What are your thoughts on this?`
      ],
      educational: [
        `📚 Understanding ${topic}: A comprehensive guide`,
        `🎓 Let me break down ${topic} for you:`,
        `📖 Here are the essential facts about ${topic}:`,
        `🧠 Knowledge is power - let's learn about ${topic}:`,
        `What would you like to know more about?`
      ],
      professional: [
        `📊 Industry analysis: ${topic}`,
        `🏢 Professional insights on ${topic}:`,
        `📈 Market perspective on ${topic}:`,
        `💼 Business implications of ${topic}:`,
        `Share your professional experience with this topic.`
      ]
    };

    const styleTemplates = templates[style] || templates.engaging;
    const tweets = [];

    for (let i = 0; i < threadLength; i++) {
      const isFirst = i === 0;
      const isLast = i === threadLength - 1;
      
      let content;
      if (isFirst) {
        content = styleTemplates[0] || `Thread about ${topic} (${i + 1}/${threadLength})`;
      } else if (isLast) {
        content = styleTemplates[styleTemplates.length - 1] || `Thanks for reading this thread about ${topic}! (${i + 1}/${threadLength})`;
      } else {
        content = styleTemplates[Math.min(i, styleTemplates.length - 2)] || `Point ${i} about ${topic} (${i + 1}/${threadLength})`;
      }

      tweets.push({
        post_number: i + 1,
        content: content,
        character_count: content.length,
        word_count: content.split(' ').length
      });
    }

    return {
      success: true,
      topic,
      style,
      platform,
      thread_length: tweets.length,
      tweets,
      generated_at: new Date().toISOString(),
      session_id: `fallback_${uuidv4().substring(0, 8)}`,
      source: 'fallback',
      note: 'Generated using fallback templates - AI service not available'
    };
  }

  /**
   * Parse thread response into structured tweets
   */
  _parseThreadResponse(response, expectedLength) {
    const tweets = [];
    const lines = response.trim().split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Look for numbered posts [1/n], [2/n], etc.
      if (trimmedLine.startsWith('[') && trimmedLine.includes(']')) {
        try {
          const bracketEnd = trimmedLine.indexOf(']');
          const postInfo = trimmedLine.substring(1, bracketEnd);
          const content = trimmedLine.substring(bracketEnd + 1).trim();

          // Parse post number (e.g., "1/5" -> post_number=1, total=5)
          let postNumber;
          if (postInfo.includes('/')) {
            [postNumber] = postInfo.split('/');
            postNumber = parseInt(postNumber);
          } else {
            postNumber = tweets.length + 1;
          }

          tweets.push({
            post_number: postNumber,
            content: content,
            character_count: content.length,
            word_count: content.split(' ').length
          });
        } catch (error) {
          // If parsing fails, treat as regular content
          if (trimmedLine) {
            tweets.push({
              post_number: tweets.length + 1,
              content: trimmedLine,
              character_count: trimmedLine.length,
              word_count: trimmedLine.split(' ').length
            });
          }
        }
      }
    }

    // Fallback if no tweets were parsed
    if (tweets.length === 0) {
      tweets.push({
        post_number: 1,
        content: response.substring(0, 280),
        character_count: Math.min(response.length, 280),
        word_count: response.substring(0, 280).split(' ').length
      });
    }

    return tweets;
  }

  /**
   * Parse slideshow response into structured content
   */
  _parseSlideshowResponse(response, duration) {
    const slides = [];
    let enhancedText = "";
    
    const lines = response.trim().split('\n');
    let currentSlide = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Look for enhanced text section
      if (trimmedLine.startsWith('ENHANCED_TEXT:')) {
        enhancedText = trimmedLine.replace('ENHANCED_TEXT:', '').trim();
        continue;
      }
      
      // Look for slide markers [SLIDE_X]
      if (trimmedLine.startsWith('[SLIDE_') && trimmedLine.includes(']')) {
        if (currentSlide) {
          slides.push(currentSlide);
        }
        
        try {
          const bracketEnd = trimmedLine.indexOf(']');
          const slideInfo = trimmedLine.substring(1, bracketEnd);
          const headline = trimmedLine.substring(bracketEnd + 1).trim();
          
          const slideNumber = parseInt(slideInfo.replace('SLIDE_', ''));
          const slidesCount = Math.max(3, Math.min(8, Math.floor(duration / 5)));
          
          currentSlide = {
            slide_number: slideNumber,
            headline: headline,
            content: "",
            duration: Math.floor(duration / slidesCount)
          };
        } catch (error) {
          continue;
        }
      } else if (currentSlide && trimmedLine) {
        // Add content to current slide
        if (currentSlide.content) {
          currentSlide.content += " " + trimmedLine;
        } else {
          currentSlide.content = trimmedLine;
        }
      }
    }
    
    // Add the last slide
    if (currentSlide) {
      slides.push(currentSlide);
    }
    
    // If no enhanced text was found, create one from slides
    if (!enhancedText && slides.length > 0) {
      enhancedText = slides.map(slide => `${slide.headline}. ${slide.content}`).join(' ');
    }
    
    // Fallback if no slides were parsed
    if (slides.length === 0) {
      slides.push({
        slide_number: 1,
        headline: "Enhanced Content",
        content: enhancedText || response.substring(0, 200),
        duration: duration
      });
    }
    
    return {
      text: enhancedText,
      slides: slides
    };
  }

  /**
   * Health check for AI service
   */
  async healthCheck() {
    try {
      if (!this.openai) {
        return {
          status: 'unhealthy',
          error: 'OpenAI client not initialized - check API key configuration',
          timestamp: new Date().toISOString(),
          connection: 'not_configured'
        };
      }

      // Test OpenAI connection with a simple completion
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Health check" }],
        max_tokens: 10,
      });
      
      return {
        status: 'healthy',
        model: 'gpt-4o',
        timestamp: new Date().toISOString(),
        connection: 'connected'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        connection: 'failed'
      };
    }
  }
}

module.exports = new AIService();