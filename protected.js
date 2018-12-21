var express = require('express');
var router = express.Router();
var md5 = require('md5');
var jwt = require('jsonwebtoken');

const con = require('./connection');

// importing middleware
var verifyToken = require('./verifyToken');

router.use(verifyToken);

router.get('/route', function (req, res) {
    res.json({ status: '200', message: 'this is secure route' });
});

module.exports = router;
