const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { validateAuthData } = require('../middleware/validation');

// Register new user
router.post('/auth/register', validateAuthData, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/auth/login', validateAuthData, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Logout user
router.post('/auth/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    const result = await authService.logout(token);
    res.json(result);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user profile
router.get('/auth/profile', authService.verifyToken, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Reset password
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await authService.resetPassword(email);
    res.json(result);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update password
router.put('/auth/update-password', authService.verifyToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    const result = await authService.updatePassword(token, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;