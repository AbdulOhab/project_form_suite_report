const { validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const thanaModel = require("../model/thanaModel");

/**
 * Generates a JWT token without including the password.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

/**
 * Returns a standardized error response for invalid credentials.
 */
const authError = (res) => {
  return res.status(422).json({
    errors: [
      {
        path: "password",
        msg: "password does not match",
      },
    ],
    msg: "validation Error",
  });
};

module.exports = {
  form_submit: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { userId, password } = req.body;

    const id = JSON.parse(userId);
    await thanaModel
      .findOne({ userId: id })
      .select("-_id")
      .then(async (user) => {
        if (!user) {
          return res.status(404).json({ message: "user not found" });
        }

        const pass = await bcrypt.compare(password, user.password);
        if (!pass) {
          return authError(res);
        }

        // Build token payload WITHOUT password
        const { userId, userRole } = user;
        let tokenPayload = { userId, userRole };

        if (user.thanaCode) {
          tokenPayload.thanaCode = user.thanaCode;
          tokenPayload.branchCode = user.branchCode;
          tokenPayload.zonalCode = user.zonalCode;
        } else if (user.branchCode) {
          tokenPayload.branchCode = user.branchCode;
          tokenPayload.zonalCode = user.zonalCode;
        } else if (user.zonalCode) {
          tokenPayload.zonalCode = user.zonalCode;
        }

        let token = generateToken(tokenPayload);
        return res
          .status(200)
          .json({ message: "Logged In Successfully", userId, token });
      })
      .catch((err) => {
        console.log(`err`, err);
        return res.status(500).json({ message: err.message });
      });
  },
  check: async (req, res, next) => {
    const userId = req.userData.userId;

    await thanaModel
      .findOne()
      .where({
        userId,
      })
      .select("-_id -password")
      .then((user) => {
        if (user) {
          next();
          return res.status(200).json(user);
        } else {
          return res.status(401).json("unauthorized access");
        }
      })
      .catch((err) => {
        return res.status(500).json("Server Error");
      });
  },
  logout: async (req, res, next) => {
    // Client handles token removal from localStorage
    return res.status(200).json({ message: "Logged out successfully" });
  },
};
