import User from '../models/User.model.js';
import { ApiError, ApiResponse } from '../utils/apiResponse.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  sendRefreshTokenCookie,
  clearRefreshTokenCookie
} from '../utils/token.utils.js';

export const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return next(ApiError.conflict('An account with this email already exists'));
      }
      return next(ApiError.conflict('Username is already taken'));
    }

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    return ApiResponse.created(
      res,
      {
        user: user.toJSON(),
        accessToken
      },
      'Registration successful'
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password'));
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(
      res,
      {
        user: user.toJSON(),
        accessToken
      },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const demoLogin = async (req, res, next) => {
  try {
    const demoEmail = 'demo@orbit.com';
    let user = await User.findOne({ email: demoEmail }).select('+password +refreshToken');

    if (!user) {
      user = await User.create({
        name: 'Alex Rivera',
        username: 'alexrivera',
        email: demoEmail,
        password: 'Demo@1234',
        bio: 'Explorer, design lover & tech builder on Orbit 🚀',
        location: 'San Francisco, CA',
        website: 'https://orbit.app',
        avatar: {
          url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          publicId: ''
        },
        coverPhoto: {
          url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
          publicId: ''
        }
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(
      res,
      {
        user: user.toJSON(),
        accessToken
      },
      'Demo account logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    clearRefreshTokenCookie(res);
    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return next(ApiError.unauthorized('No refresh token provided'));
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      clearRefreshTokenCookie(res);
      return next(ApiError.unauthorized('Invalid or expired refresh token'));
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res);
      return next(ApiError.unauthorized('Invalid refresh token'));
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshTokenCookie(res, newRefreshToken);

    return ApiResponse.success(
      res,
      {
        accessToken: newAccessToken,
        user: user.toJSON()
      },
      'Token refreshed successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return ApiResponse.success(res, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};
