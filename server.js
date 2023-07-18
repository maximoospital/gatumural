// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;

app.use(express.static(__dirname + '/public'));

let drawings = [];

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.emit('drawingHistory', drawings);

  socket.on('draw', (data) => {
    drawings.push(data);
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Every 5 minutes, store the drawings in a backup file 
setInterval(() => {
  fs.writeFile('drawings.json', JSON.stringify(drawings), (err) => {
    if (err) throw err;
  });
}, 60 * 60 * 1000);

// Upon load, load the drawings from the backup file
fs.readFile('drawings.json', (err, data) => {
  if (err) throw err;
  drawings = JSON.parse(data.toString());
  io.emit('drawingHistory', drawings);
});