const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios'); // Use axios for HTTP requests

class GoogleAuthService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Always show consent to ensure we get the latest scopes
    });
  }

  // Force reauth by clearing old tokens and generating new auth URL
  async clearUserTokens(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        $unset: {
          accessToken: 1,
          refreshToken: 1,
          tokenExpiry: 1
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing user tokens:', error);
      return false;
    }
  }

  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to get tokens from Google');
    }
  }

  async getUserInfo(accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();
      
      return data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to get user info from Google');
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  generateJWT(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async createOrUpdateUser(userInfo, tokens) {
    try {
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + (tokens.expiry_date ? tokens.expiry_date / 1000 : 3600));

      let user = await User.findOne({ googleId: userInfo.id });

      if (user) {
        // Update existing user
        user.email = userInfo.email;
        user.name = userInfo.name;
        user.picture = userInfo.picture;
        user.accessToken = tokens.access_token;
        user.refreshToken = tokens.refresh_token || user.refreshToken;
        user.tokenExpiry = expiryDate;
        user.isActive = true;
      } else {
        // Create new user
        user = new User({
          email: userInfo.email,
          name: userInfo.name,
          googleId: userInfo.id,
          picture: userInfo.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: expiryDate,
          isActive: true
        });
      }

      await user.save();
      return user;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw new Error('Failed to create or update user');
    }
  }

  async getValidAccessToken(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user || !user.refreshToken) {
        throw new Error('User not found or no refresh token');
      }

      console.log('🔑 Token check:', {
        hasAccessToken: !!user.accessToken,
        hasRefreshToken: !!user.refreshToken,
        tokenExpiry: user.tokenExpiry,
        isExpired: user.isTokenExpired(),
        accessTokenLength: user.accessToken?.length || 0
      });

      // Always refresh the token to ensure it's valid
      console.log('🔄 Refreshing access token...');
      const newTokens = await this.refreshAccessToken(user.refreshToken);
      
      user.accessToken = newTokens.access_token;
      if (newTokens.refresh_token) {
        user.refreshToken = newTokens.refresh_token;
      }
      
      // Set proper expiry date
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + (newTokens.expires_in || 3600));
      user.tokenExpiry = expiryDate;
      
      await user.save();
      
      console.log('✅ Token refreshed successfully');
      return user.accessToken;
    } catch (error) {
      console.error('Error getting valid access token:', error);
      
      // If token refresh fails due to invalid grant, clear tokens
      if (error.message?.includes('invalid_grant') || error.code === 'invalid_grant') {
        console.log('🔧 Invalid grant detected - clearing user tokens to force re-auth');
        await this.clearUserTokens(userId);
        throw new Error('GMAIL_REAUTH_REQUIRED');
      }
      
      throw new Error('Failed to get valid access token');
    }
  }

  // Revoke a specific OAuth token
  async revokeToken(token) {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/revoke', 
        `token=${encodeURIComponent(token)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('✅ Token revoked successfully');
      return true;
    } catch (error) {
      if (error.response?.status === 200) {
        // Google sometimes returns 200 even for successful revocations
        console.log('✅ Token revoked successfully (status 200)');
        return true;
      }
      
      console.error('❌ Token revocation failed:', error.response?.status, error.response?.statusText);
      return false;
    }
  }

  // Revoke all tokens for a user (both access and refresh tokens)
  async revokeAllUserTokens(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let revokedCount = 0;
      const results = {
        accessToken: false,
        refreshToken: false
      };

      // Revoke refresh token first (this should revoke all associated access tokens)
      if (user.refreshToken) {
        console.log('🔄 Revoking refresh token...');
        results.refreshToken = await this.revokeToken(user.refreshToken);
        if (results.refreshToken) revokedCount++;
      }

      // Also revoke access token if it exists (for completeness)
      if (user.accessToken) {
        console.log('🔄 Revoking access token...');
        results.accessToken = await this.revokeToken(user.accessToken);
        if (results.accessToken) revokedCount++;
      }

      // Clear tokens from database
      await this.clearUserTokens(userId);

      console.log(`✅ Revoked ${revokedCount} tokens for user ${user.email}`);
      return {
        success: true,
        revokedCount,
        results,
        message: 'All tokens revoked successfully'
      };

    } catch (error) {
      console.error('❌ Error revoking user tokens:', error);
      throw new Error('Failed to revoke user tokens');
    }
  }
}

module.exports = new GoogleAuthService();
