const express = require('express');
const app = express();
const fs = require('fs');
var md5 = require('md5');
var cors = require('cors');
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

app.use(bodyParser.json(), cors({ origin: 'http://localhost:4200' }));

// middleware to authenticate the routes in node.js
function verifyToken(req, res, next) {
	// get the authroization from header
	const bearerHeader = req.headers['authorization'];

	const bearer = bearerHeader.split(' ');

	bearerToken = bearer[1];

	if (typeof bearerToken !== 'undefined') {
		// assign the token
		req.token = bearerToken;

		jwt.verify(req.token, 'my-secret-key', function (err, authData) {
			if (err) {
				res.status(403).json({ message: 'some error occurred' });
			} else {
				req.authData = authData;
				next();
			}
		});
	} else {
		res.status(401).json({ message: 'you are not authorized' });
	}
}

app.get('/route/protected', verifyToken, function (req, res) {
	res.json({ message: 'this is secure route', user: req.authData });
	res.end();
});

app.post('/login', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		req.body.password = md5(req.body.password);
		var info = JSON.parse(data);
		console.log(req.body.password);

		var user = info.users.filter(function (item, email) {
			return item.email === req.body.email;
		});

		var timeStamp = JSON.stringify(new Date().getTime());
		var token = jwt.sign({ user: user, timeStamp: timeStamp }, 'my-secret-key', { expiresIn: '0.016666667h' });

		console.log(token);

		if (user.length !== 0) {
			if (user[0].password === req.body.password) {
				res.status(200).json({ status: 'true', user: user, accessToken: token });
			} else {
				res.status(403).json({ status: 'false', message: 'password not matched' });
			}
		} else {
			res.status(404).json({ status: 'false', message: 'enter valid email' });
		}

		res.end();
	});
});

app.post('/register', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		req.body.password = md5(req.body.password);
		var info = JSON.parse(data);
		var flag = true;

		for (let i = 0; i < info.users.length; i++) {
			if (req.body.email === info.users[i].email) {
				flag = false;
			}
		}

		if (flag) {
			info.users.push(req.body);
		}

		fs.writeFile(__dirname + '/' + "users.json", JSON.stringify(info), function (err) {
			if (err) {
				console.log(err.stack());
				res.writeHeader(200, { 'Content-type': 'application/json' });
				res.write(JSON.stringify({ status: 'false', message: 'record not added' }));
				res.end();
			} else if (!flag) {
				res.writeHeader(200, { 'Content-type': 'application/json' });
				res.write(JSON.stringify({ status: 'taken', message: 'Email already taken' }));
				res.end();
			} else {
				res.writeHeader(200, { 'Content-type': 'application/json' });
				res.write(JSON.stringify({ status: 'true', message: 'record added' }));
				res.end();
			}
		});
	});
});

app.get('/get', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		res.writeHeader(200, { 'Content-type': 'application/json' });
		res.end(data);
	});
});

app.post('/send/email', function (req, res) {
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

app.post('/update/password', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		var info = JSON.parse(data);
		req.body.current = md5(req.body.current);
		req.body.new = md5(req.body.new);
		var flag = false;
		for (var i = 0; i < info.users.length; i++) {
			if (req.body.email === info.users[i].email) {
				if (req.body.current === info.users[i].password) {
					info.users[i].password = req.body.new;
					flag = true;
				} else {
					flag = false;
				}
			}
		}

		fs.writeFile(__dirname + '/' + "users.json", JSON.stringify(info), function (err) {
			if (err) {
				console.log(err.stack());
				res.writeHeader(200, { 'Content-type': 'application/json' });
				res.write(JSON.stringify({ status: 'false', message: 'server down' }));
				res.end();
			} else if (!flag) {
				console.log('password not updated')
				res.writeHeader(200, { 'Content-type': 'application/json' });
				res.write(JSON.stringify({ status: 'notMatch', message: 'current password not matched' }));
				res.end();
			} else {
				console.log('password updated')
				res.writeHeader(200, { 'Content-type': 'application/json' });
				res.write(JSON.stringify({ status: 'true', message: 'password updated' }));
				res.end();
			}
		});
	});
});

const server = app.listen(8081, function () {
	console.log("Server running at 8081");
});