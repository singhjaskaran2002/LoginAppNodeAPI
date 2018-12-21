const express = require('express');
const app = express();
var cors = require('cors');
const bodyParser = require('body-parser');
app.use(bodyParser.json(), cors({ origin: 'http://192.168.1.66:4200' }));

// importing routes
var userRouter = require('./user');
var protected = require('./protected');

const con = require('./connection');

// using imported files
app.use('/user', userRouter);
app.use('/protected', protected);

const server = app.listen(8081,'192.168.1.66' , function () {
    console.log("Server running at 8081");
});

var usersOnline = [];

var io = require('socket.io').listen(server);

io.on('connection', (socket) => {
    usersOnline.push(socket.id);
    console.log('Users Online: ', usersOnline.length);

    socket.on('disconnect', () => {
        usersOnline.splice(usersOnline.indexOf(socket.id), 1);
        console.log('Users Online: ', usersOnline.length);
    });

    socket.on('message_sent', function (data) {
        console.log('message sent: ', data);
        var s = 'message_received' + data.receiver;
        console.log(s);
        io.emit('message_received' + data.receiver, { sender: data.sender, receiver: data.receiver, message: data.message });
        io.emit('message_received' + data.sender, { sender: data.sender, receiver: data.receiver, message: data.message });
    });
});
