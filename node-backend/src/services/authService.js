const { supabase } = require('../config/database');

class AuthService {
  async register(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
        message: 'Registration successful. Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  async logout(accessToken) {
    try {
      const { error } = await supabase.auth.signOut(accessToken);
      if (error) throw error;
      
      return { message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  async getProfile(accessToken) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (error) throw error;

      return { user };
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error(error.message || 'Failed to get profile');
    }
  }

  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
      });

      if (error) throw error;

      return { message: 'Password reset email sent' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Password reset failed');
    }
  }

  async updatePassword(accessToken, newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Password update failed');
    }
  }

  // Middleware to verify JWT token
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Token verification failed' });
    }
  }
}

module.exports = new AuthService();