// public/client.js
// Client-side Socket.io logic for CSC 436 chat app

// Connect to the server
const socket = io();

// Simple client-side state: list of messages
let messagesState = [];

const messagesList = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');

// Helper: render all messages from messagesState
function renderMessages() {
  messagesList.innerHTML = '';

  messagesState.forEach((msg) => {
    const li = document.createElement('li');

    if (msg.type === 'server') {
      li.classList.add('message', 'server');
      li.textContent = msg.text;
    } else {
      li.classList.add('message');

      if (msg.id === socket.id) {
        li.classList.add('me');
      } else {
        li.classList.add('other');
      }

      const meta = document.createElement('div');
      meta.classList.add('meta');
      meta.textContent = `User ${msg.id.slice(0, 4)} • ${msg.time}`;

      const textDiv = document.createElement('div');
      textDiv.classList.add('text');
      textDiv.textContent = msg.text;

      li.appendChild(meta);
      li.appendChild(textDiv);
    }

    messagesList.appendChild(li);
  });

  // Scroll to bottom
  messagesList.scrollTop = messagesList.scrollHeight;
}

// When the server sends the chat history
socket.on('chatHistory', (history) => {
  messagesState = history;
  renderMessages();
});

// When a new chatMessage is broadcast from server
socket.on('chatMessage', (msg) => {
  messagesState.push(msg);
  renderMessages();
});

// When the server sends a serverMessage (join/leave)
socket.on('serverMessage', (text) => {
  messagesState.push({
    type: 'server',
    text
  });
  renderMessages();
});

// Handle form submit
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (text.length === 0) return;

  // Emit chatMessage event to the server
  socket.emit('chatMessage', text);

  // Clear input
  input.value = '';
  input.focus();
});
