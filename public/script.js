function login(event) {
  event.preventDefault();
  alert("Inicio de sesión simulado.");
  // location.href = "game.html";
}

function register(event) {
  event.preventDefault();
  alert("Registro simulado.");
  // Aquí podrías validar coincidencia de contraseñas
}

function login(event) {
  event.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;

  if (user === 'admin' && pass === 'admin') {
    window.location.href = 'game.html';
  } else {
    const error = document.getElementById('login-error');
    error.style.display = 'block';
  }
}


let playerName = '';
let playerProfession = '';

const nameStep = document.getElementById('name-step');
const professionStep = document.getElementById('profession-step');
const btnConfirmName = document.getElementById('btn-confirm-name');
const nameInput = document.getElementById('player-name');

btnConfirmName.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name === '') {
    alert('Por favor, ingresa un nombre para tu personaje.');
    return;
  }
  playerName = name;
  // Mostrar paso de elegir profesión
  nameStep.classList.add('hidden');
  professionStep.classList.remove('hidden');
});

function selectProfession(profession) {
  playerProfession = profession;

  // Guardar en localStorage
  localStorage.setItem('playerName', playerName);
  localStorage.setItem('playerProfession', playerProfession);

  showGameScreen();
}

function showGameScreen() {
  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';

  document.getElementById('player-display-name').textContent = playerName;
  document.getElementById('player-display-class').textContent = playerProfession;
}

window.onload = () => {
  const savedName = localStorage.getItem('playerName');
  const savedProfession = localStorage.getItem('playerProfession');

  if (savedName && savedProfession) {
    playerName = savedName;
    playerProfession = savedProfession;
    showGameScreen();
  }
};
