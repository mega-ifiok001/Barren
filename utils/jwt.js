const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
function signJwt(payload, expiresIn = '1h') {
    return jwt.sign(payload, secret, { expiresIn });
}

module.exports = signJwt;