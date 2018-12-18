const express = require('express');
const app = express();
var cors = require('cors');
const bodyParser = require('body-parser');
app.use(bodyParser.json(), cors({ origin: 'http://localhost:4200' }));

// importing routes
var userRouter = require('./user');
const con = require('./connection');

// using imported files
app.use('/user', userRouter);

const server = app.listen(8081, function () {
	console.log("Server running at 8081");
});
