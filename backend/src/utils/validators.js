const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  return userObj;
};

module.exports = {
  isValidObjectId,
  sanitizeUser
};
