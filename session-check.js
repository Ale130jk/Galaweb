document.addEventListener('DOMContentLoaded', () => {
  const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));

  if (!usuarioActual) {
    alert("⛔ No has iniciado sesión.");
    window.location.href = "index.html";
    return;
  }

  const rol = usuarioActual.rol;

  // Redirige si no corresponde el rol al dashboard
  if (rol === 'almacenero' && !location.pathname.includes('dashboard-almacenero')) {
    window.location.href = "dashboard-almacenero.html";
  }

  if (rol === 'jefe' && !location.pathname.includes('dashboard-jefe')) {
    window.location.href = "dashboard-jefe.html";
  }
});
