const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("myworld ")) {
      console.error("Authorization header missing or invalid");
      return res.status(401).json({ error: "User not authorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.error("Token missing from Authorization header");
      return res.status(401).json({ error: "User not authorized" });
    }

    try {
      const decodeToken = jwt.verify(
        token,
        "3e9b2825-cfe3-422e-8177-bac1b129a320"
      );
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
