const Notification = require('../models/Notification');

let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const sendNotification = async ({
  recipientId,
  senderId,
  type,
  title,
  message,
  relatedEntityId,
  relatedEntityType,
  link
}) => {
  try {
    // Avoid notifying user of their own actions
    if (senderId && recipientId && senderId.toString() === recipientId.toString()) {
      return null;
    }

    let notification = await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      message,
      relatedEntityId,
      relatedEntityType,
      link: link || ''
    });

    if (senderId) {
      notification = await notification.populate('senderId', 'name avatar role department');
    }

    if (ioInstance) {
      // Emit to the specific user's private room
      ioInstance.to(`user_${recipientId.toString()}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  setSocketIO,
  sendNotification
};
