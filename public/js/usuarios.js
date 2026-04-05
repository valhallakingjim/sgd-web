const usuario = sessionStorage.getItem('usuario');
const rol     = sessionStorage.getItem('rol');

// Solo admin puede acceder
if (!usuario || rol !== 'Administrador') {
    alert('Acceso denegado. Solo el Administrador puede gestionar usuarios.');
    window.location.href = '/pages/menu.html';
}

window.addEventListener('load', cargarUsuarios);

async function cargarUsuarios() {
    const cuerpo = document.getElementById('cuerpo-usuarios');
    cuerpo.innerHTML = '<tr><td colspan="5" class="cargando">Cargando...</td></tr>';

    try {
        const res   = await fetch('/api/usuarios');
        const datos = await res.json();

        if (!datos.ok || datos.usuarios.length === 0) {
            cuerpo.innerHTML =
                '<tr><td colspan="5" class="cargando">No hay usuarios registrados.</td></tr>';
            document.getElementById('total-usuarios').textContent = '👥 Total: 0 usuarios';
            return;
        }

        document.getElementById('total-usuarios').textContent =
            '👥 Total: ' + datos.usuarios.length + ' usuario(s)';

        cuerpo.innerHTML = datos.usuarios.map((u, idx) => {
            const claseRol = {
                'Administrador': 'admin',
                'Empleado':      'empleado',
                'Usuario':       'usuario'
            }[u.rol] || 'usuario';

            const esActivo  = u.estado === 'Activo';
            const esAdmin   = u.usuario === 'admin';

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${u.usuario}</strong></td>
                    <td>
                        <span class="badge-rol ${claseRol}">${u.rol}</span>
                    </td>
                    <td>
                        <span class="badge-estado ${esActivo ? 'activo' : 'inactivo'}">
                            ${u.estado}
                        </span>
                    </td>
                    <td>
                        ${!esAdmin ? `
                            <button class="btn-accion ${esActivo ? 'desactivar' : 'activar'}"
                                    onclick="cambiarEstado('${u.usuario}', ${esActivo})">
                                ${esActivo ? '🔴 Desactivar' : '🟢 Activar'}
                            </button>
                            <button class="btn-accion contrasena"
                                    onclick="cambiarContrasena('${u.usuario}')">
                                🔑 Contraseña
                            </button>
                        ` : '<span style="color:#888;font-size:0.8rem">Usuario principal</span>'}
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Error:', err);
        cuerpo.innerHTML =
            '<tr><td colspan="5" class="cargando">Error al cargar usuarios.</td></tr>';
    }
}

function mostrarFormulario() {
    document.getElementById('form-nuevo').classList.remove('oculto');
    document.getElementById('nuevo-usuario').focus();
}

function ocultarFormulario() {
    document.getElementById('form-nuevo').classList.add('oculto');
    document.getElementById('nuevo-usuario').value    = '';
    document.getElementById('nueva-contrasena').value = '';
    document.getElementById('nuevo-rol').value        = '';
    document.getElementById('mensaje-form').className = 'mensaje oculto';
}

async function agregarUsuario() {
    const usr = document.getElementById('nuevo-usuario').value.trim();
    const pwd = document.getElementById('nueva-contrasena').value.trim();
    const rl  = document.getElementById('nuevo-rol').value;

    if (!usr) { mostrarMsg('El nombre de usuario es obligatorio.', 'error'); return; }
    if (!pwd) { mostrarMsg('La contraseña es obligatoria.',         'error'); return; }
    if (!rl)  { mostrarMsg('Seleccione un rol.',                    'error'); return; }
    if (pwd.length < 4) { mostrarMsg('La contraseña debe tener al menos 4 caracteres.', 'error'); return; }

    try {
        const res  = await fetch('/api/usuarios', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ usuario: usr, contrasena: pwd, rol: rl })
        });
        const resp = await res.json();

        if (resp.ok) {
            mostrarMsg('✅ Usuario ' + usr + ' creado correctamente.', 'exito');
            setTimeout(() => {
                ocultarFormulario();
                cargarUsuarios();
            }, 1500);
        } else {
            mostrarMsg(resp.mensaje, 'error');
        }
    } catch (err) {
        mostrarMsg('Error de conexión.', 'error');
    }
}

async function cambiarEstado(usr, estaActivo) {
    const accion = estaActivo ? 'desactivar' : 'activar';
    if (!confirm('¿Desea ' + accion + ' al usuario ' + usr + '?')) return;

    try {
        const res  = await fetch('/api/usuarios/' + usr + '/estado', {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ estado: estaActivo ? 'Inactivo' : 'Activo' })
        });
        const resp = await res.json();
        if (resp.ok) cargarUsuarios();
        else alert(resp.mensaje);
    } catch (err) {
        alert('Error de conexión.');
    }
}

async function cambiarContrasena(usr) {
    const nueva = prompt('Nueva contraseña para ' + usr + ':');
    if (!nueva || nueva.trim() === '') return;
    if (nueva.length < 4) { alert('La contraseña debe tener al menos 4 caracteres.'); return; }

    try {
        const res  = await fetch('/api/usuarios/' + usr + '/contrasena', {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ contrasena: nueva.trim() })
        });
        const resp = await res.json();
        if (resp.ok) alert('✅ Contraseña actualizada correctamente.');
        else alert(resp.mensaje);
    } catch (err) {
        alert('Error de conexión.');
    }
}

function mostrarMsg(texto, tipo) {
    const msg   = document.getElementById('mensaje-form');
    msg.textContent = texto;
    msg.className   = 'mensaje ' + tipo;
}