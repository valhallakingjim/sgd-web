const usuario = sessionStorage.getItem('usuario');
if (!usuario) window.location.href = '/';

let todosLosRadicados = [];
let tabActiva         = 'vencidos';

window.addEventListener('load', cargarAlertas);

async function cargarAlertas() {
    try {
        const res   = await fetch('/api/radicados');
        const datos = await res.json();
        todosLosRadicados = datos.datos || [];
        procesarAlertas();
    } catch (err) {
        console.error('Error:', err);
    }
}

function procesarAlertas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const vencidos  = [];
    const proximos  = [];
    const pendientes = [];

    todosLosRadicados.forEach(r => {
        if (r.estado === 'Respondido' || r.estado === 'Archivado') return;

        if (!r.fecha_est_respuesta) {
            pendientes.push({ ...r, diasVencido: null });
            return;
        }

        const partes = r.fecha_est_respuesta.toString().split('/');
        if (partes.length !== 3) return;

        const fechaLimite = new Date(
            parseInt(partes[2]),
            parseInt(partes[1]) - 1,
            parseInt(partes[0])
        );

        const diffMs   = fechaLimite - hoy;
        const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDias < 0) {
            vencidos.push({ ...r, diasVencido: Math.abs(diffDias), fechaLimite });
        } else if (diffDias <= 5) {
            proximos.push({ ...r, diasVencido: diffDias, fechaLimite });
        } else {
            pendientes.push({ ...r, diasVencido: diffDias, fechaLimite });
        }
    });

    // Actualizar contadores
    document.getElementById('total-vencidos').textContent = vencidos.length;
    document.getElementById('total-proximos').textContent = proximos.length;
    document.getElementById('total-ok').textContent       = pendientes.length;
    document.getElementById('info-alertas').textContent   =
        '🔔 ' + vencidos.length + ' vencido(s)  |  ' +
        proximos.length + ' próximo(s) a vencer';

    // Guardar para usar en tabs
    window._vencidos  = vencidos;
    window._proximos  = proximos;
    window._pendientes = pendientes;

    mostrarTab(tabActiva);
}

function mostrarTab(tab) {
    tabActiva = tab;

    // Actualizar tabs visuales
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
    document.getElementById('tab-' + tab).classList.add('activo');

    let lista = [];
    if (tab === 'vencidos')  lista = window._vencidos  || [];
    if (tab === 'proximos')  lista = window._proximos  || [];
    if (tab === 'todos')     lista = [
        ...(window._vencidos  || []),
        ...(window._proximos  || []),
        ...(window._pendientes || [])
    ];

    renderizarTabla(lista, tab);
}

function renderizarTabla(lista, tab) {
    const cuerpo = document.getElementById('cuerpo-alertas');

    if (lista.length === 0) {
        const msg = {
            vencidos: '✅ No hay documentos vencidos.',
            proximos: '✅ No hay documentos próximos a vencer.',
            todos:    '✅ No hay documentos pendientes.'
        }[tab] || 'Sin registros.';
        cuerpo.innerHTML = `<tr><td colspan="8" class="cargando">${msg}</td></tr>`;
        return;
    }

    cuerpo.innerHTML = lista.map(r => {
        let claseDias  = '';
        let textoDias  = '';

        if (tab === 'vencidos' || r.diasVencido < 0) {
            claseDias = 'dias-vencido';
            textoDias = r.diasVencido + ' día(s) vencido';
        } else if (r.diasVencido <= 5) {
            claseDias = 'dias-proximo';
            textoDias = 'Vence en ' + r.diasVencido + ' día(s)';
        } else {
            textoDias = r.diasVencido ? r.diasVencido + ' días restantes' : '—';
        }

        return `
            <tr>
                <td><strong>${r.num_radicado}</strong></td>
                <td>${r.nombre_remitente    || ''}</td>
                <td>${r.nombre_destinatario || ''}</td>
                <td>${r.asunto             || ''}</td>
                <td>${r.fecha_radicado     || ''}</td>
                <td>${r.fecha_est_respuesta|| '—'}</td>
                <td><span class="${claseDias}">${textoDias}</span></td>
                <td class="${r.estado === 'Pendiente' ? 'vencido' : 'proximo'}">
                    ${r.estado || ''}
                </td>
            </tr>
        `;
    }).join('');
}