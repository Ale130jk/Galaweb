import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 Iniciando register.js...');
  
  const regForm = document.getElementById('register-form');
  const regMessage = document.getElementById('register-message');
  const regButton = document.getElementById('register-button');

  if (!regForm || !regMessage || !regButton) {
    console.error('❌ No se encontraron elementos del formulario de registro');
    return;
  }

  function mostrarMensaje(texto, tipo = 'error') {
    console.log(`📢 Mensaje de registro: ${texto}`);
    if (regMessage) {
      regMessage.textContent = texto;
      regMessage.className = `mensaje ${tipo}`;
      if (tipo === 'error') {
        regMessage.style.color = '#e74c3c';
        regMessage.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
      } else if (tipo === 'success') {
        regMessage.style.color = '#27ae60';
        regMessage.style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
      } else if (tipo === 'loading') {
        regMessage.style.color = '#3498db';
        regMessage.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
      }
      regMessage.style.padding = '10px';
      regMessage.style.borderRadius = '5px';
      regMessage.style.marginTop = '10px';
      regMessage.style.fontWeight = 'bold';
    }
    if (tipo === 'error') alert(texto);
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  }

  function validarUsername(username) {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
  }

  regButton.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('🔄 Iniciando proceso de registro...');

    try {
      regButton.disabled = true;
      regButton.textContent = 'Registrando...';
      mostrarMensaje('🔄 Procesando registro...', 'loading');

      const nombre = document.getElementById('reg-nombre')?.value.trim();
      const apellido = document.getElementById('reg-apellido')?.value.trim();
      const username = document.getElementById('reg-username')?.value.trim();
      const email = document.getElementById('reg-email')?.value.trim();
      const password = document.getElementById('reg-password')?.value;
      const confirmPassword = document.getElementById('reg-confirm-password')?.value;
      const rol = document.getElementById('reg-rol')?.value;

      if (!nombre || !apellido || !username || !email || !password || !confirmPassword || !rol) {
        mostrarMensaje('❌ Todos los campos son obligatorios.', 'error');
        return;
      }
      if (!validarUsername(username)) {
        mostrarMensaje('❌ El username debe tener 3-20 caracteres, solo letras, números y guiones bajos.', 'error');
        return;
      }
      if (!validarEmail(email)) {
        mostrarMensaje('❌ El formato del email no es válido.', 'error');
        return;
      }
      if (password !== confirmPassword) {
        mostrarMensaje('❌ Las contraseñas no coinciden.', 'error');
        return;
      }
      if (!validarPassword(password)) {
        mostrarMensaje('❌ La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.', 'error');
        return;
      }
      if (!['jefe', 'almacenero'].includes(rol)) {
        mostrarMensaje('❌ Debe seleccionar un rol válido.', 'error');
        return;
      }

      // 1. Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido,
            username,
            rol
          }
        }
      });

      if (authError) {
        mostrarMensaje(`❌ Error al registrar en Auth: ${authError.message}`, 'error');
        return;
      }

      // 2. (Opcional) Insertar en tu tabla usuarios
      const { error: errorInsert } = await supabase
        .from('usuarios')
        .insert([{
          nombre,
          apellido,
          username,
          email,
          rol,
          fecha_registro: new Date().toISOString()
        }]);

      if (errorInsert) {
        mostrarMensaje(`❌ Error al guardar datos extra: ${errorInsert.message}`, 'error');
        return;
      }

      mostrarMensaje('✅ ¡Registro exitoso! Revisa tu correo para confirmar la cuenta.', 'success');
      regForm.reset();

      setTimeout(() => {
        const checkBox = document.getElementById('check');
        if (checkBox) {
          checkBox.checked = false;
        } else {
          window.location.href = './index.html';
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Error inesperado en registro:', error);
      mostrarMensaje('❌ Error inesperado. Intenta de nuevo.', 'error');
    } finally {
      regButton.disabled = false;
      regButton.textContent = 'Registrarse';
    }
  });

  // Validación en tiempo real (opcional pero mejora UX)
  document.getElementById('reg-username')?.addEventListener('blur', (e) => {
    const username = e.target.value.trim();
    if (username && !validarUsername(username)) {
      mostrarMensaje('⚠️ Username inválido: 3-20 caracteres, solo letras, números y _', 'error');
    }
  });

  document.getElementById('reg-email')?.addEventListener('blur', (e) => {
    const email = e.target.value.trim();
    if (email && !validarEmail(email)) {
      mostrarMensaje('⚠️ Formato de email inválido', 'error');
    }
  });

  document.getElementById('reg-confirm-password')?.addEventListener('blur', (e) => {
    const password = document.getElementById('reg-password')?.value;
    const confirmPassword = e.target.value;
    if (password && confirmPassword && password !== confirmPassword) {
      mostrarMensaje('⚠️ Las contraseñas no coinciden', 'error');
    }
  });

  console.log('✅ Register.js configurado correctamente');
});