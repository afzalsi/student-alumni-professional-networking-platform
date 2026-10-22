const mongoose = require('mongoose');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Connection = require('../models/Connection');
const Post = require('../models/Post');
const Like = require('../models/Like');
const SavedPost = require('../models/SavedPost');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const { sendNotification } = require('../services/notificationService');
const { NOTIFICATION_TYPE, CONNECTION_STATUS } = require('../utils/constants');

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid target user ID' });
    }

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User to follow not found' });
    }

    const existingFollow = await Follow.findOne({
      followerId: currentUserId,
      followingId: targetUserId
    });

    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'You are already following this user' });
    }

    await Follow.create({
      followerId: currentUserId,
      followingId: targetUserId
    });

    // Send Notification
    await sendNotification({
      recipientId: targetUserId,
      senderId: currentUserId,
      type: NOTIFICATION_TYPE.FOLLOW,
      title: 'New Follower',
      message: `${req.user.name} started following you.`,
      relatedEntityId: currentUserId,
      relatedEntityType: 'User',
      link: `/profile/${currentUserId}`
    });

    const followersCount = await Follow.countDocuments({ followingId: targetUserId });

    res.json({
      success: true,
      message: `You are now following ${targetUser.name}`,
      data: { isFollowing: true, followersCount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
const unfollowUser = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid target user ID' });
    }

    const deleted = await Follow.findOneAndDelete({
      followerId: currentUserId,
      followingId: targetUserId
    });

    if (!deleted) {
      return res.status(400).json({ success: false, message: 'You are not following this user' });
    }

    const followersCount = await Follow.countDocuments({ followingId: targetUserId });

    res.json({
      success: true,
      message: 'Unfollowed successfully',
      data: { isFollowing: false, followersCount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get followers of a user
// @route   GET /api/users/:id/followers
// @access  Private
const getFollowers = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const query = { followingId: targetUserId };

    const follows = await Follow.find(query)
      .sort({ createdAt: -1 })
      .populate('followerId', 'name avatar role department graduationYear location company jobTitle isVerified');

    let followers = follows.map((f) => f.followerId).filter(Boolean);

    if (search.trim()) {
      const q = search.toLowerCase();
      followers = followers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q)) ||
          (u.company && u.company.toLowerCase().includes(q)) ||
          (u.jobTitle && u.jobTitle.toLowerCase().includes(q))
      );
    }

    const total = followers.length;
    const paginated = followers.slice(skip, skip + limitNum);

    // Check if logged-in user follows them
    const followerIds = paginated.map((u) => u._id);
    const myFollows = await Follow.find({
      followerId: req.user._id,
      followingId: { $in: followerIds }
    }).select('followingId');
    const myFollowSet = new Set(myFollows.map((f) => f.followingId.toString()));

    const enriched = paginated.map((u) => ({
      ...u.toObject(),
      isFollowing: myFollowSet.has(u._id.toString()),
      isSelf: u._id.toString() === req.user._id.toString()
    }));

    res.json({
      success: true,
      data: {
        users: enriched,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get who a user is following
// @route   GET /api/users/:id/following
// @access  Private
const getFollowing = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const follows = await Follow.find({ followerId: targetUserId })
      .sort({ createdAt: -1 })
      .populate('followingId', 'name avatar role department graduationYear location company jobTitle isVerified');

    let following = follows.map((f) => f.followingId).filter(Boolean);

    if (search.trim()) {
      const q = search.toLowerCase();
      following = following.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q)) ||
          (u.company && u.company.toLowerCase().includes(q)) ||
          (u.jobTitle && u.jobTitle.toLowerCase().includes(q))
      );
    }

    const total = following.length;
    const paginated = following.slice(skip, skip + limitNum);

    const followingIds = paginated.map((u) => u._id);
    const myFollows = await Follow.find({
      followerId: req.user._id,
      followingId: { $in: followingIds }
    }).select('followingId');
    const myFollowSet = new Set(myFollows.map((f) => f.followingId.toString()));

    const enriched = paginated.map((u) => ({
      ...u.toObject(),
      isFollowing: myFollowSet.has(u._id.toString()),
      isSelf: u._id.toString() === req.user._id.toString()
    }));

    res.json({
      success: true,
      data: {
        users: enriched,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get network statistics & relationship status between current user and target user
// @route   GET /api/users/:id/network-status
// @access  Private
const getNetworkStatus = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const [followersCount, followingCount, acceptedConnections, followDoc, followerDoc, connectionDoc] =
      await Promise.all([
        Follow.countDocuments({ followingId: targetUserId }),
        Follow.countDocuments({ followerId: targetUserId }),
        Connection.countDocuments({
          $or: [
            { senderId: targetUserId, status: CONNECTION_STATUS.ACCEPTED },
            { receiverId: targetUserId, status: CONNECTION_STATUS.ACCEPTED }
          ]
        }),
        Follow.findOne({ followerId: currentUserId, followingId: targetUserId }),
        Follow.findOne({ followerId: targetUserId, followingId: currentUserId }),
        Connection.findOne({
          $or: [
            { senderId: currentUserId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: currentUserId }
          ]
        })
      ]);

    let connectionStatus = 'none';
    let connectionId = null;

    if (connectionDoc) {
      connectionId = connectionDoc._id;
      if (connectionDoc.status === CONNECTION_STATUS.ACCEPTED) {
        connectionStatus = 'connected';
      } else if (connectionDoc.status === CONNECTION_STATUS.PENDING) {
        if (connectionDoc.senderId.toString() === currentUserId.toString()) {
          connectionStatus = 'pending_sent';
        } else {
          connectionStatus = 'pending_received';
        }
      } else if (connectionDoc.status === CONNECTION_STATUS.REJECTED) {
        connectionStatus = 'rejected';
      }
    }

    res.json({
      success: true,
      data: {
        followersCount,
        followingCount,
        connectionsCount: acceptedConnections,
        isFollowing: Boolean(followDoc),
        isFollower: Boolean(followerDoc),
        connectionStatus,
        connectionId
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CONNECTIONS SYSTEM ====================

// @desc    Send connection request to another user
// @route   POST /api/connections/:id/request
// @access  Private
const sendConnectionRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid target user ID' });
    }

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { senderId: currentUserId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: currentUserId }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === CONNECTION_STATUS.ACCEPTED) {
        return res.status(400).json({ success: false, message: 'You are already connected with this user' });
      }
      if (existingConnection.status === CONNECTION_STATUS.PENDING) {
        return res.status(400).json({
          success: false,
          message:
            existingConnection.senderId.toString() === currentUserId.toString()
              ? 'Connection request already sent and pending'
              : 'This user already sent you a connection request. Please accept it.'
        });
      }
      // If rejected earlier, allow re-request
      existingConnection.senderId = currentUserId;
      existingConnection.receiverId = targetUserId;
      existingConnection.status = CONNECTION_STATUS.PENDING;
      await existingConnection.save();

      await sendNotification({
        recipientId: targetUserId,
        senderId: currentUserId,
        type: NOTIFICATION_TYPE.CONNECTION_REQUEST,
        title: 'Connection Request',
        message: `${req.user.name} sent you a connection request.`,
        relatedEntityId: existingConnection._id,
        relatedEntityType: 'Connection',
        link: '/network'
      });

      return res.json({
        success: true,
        message: 'Connection request sent successfully',
        data: existingConnection
      });
    }

    const connection = await Connection.create({
      senderId: currentUserId,
      receiverId: targetUserId,
      status: CONNECTION_STATUS.PENDING
    });

    await sendNotification({
      recipientId: targetUserId,
      senderId: currentUserId,
      type: NOTIFICATION_TYPE.CONNECTION_REQUEST,
      title: 'Connection Request',
      message: `${req.user.name} sent you a connection request.`,
      relatedEntityId: connection._id,
      relatedEntityType: 'Connection',
      link: '/network'
    });

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept connection request
// @route   POST /api/connections/:id/accept
// @access  Private
const acceptConnectionRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const paramId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(paramId)) {
      return res.status(400).json({ success: false, message: 'Invalid connection or user ID' });
    }

    // Param could be connection ID or sender's user ID
    let connection = await Connection.findById(paramId);
    if (!connection) {
      connection = await Connection.findOne({
        senderId: paramId,
        receiverId: currentUserId,
        status: CONNECTION_STATUS.PENDING
      });
    }

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (connection.receiverId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this connection request' });
    }

    connection.status = CONNECTION_STATUS.ACCEPTED;
    await connection.save();

    // Notify the sender that request was accepted
    await sendNotification({
      recipientId: connection.senderId,
      senderId: currentUserId,
      type: NOTIFICATION_TYPE.CONNECTION_ACCEPTED,
      title: 'Connection Accepted',
      message: `${req.user.name} accepted your connection request.`,
      relatedEntityId: connection._id,
      relatedEntityType: 'Connection',
      link: `/profile/${currentUserId}`
    });

    res.json({
      success: true,
      message: 'Connection request accepted',
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject connection request
// @route   POST /api/connections/:id/reject
// @access  Private
const rejectConnectionRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const paramId = req.params.id;

    let connection = await Connection.findById(paramId);
    if (!connection) {
      connection = await Connection.findOne({
        senderId: paramId,
        receiverId: currentUserId,
        status: CONNECTION_STATUS.PENDING
      });
    }

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (connection.receiverId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this connection request' });
    }

    connection.status = CONNECTION_STATUS.REJECTED;
    await connection.save();

    res.json({
      success: true,
      message: 'Connection request rejected',
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove connection or cancel pending connection request
// @route   DELETE /api/connections/:id
// @access  Private
const removeConnection = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const paramId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(paramId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    // Match by connection _id or target user ID
    let connection = await Connection.findById(paramId);
    if (!connection) {
      connection = await Connection.findOne({
        $or: [
          { senderId: currentUserId, receiverId: paramId },
          { senderId: paramId, receiverId: currentUserId }
        ]
      });
    }

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    const isParticipant =
      connection.senderId.toString() === currentUserId.toString() ||
      connection.receiverId.toString() === currentUserId.toString();

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to remove this connection' });
    }

    await Connection.findByIdAndDelete(connection._id);

    res.json({
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's accepted connections
// @route   GET /api/connections
// @access  Private
const getConnections = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const connections = await Connection.find({
      $or: [
        { senderId: currentUserId, status: CONNECTION_STATUS.ACCEPTED },
        { receiverId: currentUserId, status: CONNECTION_STATUS.ACCEPTED }
      ]
    })
      .sort({ updatedAt: -1 })
      .populate('senderId', 'name avatar role department graduationYear location company jobTitle isVerified')
      .populate('receiverId', 'name avatar role department graduationYear location company jobTitle isVerified');

    let connectedUsers = connections.map((c) => {
      const isSender = c.senderId._id.toString() === currentUserId.toString();
      const otherUser = isSender ? c.receiverId : c.senderId;
      return {
        ...otherUser.toObject(),
        connectionId: c._id,
        connectedSince: c.updatedAt
      };
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      connectedUsers = connectedUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q)) ||
          (u.company && u.company.toLowerCase().includes(q)) ||
          (u.jobTitle && u.jobTitle.toLowerCase().includes(q))
      );
    }

    const total = connectedUsers.length;
    const paginated = connectedUsers.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: {
        connections: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending connection requests (both received and sent)
// @route   GET /api/connections/requests
// @access  Private
const getConnectionRequests = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const [received, sent] = await Promise.all([
      Connection.find({
        receiverId: currentUserId,
        status: CONNECTION_STATUS.PENDING
      })
        .sort({ createdAt: -1 })
        .populate('senderId', 'name avatar role department graduationYear location company jobTitle skills isVerified'),
      Connection.find({
        senderId: currentUserId,
        status: CONNECTION_STATUS.PENDING
      })
        .sort({ createdAt: -1 })
        .populate('receiverId', 'name avatar role department graduationYear location company jobTitle skills isVerified')
    ]);

    res.json({
      success: true,
      data: {
        received,
        sent,
        receivedCount: received.length,
        sentCount: sent.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested connections ("People You May Know")
// @route   GET /api/connections/suggestions
// @access  Private
const getSuggestedConnections = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    // 1. Find all users we already have ANY connection with (pending, accepted, rejected)
    const existingConnections = await Connection.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
    });

    const excludedUserIds = new Set();
    excludedUserIds.add(currentUserId.toString());

    existingConnections.forEach((c) => {
      excludedUserIds.add(c.senderId.toString());
      excludedUserIds.add(c.receiverId.toString());
    });

    // 2. Get current user's active connections for mutuals calculation
    const myAcceptedConnections = existingConnections.filter((c) => c.status === CONNECTION_STATUS.ACCEPTED);
    const myConnectedFriendIds = myAcceptedConnections.map((c) =>
      c.senderId.toString() === currentUserId.toString() ? c.receiverId.toString() : c.senderId.toString()
    );

    // 3. Get all other active students and alumni
    const candidateUsers = await User.find({
      _id: { $nin: Array.from(excludedUserIds) },
      isActive: true,
      role: { $in: ['student', 'alumni'] }
    })
      .select('name avatar role department graduationYear location skills company jobTitle isVerified')
      .limit(60);

    const candidateIds = candidateUsers.map((u) => u._id);

    // 4. Batch fetch connections of candidates to calculate mutual connections
    const candidatesConnections = await Connection.find({
      status: CONNECTION_STATUS.ACCEPTED,
      $or: [{ senderId: { $in: candidateIds } }, { receiverId: { $in: candidateIds } }]
    });

    const candidateFriendsMap = new Map();
    candidatesConnections.forEach((c) => {
      const sId = c.senderId.toString();
      const rId = c.receiverId.toString();

      if (!candidateFriendsMap.has(sId)) candidateFriendsMap.set(sId, new Set());
      if (!candidateFriendsMap.has(rId)) candidateFriendsMap.set(rId, new Set());

      candidateFriendsMap.get(sId).add(rId);
      candidateFriendsMap.get(rId).add(sId);
    });

    // 5. Fetch follow status in batch
    const follows = await Follow.find({
      followerId: currentUserId,
      followingId: { $in: candidateIds }
    }).select('followingId');
    const followedSet = new Set(follows.map((f) => f.followingId.toString()));

    const mySkills = (currentUser.skills || []).map((s) => s.toLowerCase());

    // 6. Score each candidate
    const scoredSuggestions = candidateUsers.map((candidate) => {
      let score = 0;
      const reasons = [];

      // Mutual connections (+15 pts per mutual)
      const candFriends = candidateFriendsMap.get(candidate._id.toString()) || new Set();
      let mutualCount = 0;
      myConnectedFriendIds.forEach((fId) => {
        if (candFriends.has(fId)) mutualCount++;
      });

      if (mutualCount > 0) {
        score += mutualCount * 15;
        reasons.push(`${mutualCount} mutual connection${mutualCount > 1 ? 's' : ''}`);
      }

      // Same department (+25 pts)
      if (currentUser.department && candidate.department && currentUser.department.toLowerCase() === candidate.department.toLowerCase()) {
        score += 25;
        reasons.push(`Same department (${candidate.department})`);
      }

      // Same graduation year (+20 pts)
      if (currentUser.graduationYear && candidate.graduationYear && currentUser.graduationYear === candidate.graduationYear) {
        score += 20;
        reasons.push(`Class of ${candidate.graduationYear}`);
      }

      // Shared skills (+10 pts per skill)
      const candSkills = (candidate.skills || []).map((s) => s.toLowerCase());
      const sharedSkills = mySkills.filter((s) => candSkills.includes(s));
      if (sharedSkills.length > 0) {
        score += sharedSkills.length * 10;
        reasons.push(`Shares ${sharedSkills.length} skill${sharedSkills.length > 1 ? 's' : ''}`);
      }

      // Alumni bonus for students looking for industry leaders (+15 pts)
      if (currentUser.role === 'student' && candidate.role === 'alumni') {
        score += 15;
        if (candidate.company) {
          reasons.push(`Alumni at ${candidate.company}`);
        }
      }

      return {
        ...candidate.toObject(),
        score,
        mutualCount,
        reasons: reasons.slice(0, 2),
        isFollowing: followedSet.has(candidate._id.toString())
      };
    });

    // Sort by recommendation score descending
    scoredSuggestions.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: scoredSuggestions.slice(0, 16)
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SEARCH & DISCOVER ====================

// @desc    Global professional search across People, Posts, Skills, Hashtags
// @route   GET /api/search
// @access  Private
const searchAll = async (req, res, next) => {
  try {
    const { q = '', type = 'all', page = 1, limit = 15 } = req.query;
    const currentUserId = req.user._id;

    if (!q || !q.trim()) {
      return res.json({
        success: true,
        data: {
          people: [],
          posts: [],
          skills: [],
          hashtags: []
        }
      });
    }

    const searchTerm = q.trim();
    const regex = new RegExp(searchTerm, 'i');

    const results = {
      people: [],
      posts: [],
      skills: [],
      hashtags: []
    };

    // 1. Search People
    if (type === 'all' || type === 'people') {
      const people = await User.find({
        _id: { $ne: currentUserId },
        isActive: true,
        $or: [
          { name: regex },
          { department: regex },
          { skills: regex },
          { location: regex }
        ]
      })
        .select('name avatar role department graduationYear location company jobTitle skills isVerified')
        .limit(20);

      // Fetch follow and connection relationships for searched people
      const peopleIds = people.map((p) => p._id);
      const [follows, connections] = await Promise.all([
        Follow.find({ followerId: currentUserId, followingId: { $in: peopleIds } }).select('followingId'),
        Connection.find({
          $or: [
            { senderId: currentUserId, receiverId: { $in: peopleIds } },
            { senderId: { $in: peopleIds }, receiverId: currentUserId }
          ]
        })
      ]);

      const followedSet = new Set(follows.map((f) => f.followingId.toString()));
      const connectionMap = new Map();

      connections.forEach((c) => {
        const otherId = c.senderId.toString() === currentUserId.toString() ? c.receiverId.toString() : c.senderId.toString();
        connectionMap.set(otherId, c.status);
      });

      results.people = people.map((u) => ({
        ...u.toObject(),
        isFollowing: followedSet.has(u._id.toString()),
        connectionStatus: connectionMap.get(u._id.toString()) || 'none'
      }));
    }

    // 2. Search Posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { title: regex },
          { content: regex },
          { category: regex },
          { hashtags: regex },
          { skills: regex }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('authorId', 'name avatar role department company jobTitle isVerified');

      const postIds = posts.map((p) => p._id);
      const [userLikes, userSaved] = await Promise.all([
        Like.find({ userId: currentUserId, postId: { $in: postIds } }).select('postId'),
        SavedPost.find({ userId: currentUserId, postId: { $in: postIds } }).select('postId')
      ]);

      const likedSet = new Set(userLikes.map((l) => l.postId.toString()));
      const savedSet = new Set(userSaved.map((s) => s.postId.toString()));

      results.posts = posts.map((p) => ({
        ...p.toObject(),
        isLiked: likedSet.has(p._id.toString()),
        isSaved: savedSet.has(p._id.toString())
      }));
    }

    // 3. Search Skills
    if (type === 'all' || type === 'skills') {
      const usersWithSkills = await User.aggregate([
        { $unwind: '$skills' },
        { $match: { skills: regex } },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      results.skills = usersWithSkills.map((s) => ({
        name: s._id,
        count: s.count
      }));
    }

    // 4. Search Hashtags
    if (type === 'all' || type === 'hashtags') {
      const postsWithTags = await Post.aggregate([
        { $unwind: '$hashtags' },
        { $match: { hashtags: regex } },
        { $group: { _id: '$hashtags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      results.hashtags = postsWithTags.map((h) => ({
        name: h._id,
        count: h.count
      }));
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getNetworkStatus,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getConnections,
  getConnectionRequests,
  getSuggestedConnections,
  searchAll
};
