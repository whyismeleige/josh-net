const { decodeAccessToken } = require("../utils/auth.utils");
const User = require("../models").user;

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      message: "Unauthorized Access",
      type: "error",
    });
  }

  try {
    const { id } = decodeAccessToken(token);
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).send({
        message: "User Not Found",
        type: "error",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).send({
      message: "Unauthorized Access",
      type: "error",
    });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({
        message: "Access Forbidden",
        type: "error",
      });
    }
    next();
  };
};
