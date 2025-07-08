document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const mensajeLogin = document.getElementById('login-error-message');

  let intentosFallidos = 0;
  let bloqueadoHasta = null;

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();

    if (bloqueadoHasta && Date.now() < bloqueadoHasta) {
      mensajeLogin.textContent = "⛔ Has sido bloqueado por 60 segundos.";
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.username === username && u.password === password);

    if (!usuario) {
      intentosFallidos++;
      mensajeLogin.textContent = "❌ Usuario o contraseña incorrecta";

      if (intentosFallidos >= 3) {
        bloqueadoHasta = Date.now() + 60000;
        mensajeLogin.textContent = "⛔ Bloqueado por 60 segundos por intentos fallidos.";
      }
      return;
    }

    sessionStorage.setItem('usuarioActual', JSON.stringify(usuario));

    // Redirección según rol
    if (usuario.rol === 'almacenero') {
      window.location.href = 'dashboard-almacenero.html';
    } else if (usuario.rol === 'jefe') {
      window.location.href = 'dashboard-jefe.html';
    }
  });
});
