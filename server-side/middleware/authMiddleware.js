const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Authorization header missing or invalid");
      return res.status(401).json({ error: "User not authorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.error("Token missing from Authorization header");
      return res.status(401).json({ error: "User not authorized" });
    }

    try {
      const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
      req.userData = decodeToken;
      next();
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("Unexpected error in authMiddleware:", error.message);
    return res.status(401).json({ error: "User not authorized" });
  }
};

module.exports = authMiddleware;
