document.addEventListener('DOMContentLoaded', () => {
  const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));
  if (!usuarioActual || usuarioActual.rol !== 'almacenero') {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('form-producto');
  const lista = document.getElementById('lista-productos');
  const mensaje = document.getElementById('mensaje');
  const actualizarBtn = document.getElementById('actualizar');
  const limpiarBtn = document.getElementById('limpiar');
  
  let editandoId = null;

  // Inicializar
  cargarProductos();
  actualizarBtn.disabled = true;

  // Evento submit del formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarProducto();
  });

  // Botón actualizar
  actualizarBtn.addEventListener('click', () => {
    if (!editandoId) {
      mostrarMensaje("⚠️ Primero selecciona un producto para editar", false);
      return;
    }
    guardarProducto();
  });

  // Botón limpiar
  limpiarBtn.addEventListener('click', () => {
    limpiarFormulario();
  });

  function guardarProducto() {
    const idInput = document.getElementById('id');
    const id = editandoId || (idInput && idInput.value.trim()) || crypto.randomUUID();
    const nombre_producto = form.nombre_producto.value.trim();
    const cantidad = form.cantidad.value.trim();
    const empresa = form.empresa_texto.value.trim();
    const fechaIngreso = form.fecha_ingreso.value;
    const fechaSalida = form.fecha_salida.value;

    // Validar campos vacíos
    if (!nombre_producto || !cantidad || !empresa || !fechaIngreso || !fechaSalida) {
      mostrarMensaje("⚠️ Todos los campos son obligatorios", false);
      return;
    }

    // Validar que la fecha de salida sea posterior a la de ingreso
    if (new Date(fechaSalida) <= new Date(fechaIngreso)) {
      mostrarMensaje("⚠️ La fecha de salida debe ser posterior a la de ingreso", false);
      return;
    }

    const [fecha_entrega, hora_entrega] = fechaIngreso.split("T");
    const [fecha_salida, hora_salida] = fechaSalida.split("T");

    let productos = JSON.parse(localStorage.getItem('productosGalaga')) || [];

    // Verificar ID duplicado solo si es nuevo producto
    if (!editandoId && productos.some(p => p.id === id)) {
      mostrarMensaje("❌ Ya existe un producto con este ID", false);
      return;
    }

    if (editandoId) {
      // Actualizar producto existente
      productos = productos.map(p => {
        if (p.id === editandoId) {
          return {
            ...p,
            nombre_producto,
            cantidad,
            empresa,
            fecha_entrega,
            hora_entrega,
            fecha_salida,
            hora_salida,
            actualizado_por: usuarioActual.id,
            actualizado_el: new Date().toISOString()
          };
        }
        return p;
      });
      mostrarMensaje("✅ Producto actualizado correctamente", true);
    } else {
      // Agregar nuevo producto
      productos.push({
        id,
        nombre_producto,
        cantidad,
        empresa,
        fecha_entrega,
        hora_entrega,
        fecha_salida,
        hora_salida,
        creado_por: usuarioActual.id,
        creado_el: new Date().toISOString()
      });
      mostrarMensaje("✅ Producto registrado correctamente", true);
    }

    localStorage.setItem('productosGalaga', JSON.stringify(productos));
    limpiarFormulario();
    cargarProductos();
  }

  function cargarProductos() {
    const productos = JSON.parse(localStorage.getItem('productosGalaga')) || [];
    const propios = productos.filter(p => p.creado_por === usuarioActual.id);
    
    lista.innerHTML = '';

    if (propios.length === 0) {
      lista.innerHTML = `<tr><td colspan="7">No hay productos registrados.</td></tr>`;
      return;
    }

    propios.forEach(p => {
      const ingreso = `${p.fecha_entrega} ${p.hora_entrega}`;
      const salida = `${p.fecha_salida} ${p.hora_salida}`;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${p.id}</td>
        <td>${p.nombre_producto}</td>
        <td>${p.empresa}</td>
        <td>${p.cantidad}</td>
        <td>${ingreso}</td>
        <td>${salida}</td>
        <td>
          <button onclick="editarProducto('${p.id}')">✏️</button>
          <button onclick="eliminarProducto('${p.id}')">🗑️</button>
        </td>
      `;
      lista.appendChild(row);
    });
  }

  function limpiarFormulario() {
    form.reset();
    editandoId = null;
    document.getElementById('id').removeAttribute('readonly');
    actualizarBtn.disabled = true;
    mostrarMensaje("🧹 Formulario limpiado", true);
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
  window.editarProducto = (id) => {
    const productos = JSON.parse(localStorage.getItem('productosGalaga')) || [];
    const p = productos.find(p => p.id === id);
    
    if (!p) {
      mostrarMensaje("❌ Producto no encontrado", false);
      return;
    }

    document.getElementById('id').value = p.id;
    document.getElementById('id').setAttribute('readonly', 'true');
    form.nombre_producto.value = p.nombre_producto;
    form.cantidad.value = p.cantidad;
    form.empresa_texto.value = p.empresa;
    form.fecha_ingreso.value = `${p.fecha_entrega}T${p.hora_entrega}`;
    form.fecha_salida.value = `${p.fecha_salida}T${p.hora_salida}`;

    editandoId = p.id;
    actualizarBtn.disabled = false;
    mostrarMensaje("✏️ Editando producto...", true);
  };

  window.eliminarProducto = (id) => {
    if (confirm("¿Estás seguro de eliminar este producto?\nEsta acción no se puede deshacer.")) {
      let productos = JSON.parse(localStorage.getItem('productosGalaga')) || [];
      productos = productos.filter(p => p.id !== id);
      localStorage.setItem('productosGalaga', JSON.stringify(productos));
      cargarProductos();
      mostrarMensaje("🗑️ Producto eliminado correctamente", true);
    }
  };

  // Validaciones en tiempo real
  const cantidadInput = form.querySelector('#cantidad');
  if (cantidadInput) {
    cantidadInput.addEventListener('input', () => {
      cantidadInput.value = cantidadInput.value.replace(/\D/g, '');
    });
  }

  const nombreProductoInput = form.querySelector('#nombre_producto');
  if (nombreProductoInput) {
    nombreProductoInput.addEventListener('input', () => {
      nombreProductoInput.value = nombreProductoInput.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ0-9\s\.\-]/g, '');
    });
  }
});