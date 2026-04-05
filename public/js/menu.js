const usuario = sessionStorage.getItem('usuario');
const rol     = sessionStorage.getItem('rol');
if (!usuario) window.location.href = '/';

document.getElementById('nombre-usuario').textContent = usuario;
document.getElementById('rol-usuario').textContent    = rol;

// Configurar botones según rol
configurarBotonesPorRol();

function configurarBotonesPorRol() {
    if (rol === 'Administrador') {
        // Admin ve TODO — no ocultar nada
        return;
    }

    if (rol === 'Empleado') {
        // Empleado no ve Gestión de Usuarios
        document.getElementById('btn-usuarios').style.display = 'none';
        return;
    }

    if (rol === 'Usuario') {
        // Usuario solo ve Búsqueda Inteligente y Cerrar Sesión
        const botonesOcultar = [
            'btn-registro',
            'btn-bd',
            'btn-alertas',
            'btn-dashboard',
            'btn-usuarios'
        ];
        botonesOcultar.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        return;
    }
}

// Reloj en tiempo real
function actualizarHora() {
    const ahora = new Date();
    document.getElementById('fecha-hora').textContent =
        '📅 ' + ahora.toLocaleDateString('es-CO') +
        '  🕐 ' + ahora.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' });
}
actualizarHora();
setInterval(actualizarHora, 1000);

// Verificar alertas automáticamente al cargar
window.addEventListener('load', verificarAlertas);

async function verificarAlertas() {
    try {
        const res   = await fetch('/api/radicados');
        const datos = await res.json();
        const hoy   = new Date();
        hoy.setHours(0, 0, 0, 0);

        const vencidos = (datos.datos || []).filter(r => {
            if (r.estado === 'Respondido' || r.estado === 'Archivado') return false;
            if (!r.fecha_est_respuesta) return false;

            // Parsear fecha DD/MM/YYYY o M/D/YYYY
            const partes = r.fecha_est_respuesta.split('/');
            if (partes.length !== 3) return false;
            const fechaLimite = new Date(partes[2], partes[1] - 1, partes[0]);
            return fechaLimite < hoy;
        });

        const badge = document.getElementById('badge-alertas');
        const alerta = document.getElementById('alerta-vencidos');
        const textoAlerta = document.getElementById('alerta-texto');

        if (vencidos.length > 0) {
            // Mostrar badge en botón
            badge.textContent = vencidos.length;
            badge.classList.remove('oculto');

            // Mostrar banner de alerta
            textoAlerta.textContent =
                '⚠ ALERTA: ' + vencidos.length +
                ' documento(s) VENCIDO(S) requieren atención inmediata.';
            alerta.classList.remove('oculto');
        } else {
            badge.classList.add('oculto');
            alerta.classList.add('oculto');
        }

    } catch (err) {
        console.error('Error verificando alertas:', err);
    }
}

// Navegación
function ir(pagina) {
    if (pagina !== 'busqueda.html' && pagina !== 'alertas.html' &&
        pagina !== 'dashboard.html' && rol === 'Usuario') {
        alert('No tiene permisos para acceder a esta sección.');
        return;
    }
    if (pagina === 'usuarios.html' && rol !== 'Administrador') {
        alert('Solo el Administrador puede gestionar usuarios.');
        return;
    }
    window.location.href = '/pages/' + pagina;
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Desea cerrar sesión?')) {
        sessionStorage.clear();
        window.location.href = '/';
    }
}