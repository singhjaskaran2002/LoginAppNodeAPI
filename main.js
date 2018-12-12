const express = require('express');
const app = express();
const fs = require('fs');
var md5 = require('md5');
var cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.json(), cors());

app.post('/login', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		res.header("Access-Control-Allow-Origin", "http://localhost:4200");
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

		if (index < 0) {
			res.writeHeader(200, { 'Content-type': 'application/json' });
			res.write(JSON.stringify({ status: 'false', message: 'Invalid email and password' }));
			res.end();
		} else {
			res.writeHeader(200, { 'Content-type': 'application/json' }); false
			res.write(JSON.stringify({ status: 'true', message: 'Logged in', accessToken: '2002' }));
			res.end();
		}
	});
});

app.post('/register', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		res.header("Access-Control-Allow-Origin", "http://localhost:4200");
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
		var info = JSON.parse(data);
		if (err) {
			res.writeHeader(200, { 'Content-type': 'application/json' });
			res.write(JSON.stringify({ status: 'false', message: 'File not found' }));
			res.end();
		} else {
			res.writeHeader(200, { 'Content-type': 'application/json' });
			res.write(JSON.stringify({ status: 'true', message: 'records sent' }));
			res.end(info);
		}
	});
});

const server = app.listen(8081, function () {
	console.log("Server running at 8081");
});