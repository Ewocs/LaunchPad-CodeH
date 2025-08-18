const express = require('express');
const { body, validationResult } = require('express-validator');
const googleAuthService = require('../services/googleAuth');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get Google OAuth URL
router.get('/google/url', (req, res) => {
  try {
    const authUrl = googleAuthService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ message: 'Failed to generate authentication URL' });
  }
});

// Get Google re-authorization URL (clears old tokens and forces new consent)
router.get('/google/reauth-url', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Clear old tokens to force fresh OAuth
    await googleAuthService.clearUserTokens(userId);
    
    const authUrl = googleAuthService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating reauth URL:', error);
    res.status(500).json({ message: 'Failed to generate re-authorization URL' });
  }
});

// Handle Google OAuth callback (GET request from Google)
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=${error}`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_code`);
    }

    // Exchange code for tokens
    const tokens = await googleAuthService.getTokens(code);
    
    // Get user info from Google
    const userInfo = await googleAuthService.getUserInfo(tokens.access_token);
    
    // Create or update user in database
    const user = await googleAuthService.createOrUpdateUser(userInfo, tokens);
    
    // Generate JWT token
    const jwtToken = googleAuthService.generateJWT(user._id);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login/callback?token=${jwtToken}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture
    }))}`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
  }
});

// Handle Google OAuth callback (POST request for API)
router.post('/google/callback', [
  body('code').notEmpty().withMessage('Authorization code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code } = req.body;

    // Exchange code for tokens
    const tokens = await googleAuthService.getTokens(code);
    
    // Get user info from Google
    const userInfo = await googleAuthService.getUserInfo(tokens.access_token);
    
    // Create or update user in database
    const user = await googleAuthService.createOrUpdateUser(userInfo, tokens);
    
    // Generate JWT token
    const jwtToken = googleAuthService.generateJWT(user._id);
    
    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(400).json({ 
      message: error.message || 'Authentication failed'
    });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture,
        preferences: req.user.preferences,
        lastEmailScan: req.user.lastEmailScan
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update user preferences
router.patch('/preferences', [
  authMiddleware,
  body('scanFrequency').optional().isIn(['daily', 'weekly', 'monthly', 'manual']),
  body('emailCategories').optional().isArray(),
  body('notifications').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { scanFrequency, emailCategories, notifications } = req.body;
    
    const user = req.user;
    
    if (scanFrequency) user.preferences.scanFrequency = scanFrequency;
    if (emailCategories) user.preferences.emailCategories = emailCategories;
    if (notifications !== undefined) user.preferences.notifications = notifications;
    
    await user.save();
    
    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

// Logout (invalidate token on client side)
router.post('/logout', authMiddleware, (req, res) => {
  try {
    // In a more complex setup, you might want to maintain a blacklist of tokens
    // For now, we'll rely on the client to remove the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Revoke Gmail access only (keep account but clear Gmail tokens)
router.post('/revoke-gmail', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log(`🔄 Revoking Gmail access for user: ${req.user.email}`);
    
    // Revoke OAuth tokens from Google
    const revokeResult = await googleAuthService.revokeAllUserTokens(userId);
    
    res.json({ 
      message: 'Gmail access revoked successfully. You can re-authenticate anytime to restore access.',
      revokeResult
    });
  } catch (error) {
    console.error('Gmail revoke error:', error);
    res.status(500).json({ message: 'Failed to revoke Gmail access' });
  }
});

// Revoke access (revoke OAuth tokens and delete user account and data)
router.delete('/revoke', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log(`🔄 Starting revoke process for user: ${req.user.email}`);
    
    // Step 1: Revoke OAuth tokens from Google
    try {
      const revokeResult = await googleAuthService.revokeAllUserTokens(userId);
      console.log('Token revocation result:', revokeResult);
    } catch (tokenError) {
      console.error('Token revocation failed, but continuing with data cleanup:', tokenError);
      // Continue with cleanup even if token revocation fails
    }
    
    // Step 2: Delete user's subscriptions
    const Subscription = require('../models/Subscription');
    const deletedSubs = await Subscription.deleteMany({ userId });
    console.log(`🗑️ Deleted ${deletedSubs.deletedCount} subscriptions`);
    
    // Step 3: Delete user's emails
    const Email = require('../models/Email');
    const deletedEmails = await Email.deleteMany({ userId });
    console.log(`🗑️ Deleted ${deletedEmails.deletedCount} emails`);
    
    // Step 4: Delete user account
    await req.user.deleteOne();
    console.log(`🗑️ Deleted user account: ${req.user.email}`);
    
    console.log('✅ Complete revoke process finished');
    
    res.json({ 
      message: 'Access revoked successfully. Your account and all data have been deleted.',
      deletedData: {
        subscriptions: deletedSubs.deletedCount,
        emails: deletedEmails.deletedCount
      }
    });
  } catch (error) {
    console.error('Revoke error:', error);
    res.status(500).json({ message: 'Failed to revoke access completely' });
  }
});

module.exports = router;
