const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const { NOTIFICATION_TYPE } = require('../utils/constants');
const { sendNotification } = require('../services/notificationService');

let ioInstance = null;
const setSocketIO = (io) => {
  ioInstance = io;
};

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] }
    })
      .populate('participants', 'name email avatar role department')
      .populate('mentorshipId')
      .sort({ 'lastMessage.createdAt': -1, updatedAt: -1 });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiverId: userId,
          isRead: false
        });
        return {
          ...conv.toObject(),
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: conversationsWithUnread
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === userId.toString()) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this conversation' });
    }

    const messages = await Message.find({ conversationId: id })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read where current user is receiver
    await Message.updateMany(
      { conversationId: id, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === senderId.toString()) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to post to this conversation' });
    }

    // Determine receiver
    const receiverId = conversation.participants.find((p) => p.toString() !== senderId.toString());

    const message = await Message.create({
      conversationId: id,
      senderId,
      receiverId,
      content
    });

    // Update conversation lastMessage
    conversation.lastMessage = {
      text: content,
      senderId,
      createdAt: new Date()
    };
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name avatar');

    // Emit live Socket.IO message
    if (ioInstance) {
      ioInstance.to(`conversation_${id}`).emit('new_message', populatedMessage);
      ioInstance.to(`user_${receiverId.toString()}`).emit('message_received', populatedMessage);
    }

    // Trigger in-app notification
    await sendNotification({
      recipientId: receiverId,
      type: NOTIFICATION_TYPE.NEW_MESSAGE,
      title: `New message from ${req.user.name}`,
      message: content.length > 60 ? `${content.substring(0, 57)}...` : content,
      relatedEntityId: conversation._id,
      relatedEntityType: 'Message',
      link: '/messages'
    });

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setSocketIO,
  getConversations,
  getMessages,
  sendMessage
};
