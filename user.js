var express = require('express');
var router = express.Router();
var md5 = require('md5');
var jwt = require('jsonwebtoken');

const con = require('./connection');



router.post('/register', function (req, res) {
    var user = {
        email: req.body.email,
        password: md5(req.body.password),
        name: req.body.name,
        city: req.body.city,
        updated_at: new Date()
    }
    con.query('insert into users SET?', user, function (err, result) {
        if (err) {
            res.status(200).json({ status: 'taken', message: 'record not added', errorMessage: err.sqlMessage, errorCode: err.code });
            console.log('code: ', err.code, ' Message: ', err.sqlMessage);
        } else {
            res.status(200).json({ status: 'true', message: 'record added' });
        }
    });
});

router.post('/login', function (req, res) {
    var password = md5(req.body.password);
    con.query('select * from users where email=? and password=?', [req.body.email, password], function (err, result) {
        if (err) console.log(err);
        else {
            if (result.length === 0) {
                res.json({ status: '404', message: 'no user with this email and password' });
            } else {
                var token = jwt.sign({ user: result, timeStamp: new Date().getTime() }, 'my-secret-key', { expiresIn: '5h' });
                res.json({ status: '200', message: 'record fetched', accessToken: token });
            }
        }
    });
});

router.get('/list', function (req, res) {
    con.query('select * from users', function (err, result) {
        if (err) console.log(err);
        else {
            if (result.length < 1) {
                res.json({ status: '404', message: 'user list empty' });
            } else {
                res.json({ status: '200', message: 'list fetched', total: result.length, users: result });
            }
        }
    });
});

router.post('/send/email', function (req, res) {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'js2106588@gmail.com',
            pass: 'Jaskaran@2002'
        }
    });
    var mailOptions = {
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.message
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.writeHeader(200, { 'Content-type': 'application/json' });
            res.write(JSON.stringify({ status: 'false', message: 'mail not sent' }));
            res.end();
        } else {
            console.log('email successfully sent to: ', req.body.to);
            res.writeHeader(200, { 'Content-type': 'application/json' });
            res.write(JSON.stringify({ status: 'true', message: 'mail sent successfully' }));
            res.end();
        }
    });
});

router.post('/update/password', function (req, res) {
    var enteredPassword = md5(req.body.current);
    var newPassword = md5(req.body.new);

    con.query('select password from users where email=?', [req.body.email], function (err, result) {
        if (err) console.log(err);
        else {
            if (result.length !== 0) {
                if (newPassword === result[0].password) {
                    res.json({status:'samePass', message:'current password matched your new password entered'});
                }
                else if (enteredPassword !== result[0].password) {
                    res.json({ status: '401', message: 'Current password not matched' });
                } else {
                    con.query('update users SET password=? where email=?', [newPassword, req.body.email], function (err, result) {
                        if (err) console.log(err);
                        else {
                            res.json({ status: '200', message: 'password updated' });
                        }
                    });
                }
            }
        }
    });
});

module.exports = router;