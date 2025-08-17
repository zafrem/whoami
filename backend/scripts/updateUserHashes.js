const { User } = require('../models');
const crypto = require('crypto');

async function updateUserHashes() {
  try {
    console.log('🔧 Updating user hashes...');
    
    // Find all users without userHash
    const usersWithoutHash = await User.findAll({
      where: {
        userHash: null
      }
    });

    console.log(`Found ${usersWithoutHash.length} users without hashes`);

    // Update each user with a unique hash
    for (const user of usersWithoutHash) {
      let hash;
      let isUnique = false;
      
      // Ensure hash is unique
      while (!isUnique) {
        hash = crypto.randomBytes(16).toString('hex');
        const existingUser = await User.findOne({
          where: { userHash: hash }
        });
        if (!existingUser) {
          isUnique = true;
        }
      }
      
      await user.update({ userHash: hash });
      console.log(`✅ Updated user ${user.username} with hash: ${hash.slice(0, 8)}...`);
    }

    console.log('✨ All users updated with hashes!');
  } catch (error) {
    console.error('❌ Error updating user hashes:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updateUserHashes()
    .then(() => {
      console.log('✅ Hash update completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Hash update failed:', error);
      process.exit(1);
    });
}

module.exports = updateUserHashes;