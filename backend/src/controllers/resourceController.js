const Resource = require('../models/Resource');
const { getPagination } = require('../utils/pagination');

// @desc    Create / Share a new resource
// @route   POST /api/resources
// @access  Private (Alumni, Admin)
const createResource = async (req, res, next) => {
  try {
    const { title, description, type, url, category, tags } = req.body;

    const resource = await Resource.create({
      title,
      description,
      type: type || 'article',
      url,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Resource shared successfully!',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resources with search, category, type filter, and pagination
// @route   GET /api/resources
// @access  Public / Authenticated
const getResources = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, category, type } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }];
    }

    if (category) query.category = new RegExp(category, 'i');
    if (type) query.type = type;

    const total = await Resource.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email avatar role department')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    res.json({
      success: true,
      data: resources,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark / Like a resource
// @route   POST /api/resources/:id/bookmark
// @access  Private
const bookmarkResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    resource.bookmarksCount = (resource.bookmarksCount || 0) + 1;
    await resource.save();

    res.json({
      success: true,
      message: 'Resource bookmarked!',
      bookmarksCount: resource.bookmarksCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResource,
  getResources,
  bookmarkResource
};
