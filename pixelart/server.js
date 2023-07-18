const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const history = [];

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.emit('history', history);

  socket.on('drawing', (data) => {
    if (history.length >= 1000) {
      history.shift(); // Remove the oldest drawing data if the history exceeds 1000 items
    }
    history.push(data);
    socket.broadcast.emit('drawing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
