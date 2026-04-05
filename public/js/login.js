// Permitir ingresar con Enter en el campo contraseña
document.getElementById('contrasena')
    .addEventListener('keypress', function(e) {
        if (e.key === 'Enter') iniciarSesion();
    });

// Función principal de login
async function iniciarSesion() {
    const usuario    = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    const btn        = document.getElementById('btn-ingresar');
    const mensaje    = document.getElementById('mensaje');

    // Validar campos vacíos
    if (!usuario || !contrasena) {
        mostrarMensaje('Complete usuario y contraseña', 'error');
        return;
    }

    // Deshabilitar botón mientras carga
    btn.disabled    = true;
    btn.textContent = 'Verificando...';

    try {
        // Llamar a la API de login
        const respuesta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, contrasena })
        });

        const datos = await respuesta.json();

        if (datos.ok) {
            // Guardar datos en sessionStorage
            sessionStorage.setItem('usuario', datos.usuario);
            sessionStorage.setItem('rol',     datos.rol);

            mostrarMensaje(
                'Bienvenido ' + datos.usuario + ' — ' + datos.rol,
                'exito'
            );

            // Redirigir al menú después de 1 segundo
            setTimeout(() => {
                window.location.href = '/pages/menu.html';
            }, 1000);

        } else {
            mostrarMensaje(datos.mensaje, 'error');
            btn.disabled    = false;
            btn.textContent = '🔑 INGRESAR AL SISTEMA';
        }

    } catch (error) {
        mostrarMensaje('Error de conexión con el servidor', 'error');
        btn.disabled    = false;
        btn.textContent = '🔑 INGRESAR AL SISTEMA';
    }
}

// Mostrar mensaje de estado
function mostrarMensaje(texto, tipo) {
    const msg = document.getElementById('mensaje');
    msg.textContent = texto;
    msg.className   = 'mensaje ' + tipo;
}