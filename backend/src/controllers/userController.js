const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const { sanitizeUser, isValidObjectId } = require('../utils/validators');
const { getPagination } = require('../utils/pagination');
const { calculateProfileCompletion } = require('./authController');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
const Follow = require('../models/Follow');
const Connection = require('../models/Connection');
const { CONNECTION_STATUS } = require('../utils/constants');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUserId = req.user ? req.user._id : null;

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'alumni') {
      profile = await AlumniProfile.findOne({ userId: user._id });
    }

    // Networking stats
    const [followersCount, followingCount, connectionsCount, followDoc, connectionDoc] = await Promise.all([
      Follow.countDocuments({ followingId: user._id }),
      Follow.countDocuments({ followerId: user._id }),
      Connection.countDocuments({
        $or: [
          { senderId: user._id, status: CONNECTION_STATUS.ACCEPTED },
          { receiverId: user._id, status: CONNECTION_STATUS.ACCEPTED }
        ]
      }),
      currentUserId ? Follow.findOne({ followerId: currentUserId, followingId: user._id }) : null,
      currentUserId
        ? Connection.findOne({
            $or: [
              { senderId: currentUserId, receiverId: user._id },
              { senderId: user._id, receiverId: currentUserId }
            ]
          })
        : null
    ]);

    let connectionStatus = 'none';
    let connectionId = null;

    if (connectionDoc) {
      connectionId = connectionDoc._id;
      if (connectionDoc.status === CONNECTION_STATUS.ACCEPTED) {
        connectionStatus = 'connected';
      } else if (connectionDoc.status === CONNECTION_STATUS.PENDING) {
        connectionStatus = connectionDoc.senderId.toString() === currentUserId.toString() ? 'pending_sent' : 'pending_received';
      } else {
        connectionStatus = 'rejected';
      }
    }

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        profile,
        networking: {
          followersCount,
          followingCount,
          connectionsCount,
          isFollowing: Boolean(followDoc),
          connectionStatus,
          connectionId
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      department,
      graduationYear,
      location,
      skills,
      interests,
      bio,
      careerGoals,
      avatar,
      // Profile specific fields
      resumeUrl,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      preferredIndustry,
      preferredJobRole,
      company,
      jobTitle,
      industry,
      experienceYears,
      expertise,
      mentorAvailable,
      availabilitySchedule,
      availableSlots,
      mentorshipMode,
      projects,
      education,
      experience,
      certifications,
      achievements
    } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (department !== undefined) user.department = department;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (location !== undefined) user.location = location;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (interests !== undefined) user.interests = Array.isArray(interests) ? interests : interests.split(',').map((i) => i.trim());
    if (bio !== undefined) user.bio = bio;
    if (careerGoals !== undefined) user.careerGoals = careerGoals;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    let profile = null;
    if (user.role === 'student') {
      const updateData = {
        resumeUrl,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
        preferredIndustry,
        preferredJobRole,
        careerGoals
      };
      if (projects !== undefined) updateData.projects = projects;
      if (education !== undefined) updateData.education = education;
      if (experience !== undefined) updateData.experience = experience;
      if (certifications !== undefined) updateData.certifications = certifications;
      if (achievements !== undefined) updateData.achievements = achievements;

      profile = await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        updateData,
        { new: true, upsert: true }
      );
    } else if (user.role === 'alumni') {
      const updateData = {
        company,
        jobTitle,
        industry,
        experienceYears,
        expertise: Array.isArray(expertise) ? expertise : (expertise ? expertise.split(',').map((e) => e.trim()) : []),
        mentorAvailable,
        availabilitySchedule,
        availableSlots,
        mentorshipMode,
        linkedinUrl,
        portfolioUrl
      };
      if (projects !== undefined) updateData.projects = projects;
      if (education !== undefined) updateData.education = education;
      if (experience !== undefined) updateData.experience = experience;
      if (certifications !== undefined) updateData.certifications = certifications;
      if (achievements !== undefined) updateData.achievements = achievements;

      profile = await AlumniProfile.findOneAndUpdate(
        { userId: user._id },
        updateData,
        { new: true, upsert: true }
      );
    }

    const completion = calculateProfileCompletion(user, profile);

    res.json({
      success: true,
      message: 'Profile updated successfully',
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

// @desc    Upload user avatar or resume
// @route   POST /api/users/upload
// @access  Private
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const relativePath = `/uploads/${req.file.fieldname === 'resume' ? 'resumes' : 'avatars'}/${req.file.filename}`;
    const fileUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileUrl,
        relativePath,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserById,
  updateProfile,
  uploadFile
};
