const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Usuarios en memoria (sin persistencia)
let users = {};

// Servir archivos estáticos en public
app.use(express.static(path.join(__dirname, 'public')));

// Servir el index.html de public cuando se accede a la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO
io.on('connection', (socket) => {
  socket.on('register', ({ username, password }, callback) => {
    if (!username || !password) {
      return callback({ success: false, message: 'Usuario y contraseña son obligatorios.' });
    }
    if (users[username]) {
      return callback({ success: false, message: 'Usuario ya existe.' });
    }
    users[username] = { password, clicks: 0 };
    callback({ success: true });
    io.emit('updateRanking', getRankingArray());
  });

  socket.on('login', ({ username, password }, callback) => {
    if (!users[username] || users[username].password !== password) {
      return callback({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }
    callback({ success: true });
  });

  socket.on('getUserClicks', (username) => {
    const clicks = users[username]?.clicks || 0;
    socket.emit('userClicks', clicks);
  });

  socket.on('getRanking', () => {
    socket.emit('updateRanking', getRankingArray());
  });

  socket.on('incrementClick', (username) => {
    if (users[username]) {
      users[username].clicks++;
      socket.emit('clickUpdated', users[username].clicks);
      io.emit('updateRanking', getRankingArray());
    }
  });
});

function getRankingArray() {
  return Object.entries(users)
    .map(([username, data]) => ({ username, clicks: data.clicks }))
    .sort((a, b) => b.clicks - a.clicks);
}

http.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
