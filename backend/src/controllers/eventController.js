const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { getPagination } = require('../utils/pagination');

// @desc    Create a new alumni/university event
// @route   POST /api/events
// @access  Private (Alumni, Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      mode,
      meetingLink,
      capacity,
      registrationDeadline,
      bannerImage,
      tags
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      time,
      location: location || 'Online',
      mode: mode || 'online',
      meetingLink,
      organizer: req.user._id,
      capacity: capacity ? parseInt(capacity, 10) : 100,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      bannerImage: bannerImage || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : [])
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events with filters & search
// @route   GET /api/events
// @access  Public / Authenticated
const getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, search, mode, upcoming } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }];
    }

    if (mode) query.mode = mode;

    if (upcoming === 'true') {
      query.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    }

    const total = await Event.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    const events = await Event.find(query)
      .populate('organizer', 'name email avatar role department')
      .sort({ date: 1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    // Check if current user registered
    let registeredEventIds = new Set();
    if (req.user) {
      const userRegistrations = await EventRegistration.find({ userId: req.user._id });
      registeredEventIds = new Set(userRegistrations.map((r) => r.eventId.toString()));
    }

    const enriched = events.map((e) => ({
      ...e.toObject(),
      isRegistered: registeredEventIds.has(e._id.toString())
    }));

    res.json({
      success: true,
      data: enriched,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public / Authenticated
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email avatar role department');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    let isRegistered = false;
    if (req.user) {
      const reg = await EventRegistration.findOne({ eventId: event._id, userId: req.user._id });
      isRegistered = Boolean(reg);
    }

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        isRegistered
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.capacity && event.registeredCount >= event.capacity) {
      return res.status(400).json({ success: false, message: 'This event has reached full capacity' });
    }

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration for this event is closed' });
    }

    const existing = await EventRegistration.findOne({ eventId, userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event' });
    }

    await EventRegistration.create({ eventId, userId });
    event.registeredCount = (event.registeredCount || 0) + 1;
    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for the event!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel event registration
// @route   DELETE /api/events/:id/register
// @access  Private
const cancelRegistration = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const registration = await EventRegistration.findOne({ eventId, userId });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    await registration.deleteOne();

    const event = await Event.findById(eventId);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  cancelRegistration
};
