// server.js
// CSC 436 - Project 5
// Simple real-time chat server using Express + Socket.io

const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Use environment port if available (for deployment), otherwise 3000
const PORT = process.env.PORT || 3000;

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Keep simple in-memory list of messages (client-side will also track state)
let messageHistory = [];

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send current chat history only to the newly connected user
  socket.emit('chatHistory', messageHistory);

  // Notify others that a new user joined
  socket.broadcast.emit(
    'serverMessage',
    `User ${socket.id.slice(0, 4)} joined the chat`
  );

  // Listen for chat messages from this client
  socket.on('chatMessage', (text) => {
    const msg = {
      id: socket.id,
      text,
      time: new Date().toLocaleTimeString()
    };

    // Save to history (state on the server)
    messageHistory.push(msg);

    // Broadcast to everyone (including the sender)
    io.emit('chatMessage', msg);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    io.emit(
      'serverMessage',
      `User ${socket.id.slice(0, 4)} left the chat`
    );
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
