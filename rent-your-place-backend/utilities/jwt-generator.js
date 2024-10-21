const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(userID) {
    const payload = {
        user: userID
    };
    return jwt.sign(payload, process.env.JWTSECRETKEY, { expiresIn: parseInt(process.env.JWTEXPIRYTIME, 10) });
}

module.exports = jwtGenerator;