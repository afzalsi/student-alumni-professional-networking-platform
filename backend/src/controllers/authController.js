const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const generateToken = require('../utils/generateToken');
const { sanitizeUser } = require('../utils/validators');
const { ROLES } = require('../utils/constants');
const { sendNotification } = require('../services/notificationService');

// Helper to calculate profile completion percentage
const calculateProfileCompletion = (user, profile) => {
  let fields = 0;
  let filled = 0;

  // Base fields
  const baseFields = ['name', 'department', 'graduationYear', 'location', 'skills', 'bio', 'avatar'];
  baseFields.forEach((field) => {
    fields++;
    if (user[field] && (Array.isArray(user[field]) ? user[field].length > 0 : Boolean(user[field]))) {
      filled++;
    }
  });

  if (user.role === ROLES.STUDENT) {
    const studentFields = ['careerGoals', 'interests'];
    studentFields.forEach((f) => {
      fields++;
      if (user[f] && (Array.isArray(user[f]) ? user[f].length > 0 : Boolean(user[f]))) filled++;
    });
    if (profile) {
      ['resumeUrl', 'linkedinUrl', 'preferredIndustry', 'preferredJobRole'].forEach((f) => {
        fields++;
        if (profile[f]) filled++;
      });
    }
  } else if (user.role === ROLES.ALUMNI) {
    if (profile) {
      ['company', 'jobTitle', 'industry', 'experienceYears', 'expertise', 'linkedinUrl'].forEach((f) => {
        fields++;
        if (profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : Boolean(profile[f]))) filled++;
      });
    }
  }

  return Math.min(100, Math.round((filled / fields) * 100));
};

// @desc    Register a new user (Student or Alumni)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, graduationYear } = req.body;

    if (role === ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be created via public registration'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || ROLES.STUDENT,
      department: department || '',
      graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
      isVerified: role === ROLES.STUDENT // Alumni need admin verification by default
    });

    // Create corresponding profile record
    let profile = null;
    if (user.role === ROLES.STUDENT) {
      profile = await StudentProfile.create({ userId: user._id });
    } else if (user.role === ROLES.ALUMNI) {
      profile = await AlumniProfile.create({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);
    const completion = calculateProfileCompletion(user, profile);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the portal.',
      data: {
        token,
        user: sanitizeUser(user),
        profile,
        profileCompletion: completion
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.'
      });
    }

    let profile = null;
    if (user.role === ROLES.STUDENT) {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === ROLES.ALUMNI) {
      profile = await AlumniProfile.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);
    const completion = calculateProfileCompletion(user, profile);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: sanitizeUser(user),
        profile,
        profileCompletion: completion
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user & profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === ROLES.STUDENT) {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === ROLES.ALUMNI) {
      profile = await AlumniProfile.findOne({ userId: user._id });
    }

    const completion = calculateProfileCompletion(user, profile);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        profile,
        profileCompletion: completion
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({
      success: true,
      message: 'Password updated successfully',
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  calculateProfileCompletion
};
