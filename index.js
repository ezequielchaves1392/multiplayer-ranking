const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://multiplayer-ranking-default-rtdb.firebaseio.com/"
});

const db = admin.database();
const usersRef = db.ref('users');

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {

  // Registro
  socket.on('register', async ({ username, password }, callback) => {
    if (!username || !password) {
      return callback({ success: false, message: 'Usuario y contraseña son obligatorios.' });
    }

    try {
      const snapshot = await usersRef.child(username).once('value');
      if (snapshot.exists()) {
        return callback({ success: false, message: 'Usuario ya existe.' });
      }
      await usersRef.child(username).set({ password, clicks: 0 });
      callback({ success: true });
      broadcastRanking();
    } catch (error) {
      console.error(error);
      callback({ success: false, message: 'Error en registro.' });
    }
  });

  // Login
  socket.on('login', async ({ username, password }, callback) => {
    try {
      const snapshot = await usersRef.child(username).once('value');
      if (!snapshot.exists() || snapshot.val().password !== password) {
        return callback({ success: false, message: 'Usuario o contraseña incorrectos.' });
      }
      callback({ success: true });
    } catch (error) {
      console.error(error);
      callback({ success: false, message: 'Error en login.' });
    }
  });

  // Obtener clicks usuario
  socket.on('getUserClicks', async (username) => {
    try {
      const snapshot = await usersRef.child(username).once('value');
      const clicks = snapshot.exists() ? snapshot.val().clicks || 0 : 0;
      socket.emit('userClicks', clicks);
    } catch (error) {
      console.error(error);
      socket.emit('userClicks', 0);
    }
  });

  // Obtener ranking completo
  socket.on('getRanking', async () => {
    await broadcastRanking();
  });

  // Incrementar clicks usuario
  socket.on('incrementClick', async (username) => {
    try {
      const userRef = usersRef.child(username);
      const snapshot = await userRef.once('value');
      if (!snapshot.exists()) return;
      const clicks = (snapshot.val().clicks || 0) + 1;
      await userRef.update({ clicks });
      socket.emit('clickUpdated', clicks);
      broadcastRanking();
    } catch (error) {
      console.error(error);
    }
  });

  // Función para emitir ranking actualizado
  async function broadcastRanking() {
    try {
      const snapshot = await usersRef.once('value');
      const data = snapshot.val() || {};
      const rankingArray = Object.entries(data)
        .map(([username, info]) => ({ username, clicks: info.clicks || 0 }))
        .sort((a, b) => b.clicks - a.clicks);
      io.emit('updateRanking', rankingArray);
    } catch (error) {
      console.error('Error al obtener ranking:', error);
    }
  }
});

http.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
