const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

let connectedUsers = [];

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
		io.emit('chat message', msg);
  });

	socket.on('set-user-name', (data) => {
		if (connectedUsers.findIndex((e) => e.username === data.username) === -1) {
			connectedUsers.push(data);
		}

		console.log({ connectedUsers });
		socket.username = data.username;
	});

	socket.on('call-user-name', (data) => {
		if (connectedUsers.findIndex((e) => e.username === data.callee) === -1) {
			io.emit('callee-not-online', {
				caller: data.caller
			});
			return;
		}

		const room = `${data.caller}-CALL-${data.callee}`;
		socket.join(room);

		io.emit('invite-callee', {
			room,
			callee: data.callee,
		});
	});

	socket.on('join-room', (room) => {
		console.log('joining...');
		socket.join(room);
	});

	socket.on('disconnect', function () {
		var connectionMessage = socket.username + " Disconnected from Socket " + socket.id;
		console.log(connectionMessage);

		connectedUsers = connectedUsers.filter((e) => e.username !== socket.username);
		console.log({ connectedUsers });
	});
});


