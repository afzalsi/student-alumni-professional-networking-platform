const AuditLog = require('../models/AuditLog');

const logAction = async ({ actorId, action, entityType, entityId, metadata, req }) => {
  try {
    const ipAddress = req?.ip || req?.connection?.remoteAddress || '';
    await AuditLog.create({
      actorId,
      action,
      entityType,
      entityId,
      metadata: metadata || {},
      ipAddress
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { logAction };
