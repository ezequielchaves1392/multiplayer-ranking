const socket = io();
const form = document.getElementById('loginForm');
const msgDiv = document.getElementById('msg');
const rankingTableBody = document.querySelector('#rankingTable tbody');

form.addEventListener('submit', e => {
  e.preventDefault();
  msgDiv.textContent = '';
  msgDiv.className = '';

  const username = form.username.value.trim();
  const password = form.password.value.trim();

  if (!username || !password) {
    msgDiv.textContent = 'Por favor, completa todos los campos.';
    msgDiv.className = 'error-msg';
    return;
  }

  socket.emit('login', { username, password }, response => {
    if (response.success) {
      localStorage.setItem('username', username);
      window.location.href = '../game/game.html';
    } else {
      msgDiv.textContent = response.message || 'Error al iniciar sesión.';
      msgDiv.className = 'error-msg';
    }
  });
});

socket.on('updateRanking', ranking => {
  rankingTableBody.innerHTML = '';
  ranking.forEach((user, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${index + 1}</td><td>${user.username}</td><td>${user.clicks}</td>`;
    rankingTableBody.appendChild(tr);
  });
});

socket.emit('getRanking');
