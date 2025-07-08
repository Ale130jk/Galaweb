document.addEventListener('DOMContentLoaded', () => {
  const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));
  if (!usuarioActual) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('form-empresa');
  const lista = document.getElementById('lista-empresas');
  const cancelarBtn = document.getElementById('cancelar-edicion');
  
  // Crear elemento de mensaje
  const mensaje = document.createElement('div');
  mensaje.className = 'mensaje';
  form.insertBefore(mensaje, form.firstChild);
  
  let editandoId = null;

  cargarEmpresas();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = form.querySelector('#nombre').value.trim();
    const ruc = form.querySelector('#ruc').value.trim();
    const direccion = form.querySelector('#direccion').value.trim();

    // Validar campos vacíos
    if (!nombre || !ruc || !direccion) {
      mostrarMensaje("⚠️ Todos los campos son obligatorios", false);
      return;
    }

    // Validar RUC (11 dígitos)
    if (ruc.length !== 11) {
      mostrarMensaje("⚠️ El RUC debe tener exactamente 11 dígitos", false);
      return;
    }

    let empresas = JSON.parse(localStorage.getItem('empresas')) || [];

    // Verificar RUC duplicado
    const existeRuc = empresas.some(emp => {
      return emp.ruc === ruc && (!editandoId || emp.id !== editandoId);
    });

    if (existeRuc) {
      mostrarMensaje("❌ Ya existe una empresa registrada con este RUC", false);
      return;
    }

    if (editandoId) {
      // Actualizar empresa existente
      empresas = empresas.map(emp => {
        if (emp.id === editandoId) {
          return {
            ...emp,
            nombre,
            ruc,
            direccion,
            actualizado_por: usuarioActual.username,
            actualizado_el: new Date().toISOString()
          };
        }
        return emp;
      });
      mostrarMensaje("✅ Empresa actualizada correctamente", true);
      
      // Resetear modo edición
      editandoId = null;
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = '💾 Guardar';
      form.ruc.removeAttribute('readonly');
    } else {
      // Agregar nueva empresa
      empresas.push({
        id: crypto.randomUUID(),
        nombre,
        ruc,
        direccion,
        creado_por: usuarioActual.username,
        creado_el: new Date().toISOString()
      });
      mostrarMensaje("✅ Empresa registrada correctamente", true);
    }

    localStorage.setItem('empresas', JSON.stringify(empresas));
    form.reset();
    cargarEmpresas();
  });

  function cargarEmpresas() {
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    const propias = empresas.filter(e => e.creado_por === usuarioActual.username);

    lista.innerHTML = '';

    if (propias.length === 0) {
      lista.innerHTML = '<tr><td colspan="4">No hay empresas registradas aún.</td></tr>';
      return;
    }

    propias.forEach(e => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${e.ruc}</td>
        <td>${e.nombre}</td>
        <td>${e.direccion}</td>
        <td>
          <button onclick="editarEmpresa('${e.id}')">✏️</button>
          <button onclick="eliminarEmpresa('${e.id}')">🗑️</button>
        </td>
      `;
      lista.appendChild(row);
    });
  }

  function mostrarMensaje(texto, exito) {
    mensaje.textContent = texto;
    mensaje.className = 'mensaje ' + (exito ? 'success' : 'error');
    setTimeout(() => {
      mensaje.textContent = '';
      mensaje.className = 'mensaje';
    }, 3000);
  }

  // Funciones globales para botones
  window.editarEmpresa = (id) => {
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    const empresa = empresas.find(e => e.id === id);

    if (!empresa) {
      mostrarMensaje("❌ Empresa no encontrada", false);
      return;
    }

    form.nombre.value = empresa.nombre || '';
    form.ruc.value = empresa.ruc || '';
    form.direccion.value = empresa.direccion || '';

    form.ruc.setAttribute('readonly', 'true');
    editandoId = id;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = '✅ Actualizar';

    mostrarMensaje("✏️ Editando empresa...", true);
  };

  window.eliminarEmpresa = (id) => {
    if (confirm("¿Estás seguro de eliminar esta empresa?\nEsta acción no se puede deshacer.")) {
      let empresas = JSON.parse(localStorage.getItem('empresas')) || [];
      empresas = empresas.filter(e => e.id !== id);
      localStorage.setItem('empresas', JSON.stringify(empresas));
      cargarEmpresas();
      mostrarMensaje("🗑️ Empresa eliminada correctamente", true);
    }
  };

  // Cancelar edición
  if (cancelarBtn) {
    cancelarBtn.addEventListener('click', () => {
      form.reset();
      editandoId = null;
      form.ruc.removeAttribute('readonly');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = '💾 Guardar';
      mostrarMensaje("❌ Edición cancelada", false);
    });
  }

  // Validaciones en tiempo real
  const rucInput = form.querySelector('#ruc');
  if (rucInput) {
    rucInput.addEventListener('input', () => {
      rucInput.value = rucInput.value.replace(/\D/g, '').slice(0, 11);
      if (rucInput.value.length !== 11) {
        rucInput.setCustomValidity('El RUC debe tener 11 dígitos');
      } else {
        rucInput.setCustomValidity('');
      }
    });
  }

  const nombreInput = form.querySelector('#nombre');
  if (nombreInput) {
    nombreInput.addEventListener('input', () => {
      nombreInput.value = nombreInput.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, '');
    });
  }

  const direccionInput = form.querySelector('#direccion');
  if (direccionInput) {
    direccionInput.addEventListener('input', () => {
      direccionInput.value = direccionInput.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ0-9\s\.\-\,#]/g, '');
    });
  }
});