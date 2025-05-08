const jwt = require("jsonwebtoken");
require("dotenv").config({ path: [".env.production", ".env.example", ".env"] });

module.exports = async (request, response, next) => {
  try {
    const jwtToken = request.header("Token");
    if (!jwtToken)
      return response.status(403).json({ message: "Not authorized" });
    const payload = jwt.verify(jwtToken, process.env.JWTSECRETKEY);
    request.user = payload.user;
    next();
  } catch (error) {
    console.error(error.message);
    return response.status(403).json({ message: "Not authorized" });
  }
};
