import { verifyAccessToken } from '../utils/token.utils.js';
import { ApiError } from '../utils/apiResponse.js';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token is required'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Access token expired'));
      }
      return next(ApiError.unauthorized('Invalid access token'));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(ApiError.unauthorized('User belonging to this token no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Optional protect middleware for routes that can be public or enriched if logged in
export const optionalProtect = async (req, res, next) => {
  try {
    let token = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      } catch (err) {
        // Ignore token errors in optional protect
      }
    }
    next();
  } catch (error) {
    next();
  }
};
