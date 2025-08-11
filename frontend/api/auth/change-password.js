const bcrypt = require('bcryptjs');
const { connectWithRetry } = require('../_db');
const { cors, authenticate, runMiddleware, handleError } = require('../_middleware');

export default async function handler(req, res) {
  try {
    // Handle CORS
    await runMiddleware(req, res, cors);
    
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Connect to database and authenticate
    await connectWithRetry();
    await runMiddleware(req, res, authenticate);

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, req.user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await req.user.update({ password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    handleError(res, error, 'Password change failed');
  }
}