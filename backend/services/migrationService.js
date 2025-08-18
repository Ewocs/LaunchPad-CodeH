const mongoose = require('mongoose');
const User = require('../models/User');

class MigrationService {
  static async runMigrations() {
    console.log('🔄 Running database migrations...');
    await this.clearOldGmailTokens();
  }

  // Migration to clear old Gmail tokens with insufficient scopes
  static async clearOldGmailTokens() {
    try {
      const users = await User.find({
        $or: [
          { accessToken: { $exists: true, $ne: null } },
          { refreshToken: { $exists: true, $ne: null } }
        ]
      });

      if (users.length === 0) {
        console.log('✅ No users with old tokens found');
        return;
      }

      // Check if we've already run this migration
      const migrationKey = 'gmail_scope_migration_2025_08_13';
      const migrationRecord = await User.findOne({ 
        email: '__migration_record__',
        googleId: migrationKey 
      });

      if (migrationRecord) {
        console.log('✅ Gmail scope migration already completed');
        return;
      }

      console.log(`🔧 Found ${users.length} users with potentially outdated Gmail tokens`);
      console.log('🔧 Clearing old Gmail tokens to force re-authentication with proper scopes...');

      // Clear tokens for all users
      const result = await User.updateMany(
        {
          $or: [
            { accessToken: { $exists: true, $ne: null } },
            { refreshToken: { $exists: true, $ne: null } }
          ]
        },
        {
          $unset: {
            accessToken: 1,
            refreshToken: 1,
            tokenExpiry: 1
          }
        }
      );

      // Create migration record to prevent running this again
      await User.create({
        email: '__migration_record__',
        googleId: migrationKey,
        name: 'Migration Record - Gmail Scope Fix',
        isActive: false
      });

      console.log(`✅ Gmail tokens cleared for ${result.modifiedCount} users`);
      console.log('✅ All users will be prompted to re-authenticate with proper Gmail scopes');

    } catch (error) {
      console.error('❌ Error during Gmail token migration:', error);
    }
  }
}

module.exports = MigrationService;
