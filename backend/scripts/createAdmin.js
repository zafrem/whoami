require('dotenv').config();
const { User } = require('../models');

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@personalityhub.com',
      password: 'admin123', // Change this in production!
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('⚠️  Please change the default password after first login!');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  }
}

if (require.main === module) {
  createAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = createAdmin;