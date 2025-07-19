// Validation middleware for API endpoints

const validateSlideshowData = (req, res, next) => {
  const { title, theme, duration } = req.body;

  // Validate required fields
  if (!title || !theme || !duration) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, theme, duration' 
    });
  }

  // Validate duration
  if (![15, 30, 60].includes(duration)) {
    return res.status(400).json({ 
      error: 'Duration must be 15, 30, or 60 seconds' 
    });
  }

  // Validate theme
  const validThemes = [
    'minimal', 'corporate', 'storytelling', 'modern', 
    'creative', 'professional', 'elegant', 'cinematic'
  ];
  
  if (!validThemes.includes(theme)) {
    return res.status(400).json({ 
      error: `Invalid theme. Must be one of: ${validThemes.join(', ')}` 
    });
  }

  next();
};

const validateThreadData = (req, res, next) => {
  const { topic, style, thread_length, platform } = req.body;

  // Validate required fields
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  // Validate style
  const validStyles = ['engaging', 'educational', 'storytelling', 'professional', 'viral'];
  if (style && !validStyles.includes(style)) {
    return res.status(400).json({ 
      error: `Invalid style. Must be one of: ${validStyles.join(', ')}` 
    });
  }

  // Validate thread length
  if (thread_length && (thread_length < 1 || thread_length > 20)) {
    return res.status(400).json({ 
      error: 'Thread length must be between 1 and 20' 
    });
  }

  // Validate platform
  const validPlatforms = ['twitter', 'linkedin', 'instagram'];
  if (platform && !validPlatforms.includes(platform)) {
    return res.status(400).json({ 
      error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` 
    });
  }

  next();
};

const validateAuthData = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }

  next();
};

module.exports = {
  validateSlideshowData,
  validateThreadData,
  validateAuthData
};