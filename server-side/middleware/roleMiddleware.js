const requireRole = (...allowedRoles) => (req, res, next) => {
  const userRole = req.userData?.userRole;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

module.exports = { requireRole };
