const { validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const thanaModel = require("../model/thanaModel");

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
        if (user) {
          if (user.userRole === "admin") {
            const pass = await bcrypt.compare(password, user.password);

            if (pass) {
              const { userId, password, userRole } = user;
              let token = jwt.sign(
                { userId, password, userRole },
                "3e9b2825-cfe3-422e-8177-bac1b129a320"
              );
              return res
                .status(200)
                .json({ message: "Logged In Successfully", userId, token });
            } else {
              let errors = {
                errors: [
                  {
                    path: "password",
                    msg: "password does not match",
                  },
                ],
                msg: "validation Error",
              };
              return res.status(422).json(errors);
            }
          } else if (user.thanaCode) {
            const pass = await bcrypt.compare(password, user.password);
            if (pass) {
              const {
                userId,
                password,
                thanaCode,
                branchCode,
                zonalCode,

                userRole,
              } = user;
              let token = jwt.sign(
                {
                  userId,
                  password,

                  thanaCode,
                  branchCode,
                  zonalCode,
                  userRole,
                },
                "3e9b2825-cfe3-422e-8177-bac1b129a320"
              );
              return res
                .status(200)
                .json({ message: "Logged In Successfully", userId, token });
            } else {
              let errors = {
                errors: [
                  {
                    path: "password",
                    msg: "password does not match",
                  },
                ],
                msg: "validation Error",
              };

              return res.status(422).json(errors);
            }
          } else if (user.branchCode) {
            const pass = await bcrypt.compare(password, user.password);
            if (pass) {
              const { userId, password, branchCode, zonalCode, userRole } =
                user;
              let token = jwt.sign(
                { userId, password, branchCode, zonalCode, userRole },
                "3e9b2825-cfe3-422e-8177-bac1b129a320"
              );
              return res
                .status(200)
                .json({ message: "Logged In Successfully", userId, token });
            } else {
              let errors = {
                errors: [
                  {
                    path: "password",
                    msg: "password does not match",
                  },
                ],
                msg: "validation Error",
              };

              return res.status(422).json(errors);
            }
          } else if (user.zonalCode) {
            const pass = await bcrypt.compare(password, user.password);
            if (pass) {
              const { userId, password, zonalCode, userRole } = user;
              let token = jwt.sign(
                { userId, password, zonalCode, userRole },
                "3e9b2825-cfe3-422e-8177-bac1b129a320"
              );
              return res
                .status(200)
                .json({ message: "Logged In Successfully", userId, token });
            } else {
              let errors = {
                errors: [
                  {
                    path: "password",
                    msg: "password does not match",
                  },
                ],
                msg: "validation Error",
              };

              return res.status(422).json(errors);
            }
          }
        } else {
          return res.status(404).json({ message: "user not found" });
        }
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
      .select("-_id")
      .then((user) => {
        if (user) {
          next();
          return res.status(200).json(user);
        } else {
          // console.log("authorized fails");
          return res.status(401).json("unauthorized access");
        }
      })
      .catch((err) => {
        return res.status(500).json("Server Error");
      });
  },
  logout: async (req, res, next) => {
    req.isAuth = false;
    window.localStorage.removeItem("gsmToken");
    return res.render("/");
  },
};
