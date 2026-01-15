const express = require('express');
const { body, validationResult } = require('express-validator');

const googleAuthService = require('../services/googleAuth');
const { authMiddleware } = require('../middleware/auth');
const { 
  authStrictLimiter, 
  authModerateLimiter, 
  loginAttemptTracker, 
  wrapAuthResponse 
} = require('../middleware/rateLimiter');
const securityLogger = require('../services/securityLogger');

const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../errors/AppError');

// Get Google OAuth URL - Apply strict rate limiting to prevent abuse
router.get('/google/url', authStrictLimiter, loginAttemptTracker, wrapAuthResponse(async (req, res) => {
  try {
    const authUrl = googleAuthService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ message: 'Failed to generate authentication URL' });
  }
}));

// Get Google re-authorization URL (clears old tokens and forces new consent)
router.get('/google/reauth-url', authMiddleware, authModerateLimiter, async (req, res) => {
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

// Handle Google OAuth callback (GET request from Google) - Critical endpoint with strict rate limiting
router.get('/google/callback', authStrictLimiter, loginAttemptTracker, wrapAuthResponse(async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  try {
    const { code, error } = req.query;

    if (error) {
      securityLogger.logOAuthCallback(null, ip, false, error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=${error}`);
    }

    if (!code) {
      securityLogger.logOAuthCallback(null, ip, false, 'No authorization code');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_code`);
    }

    const tokens = await googleAuthService.getTokens(code);
    const userInfo = await googleAuthService.getUserInfo(tokens.access_token);
    const user = await googleAuthService.createOrUpdateUser(userInfo, tokens);

    const jwtToken = googleAuthService.generateJWT(user._id);

    res.redirect(
      `${frontendUrl}/login/callback?token=${jwtToken}&user=${encodeURIComponent(
        JSON.stringify({
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        })
      )}`
    );
  })
);

/**
 * @route   POST /api/auth/google/callback
 * @access  Public API
 */
router.post(
  '/google/callback',
  body('code').notEmpty(),
  asyncHandler(async (req, res) => {
    handleValidation(req);

    const tokens = await googleAuthService.getTokens(req.body.code);
    const userInfo = await googleAuthService.getUserInfo(tokens.access_token);
    const user = await googleAuthService.createOrUpdateUser(userInfo, tokens);

    const jwtToken = googleAuthService.generateJWT(user._id);
    
    // Log successful authentication
    securityLogger.logOAuthCallback(user.email, ip, true);
    securityLogger.logAuthSuccess(user._id, user.email, ip, 'oauth');
    
    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  })
);

/* =====================================================
   EMAIL / PASSWORD AUTH (CSRF PROTECTED)
    });
  }
}));

/* =====================================================
   AUTHENTICATED USER ACTIONS (CSRF PROTECTED)
  })
);

router.patch(
  '/preferences',
  authMiddleware,
  requireCsrf,
  asyncHandler(async (req, res) => {
    Object.assign(req.user.preferences, req.body);
    await req.user.save();

    res.status(200).json({
      message: 'Preferences updated successfully',
      preferences: req.user.preferences,
    });
  })
);

router.post(
  '/logout',
  authMiddleware,
  requireCsrf,
  asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
  })
);

router.delete(
  '/revoke',
  authMiddleware,
  requireCsrf,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await googleAuthService.revokeAllUserTokens(userId).catch(() => {});
    await User.deleteOne({ _id: userId });

    res.status(200).json({ message: 'Account deleted successfully' });
  })
);

module.exports = router;
