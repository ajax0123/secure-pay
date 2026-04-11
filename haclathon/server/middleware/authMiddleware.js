// Module: authMiddleware | Responsibility: Enforce authentication and authorization for protected routes.
const { verifyAuthToken } = require('../utils/jwtHelper');
const { decrypt } = require('../utils/encryption');
const User = require('../models/User');
const Session = require('../models/Session');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing.' });
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token user.' });
    }

    const session = await Session.findOne({ _id: payload.sessionId, user_id: user._id.toString(), is_active: true });
    if (!session) {
      return res.status(401).json({ message: 'Session invalid or expired.' });
    }

    session.last_active = new Date();
    await session.save();

    req.user = {
      userId: user._id.toString(),
      email: decrypt(user.email_encrypted),
      role: user.role,
      sessionId: session._id.toString()
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  return next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
