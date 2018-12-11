const express = require('express');
const app = express();
const fs = require('fs');
var md5 = require('md5');
var cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.json(), cors());

app.get('/listUsers', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		console.log(data);
		console.log("api called");
		res.header("Access-Control-Allow-Origin", "http://localhost:4200");
		// res.header("Access-Control-Allow-Headers");RegisterComponent
		res.writeHeader(200, { 'Content-type': 'application/json' });
		res.end(data);
	});
});

app.post('/login', function (req, res) {
	fs.readFile(__dirname + '/' + "users.json", function (err, data) {
		console.log('request body: ', req.body);
		res.header("Access-Control-Allow-Origin", "http://localhost:4200");
		// res.header("Access-Control-Allow-Headers", {'Content-type':'application/json'});
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
			res.writeHeader(200, { 'Content-type': 'application/json' });
			res.write(JSON.stringify({ status: 'true', message: 'Logged in' }));
			res.end();
		}
	});
});

const server = app.listen(8081, function () {
	console.log("Server running at 8081");
});