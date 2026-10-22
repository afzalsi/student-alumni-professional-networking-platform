const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description']
    },
    date: {
      type: Date,
      required: [true, 'Please provide the event date']
    },
    time: {
      type: String,
      required: [true, 'Please provide the event time']
    },
    location: {
      type: String,
      default: 'Online'
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'online'
    },
    meetingLink: {
      type: String,
      default: ''
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    capacity: {
      type: Number,
      default: 100
    },
    registeredCount: {
      type: Number,
      default: 0
    },
    registrationDeadline: {
      type: Date
    },
    bannerImage: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

eventSchema.index({ date: 1, mode: 1 });

module.exports = mongoose.model('Event', eventSchema);
