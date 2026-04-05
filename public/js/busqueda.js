// Verificar sesión
const usuario = sessionStorage.getItem('usuario');
if (!usuario) window.location.href = '/';

let todosLosRadicados = [];

// Cargar todos los radicados al iniciar
window.addEventListener('load', async () => {
    const res   = await fetch('/api/radicados');
    const datos = await res.json();
    todosLosRadicados = datos.datos || [];
});

// Búsqueda en tiempo real
function buscarEnTiempoReal() {
    const termino = document.getElementById('campo-busqueda')
        .value.trim().toLowerCase();
    const filtro  = document.getElementById('filtro').value;
    const cuerpo  = document.getElementById('cuerpo-resultados');
    const contador = document.getElementById('total-resultados');

    if (!termino) {
        cuerpo.innerHTML =
            '<tr><td colspan="8" class="cargando">Ingrese un término de búsqueda</td></tr>';
        contador.textContent = 'Ingrese un término para buscar';
        return;
    }

    // Filtrar según criterio
    const resultados = todosLosRadicados.filter(r => {
        switch (filtro) {
            case 'radicado':
                return r.num_radicado?.toLowerCase().includes(termino);
            case 'destinatario':
                return r.nombre_destinatario?.toLowerCase().includes(termino);
            case 'remitente':
                return r.nombre_remitente?.toLowerCase().includes(termino);
            case 'asunto':
                return r.asunto?.toLowerCase().includes(termino);
            default: // todos
                return (
                    r.num_radicado?.toLowerCase().includes(termino)        ||
                    r.nombre_destinatario?.toLowerCase().includes(termino)  ||
                    r.nombre_remitente?.toLowerCase().includes(termino)     ||
                    r.asunto?.toLowerCase().includes(termino)               ||
                    r.fecha_radicado?.toLowerCase().includes(termino)
                );
        }
    });

    contador.textContent = resultados.length + ' resultado(s) para: "' + termino + '"';

    if (resultados.length === 0) {
        cuerpo.innerHTML =
            '<tr><td colspan="8" class="cargando">Sin resultados para: ' + termino + '</td></tr>';
        return;
    }

    cuerpo.innerHTML = resultados.map(r => `
        <tr>
            <td><strong>${resaltar(r.num_radicado, termino)}</strong></td>
            <td>${r.fecha_radicado || ''}</td>
            <td>${resaltar(r.nombre_remitente, termino)}</td>
            <td>${resaltar(r.nombre_destinatario, termino)}</td>
            <td>${resaltar(r.asunto, termino)}</td>
            <td class="${claseEstado(r.estado)}">${r.estado || ''}</td>
            <td>${r.tipo_registro || ''}</td>
            <td>${r.tiempo_respuesta || ''}</td>
        </tr>
    `).join('');
}

// Resaltar término en el texto
function resaltar(texto, termino) {
    if (!texto) return '';
    const regex = new RegExp('(' + termino + ')', 'gi');
    return texto.replace(regex, '<span class="resaltado">$1</span>');
}

function claseEstado(estado) {
    const clases = {
        'Pendiente':  'estado-pendiente',
        'En proceso': 'estado-proceso',
        'Respondido': 'estado-respondido',
        'Archivado':  'estado-archivado'
    };
    return clases[estado] || '';
}