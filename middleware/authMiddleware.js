const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Expected format: "Bearer <token>"
    const bearerToken = token.split(" ")[1] || token;
    
    // In authController.js, the token was signed with "secret"
    const decoded = jwt.verify(bearerToken, "secret");
    
    // Attach the user object containing user_id to req
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const hasRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Unauthorized access: required role missing" });
    }
    next();
  };
};

const hasAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized access: required role missing" });
    }
    next();
  };
};

module.exports = { authMiddleware, hasRole, hasAnyRole };
