const mongoose = require('mongoose');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const SavedPost = require('../models/SavedPost');
const Follow = require('../models/Follow');
const Connection = require('../models/Connection');
const User = require('../models/User');
const AlumniProfile = require('../models/AlumniProfile');
const StudentProfile = require('../models/StudentProfile');
const { sendNotification } = require('../services/notificationService');
const { NOTIFICATION_TYPE, CONNECTION_STATUS } = require('../utils/constants');

// Helper to get connected user IDs for a user
const getConnectedUserIds = async (userId) => {
  const connections = await Connection.find({
    $or: [
      { senderId: userId, status: CONNECTION_STATUS.ACCEPTED },
      { receiverId: userId, status: CONNECTION_STATUS.ACCEPTED }
    ]
  }).select('senderId receiverId');

  return connections.map((c) =>
    c.senderId.toString() === userId.toString() ? c.receiverId.toString() : c.senderId.toString()
  );
};

// Helper to get followed user IDs for a user
const getFollowedUserIds = async (userId) => {
  const follows = await Follow.find({ followerId: userId }).select('followingId');
  return follows.map((f) => f.followingId.toString());
};

// Helper to extract hashtags from text
const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? matches.map((tag) => tag.substring(1).toLowerCase()) : [];
};

// @desc    Create a new professional post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { title, content, category, media, skills, hashtags, originalPostId, shareCommentary } = req.body;

    if (!content && !originalPostId) {
      return res.status(400).json({ success: false, message: 'Post content or shared post is required' });
    }

    // Combine explicit hashtags with any parsed from content
    const parsedTags = extractHashtags(content);
    const combinedTags = Array.from(
      new Set([
        ...(Array.isArray(hashtags) ? hashtags.map((h) => h.replace(/^#/, '').toLowerCase()) : []),
        ...parsedTags
      ])
    );

    const post = await Post.create({
      authorId: req.user._id,
      title: title || '',
      content: content || '',
      category: category || 'General',
      media: Array.isArray(media) ? media : [],
      skills: Array.isArray(skills) ? skills : [],
      hashtags: combinedTags,
      originalPostId: originalPostId || null,
      shareCommentary: shareCommentary || ''
    });

    // If sharing another post, increment share count and notify author
    if (originalPostId) {
      const orig = await Post.findByIdAndUpdate(originalPostId, { $inc: { sharesCount: 1 } });
      if (orig && orig.authorId.toString() !== req.user._id.toString()) {
        await sendNotification({
          recipientId: orig.authorId,
          senderId: req.user._id,
          type: NOTIFICATION_TYPE.POST_SHARE,
          title: 'Post Shared',
          message: `${req.user.name} shared your post.`,
          relatedEntityId: post._id,
          relatedEntityType: 'Post',
          link: `/posts/${orig._id}`
        });
      }
    }

    const populatedPost = await Post.findById(post._id)
      .populate('authorId', 'name avatar role department graduationYear')
      .populate({
        path: 'originalPostId',
        populate: { path: 'authorId', select: 'name avatar role department' }
      });

    res.status(201).json({
      success: true,
      message: 'Post published successfully',
      data: {
        ...populatedPost.toObject(),
        isLiked: false,
        isSaved: false
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized professional feed
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { filter = 'all', page = 1, limit = 15, category, skill, hashtag } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [connectedUserIds, followedUserIds] = await Promise.all([
      getConnectedUserIds(userId),
      getFollowedUserIds(userId)
    ]);

    const connectedSet = new Set(connectedUserIds);
    const followedSet = new Set(followedUserIds);

    let query = {};

    // Apply specific feed filters
    if (filter === 'connections') {
      query.authorId = { $in: connectedUserIds };
    } else if (filter === 'following') {
      query.authorId = { $in: followedUserIds };
    } else if (filter === 'my_posts') {
      query.authorId = userId;
    } else if (filter === 'saved') {
      const savedDocs = await SavedPost.find({ userId }).select('postId');
      const savedIds = savedDocs.map((s) => s.postId);
      query._id = { $in: savedIds };
    } else if (filter !== 'all' && filter) {
      // Category filter like Achievements, Projects, etc.
      query.category = { $regex: new RegExp(`^${filter}$`, 'i') };
    }

    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (skill) {
      query.skills = { $regex: new RegExp(skill, 'i') };
    }

    if (hashtag) {
      query.hashtags = hashtag.replace(/^#/, '').toLowerCase();
    }

    // Get total posts matching query
    const totalPosts = await Post.countDocuments(query);

    // Fetch posts
    const rawPosts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('authorId', 'name avatar role department graduationYear location company jobTitle isVerified')
      .populate({
        path: 'originalPostId',
        populate: { path: 'authorId', select: 'name avatar role department company jobTitle' }
      });

    const postIds = rawPosts.map((p) => p._id);

    // Fetch user's likes and saved posts in batch
    const [userLikes, userSaved] = await Promise.all([
      Like.find({ userId, postId: { $in: postIds } }).select('postId'),
      SavedPost.find({ userId, postId: { $in: postIds } }).select('postId')
    ]);

    const likedPostIdSet = new Set(userLikes.map((l) => l.postId.toString()));
    const savedPostIdSet = new Set(userSaved.map((s) => s.postId.toString()));

    // Enrich posts with interaction state and prioritization weight
    let posts = rawPosts.map((post) => {
      const postObj = post.toObject();
      const authorIdStr = post.authorId ? post.authorId._id.toString() : '';

      const isConnected = connectedSet.has(authorIdStr);
      const isFollowed = followedSet.has(authorIdStr);
      const isSelf = authorIdStr === userId.toString();

      // Priority ranking score for 'all' feed
      let priorityScore = 1;
      if (isSelf) priorityScore = 4;
      else if (isConnected) priorityScore = 3;
      else if (isFollowed) priorityScore = 2;

      return {
        ...postObj,
        isLiked: likedPostIdSet.has(post._id.toString()),
        isSaved: savedPostIdSet.has(post._id.toString()),
        isAuthorConnected: isConnected,
        isAuthorFollowed: isFollowed,
        priorityScore
      };
    });

    // If 'all' feed, sort by priorityScore descending, then createdAt descending
    if (filter === 'all' && !category && !skill && !hashtag) {
      posts.sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) {
          return b.priorityScore - a.priorityScore;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          total: totalPosts,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalPosts / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }

    const post = await Post.findById(id)
      .populate('authorId', 'name avatar role department graduationYear location company jobTitle isVerified')
      .populate({
        path: 'originalPostId',
        populate: { path: 'authorId', select: 'name avatar role department company jobTitle' }
      });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id;
    const [likeDoc, savedDoc, connectedUserIds, followedUserIds] = await Promise.all([
      Like.findOne({ userId, postId: post._id }),
      SavedPost.findOne({ userId, postId: post._id }),
      getConnectedUserIds(userId),
      getFollowedUserIds(userId)
    ]);

    const authorIdStr = post.authorId ? post.authorId._id.toString() : '';

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        isLiked: Boolean(likeDoc),
        isSaved: Boolean(savedDoc),
        isAuthorConnected: connectedUserIds.includes(authorIdStr),
        isAuthorFollowed: followedUserIds.includes(authorIdStr)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts by user ID
// @route   GET /api/users/:id/posts
// @access  Private
const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const posts = await Post.find({ authorId: id })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name avatar role department graduationYear location company jobTitle isVerified')
      .populate({
        path: 'originalPostId',
        populate: { path: 'authorId', select: 'name avatar role department company jobTitle' }
      });

    const postIds = posts.map((p) => p._id);
    const userId = req.user._id;

    const [userLikes, userSaved] = await Promise.all([
      Like.find({ userId, postId: { $in: postIds } }).select('postId'),
      SavedPost.find({ userId, postId: { $in: postIds } }).select('postId')
    ]);

    const likedSet = new Set(userLikes.map((l) => l.postId.toString()));
    const savedSet = new Set(userSaved.map((s) => s.postId.toString()));

    const enriched = posts.map((p) => ({
      ...p.toObject(),
      isLiked: likedSet.has(p._id.toString()),
      isSaved: savedSet.has(p._id.toString())
    }));

    res.json({
      success: true,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    const { title, content, category, media, skills, hashtags } = req.body;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;
    if (media !== undefined) post.media = media;
    if (skills !== undefined) post.skills = skills;

    if (hashtags !== undefined || content !== undefined) {
      const parsed = extractHashtags(content || post.content);
      const combined = Array.from(
        new Set([
          ...(Array.isArray(hashtags) ? hashtags.map((h) => h.replace(/^#/, '').toLowerCase()) : post.hashtags),
          ...parsed
        ])
      );
      post.hashtags = combined;
    }

    post.isEdited = true;
    await post.save();

    const populated = await Post.findById(post._id).populate('authorId', 'name avatar role department');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await Promise.all([
      Post.findByIdAndDelete(id),
      Like.deleteMany({ postId: id }),
      Comment.deleteMany({ postId: id }),
      SavedPost.deleteMany({ postId: id })
    ]);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existingLike = await Like.findOne({ userId, postId: id });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      return res.json({
        success: true,
        message: 'Post unliked',
        data: { isLiked: false, likesCount: post.likesCount }
      });
    }

    // Like
    await Like.create({ userId, postId: id });
    post.likesCount += 1;
    await post.save();

    // Send notification to author
    if (post.authorId.toString() !== userId.toString()) {
      await sendNotification({
        recipientId: post.authorId,
        senderId: userId,
        type: NOTIFICATION_TYPE.POST_LIKE,
        title: 'New Like',
        message: `${req.user.name} liked your post.`,
        relatedEntityId: post._id,
        relatedEntityType: 'Post',
        link: `/posts/${post._id}`
      });
    }

    res.json({
      success: true,
      message: 'Post liked',
      data: { isLiked: true, likesCount: post.likesCount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post (with nested replies)
// @route   GET /api/posts/:id/comments
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allComments = await Comment.find({ postId: id })
      .sort({ createdAt: 1 })
      .populate('userId', 'name avatar role department company jobTitle');

    // Build threaded comments hierarchy (top level comments with replies array)
    const topLevelComments = [];
    const replyMap = new Map();

    allComments.forEach((comment) => {
      if (comment.parentCommentId) {
        const parentId = comment.parentCommentId.toString();
        if (!replyMap.has(parentId)) {
          replyMap.set(parentId, []);
        }
        replyMap.get(parentId).push(comment);
      } else {
        topLevelComments.push(comment);
      }
    });

    const structuredComments = topLevelComments.map((comment) => {
      const cObj = comment.toObject();
      cObj.replies = replyMap.get(comment._id.toString()) || [];
      return cObj;
    });

    res.json({
      success: true,
      data: structuredComments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment or nested reply to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      userId: req.user._id,
      postId: id,
      content: content.trim(),
      parentCommentId: parentCommentId || null
    });

    post.commentsCount += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'userId',
      'name avatar role department company jobTitle'
    );

    // Notify post author or parent comment author
    const targetRecipientId = parentComment ? parentComment.userId : post.authorId;
    if (targetRecipientId.toString() !== req.user._id.toString()) {
      await sendNotification({
        recipientId: targetRecipientId,
        senderId: req.user._id,
        type: NOTIFICATION_TYPE.POST_COMMENT,
        title: parentComment ? 'New Reply' : 'New Comment',
        message: parentComment
          ? `${req.user.name} replied to your comment.`
          : `${req.user.name} commented on your post: "${content.substring(0, 45)}..."`,
        relatedEntityId: post._id,
        relatedEntityType: 'Post',
        link: `/posts/${post._id}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        ...populatedComment.toObject(),
        replies: []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const post = await Post.findById(id);

    // Only comment author, post author, or admin can delete
    const isCommentAuthor = comment.userId.toString() === req.user._id.toString();
    const isPostAuthor = post && post.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    // Also count deleted replies
    const deletedReplies = await Comment.deleteMany({ parentCommentId: commentId });
    await Comment.findByIdAndDelete(commentId);

    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - (1 + deletedReplies.deletedCount));
      await post.save();
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save/bookmark post
// @route   POST /api/posts/:id/save
// @access  Private
const toggleSavePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existing = await SavedPost.findOne({ userId, postId: id });

    if (existing) {
      await SavedPost.findByIdAndDelete(existing._id);
      return res.json({
        success: true,
        message: 'Post removed from saved items',
        data: { isSaved: false }
      });
    }

    await SavedPost.create({ userId, postId: id });
    res.json({
      success: true,
      message: 'Post saved successfully',
      data: { isSaved: true }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user saved/bookmarked posts
// @route   GET /api/posts/saved
// @access  Private
const getSavedPosts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const savedDocs = await SavedPost.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'postId',
        populate: {
          path: 'authorId',
          select: 'name avatar role department company jobTitle isVerified'
        }
      });

    const validPosts = savedDocs
      .filter((s) => s.postId !== null)
      .map((s) => ({
        ...s.postId.toObject(),
        isSaved: true
      }));

    res.json({
      success: true,
      data: validPosts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeed,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
  toggleSavePost,
  getSavedPosts
};
