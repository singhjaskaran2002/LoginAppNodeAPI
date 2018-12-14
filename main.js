const express = require('express');
const app = express();
const fs = require('fs');
var md5 = require('md5');
var cors = require('cors');
const bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

app.use(bodyParser.json(), cors());

app.post('/login', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		res.header("Access-Control-Allow-Origin", "http://localhost:4200");
		req.body.password = md5(req.body.password);
		var info = JSON.parse(data);
		var index = -1;

		for (let i = 0; i < info.users.length; i++) {
			if (req.body.email === info.users[i].email) {
				if (req.body.password === info.users[i].password) {
					index = info.users.findIndex(function (item, i) {
						return item.email === req.body.email;
					});
				}
			}
		}
		var payload = req.body.email;
		var SECRET = 'ggd98ff6d46df684f6d4654fd123fg65f4g684g65fd41g56fd4654';
		if (index < 0) {
			res.writeHeader(200, { 'Content-type': 'application/json' });
			res.write(JSON.stringify({ status: 'false', message: 'Invalid email and password' }));
			res.end();
		} else {
			var token = jwt.sign(payload, SECRET);
			res.send({ status: 'true', message: 'Logged in', accessToken: token });
			res.end();
		}
	});
});

app.post('/register', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		res.header("Access-Control-Allow-Origin", "http://localhost:4200");
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