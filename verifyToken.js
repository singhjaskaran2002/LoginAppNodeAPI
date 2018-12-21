var jwt = require('jsonwebtoken');

// middleware to authenticate the routes in node.js
function verifyToken(req, res, next) {
    // get the authroization from header
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');

        // assign the token
        req.token = bearer[1];

        jwt.verify(req.token, 'my-secret-key', function (err, authData) {
            if (err) {
                res.status(200).json({ status: '403', message: 'some error occurred' });
            } else {
                req.authData = authData;
                next();
            }
        });
    } else {
        res.status(200).json({ status: '401', message: 'you are not authorized' });
    }
}

module.exports = verifyToken;