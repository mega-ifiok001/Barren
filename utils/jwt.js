const jwt = require('jsonwebtoken');

function signJwt(payload, secret, expiresIn = '1h') {
    return jwt.sign(payload, secret, { expiresIn });
}

module.exports = signJwt;