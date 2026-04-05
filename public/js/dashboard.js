const usuario = sessionStorage.getItem('usuario');
if (!usuario) window.location.href = '/';

window.addEventListener('load', cargarDashboard);

async function cargarDashboard() {
    try {
        const res   = await fetch('/api/radicados');
        const datos = await res.json();
        const lista = datos.datos || [];

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // ── Contadores ────────────────────────
        const total      = lista.length;
        const respondidos = lista.filter(r => r.estado === 'Respondido' || r.estado === 'Archivado').length;
        const pendientes  = lista.filter(r => r.estado === 'Pendiente'  || r.estado === 'En proceso').length;

        const vencidos = lista.filter(r => {
            if (r.estado === 'Respondido' || r.estado === 'Archivado') return false;
            if (!r.fecha_est_respuesta) return false;
            const p = r.fecha_est_respuesta.toString().split('/');
            if (p.length !== 3) return false;
            const f = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
            return f < hoy;
        }).length;

        document.getElementById('stat-total').textContent       = total;
        document.getElementById('stat-respondidos').textContent = respondidos;
        document.getElementById('stat-pendientes').textContent  = pendientes;
        document.getElementById('stat-vencidos').textContent    = vencidos;
        document.getElementById('ultima-actualizacion').textContent =
            '🕐 Actualizado: ' + new Date().toLocaleTimeString('es-CO');

        // ── Agrupar datos ─────────────────────
        const porEstado  = agrupar(lista, 'estado');
        const porTipo    = agrupar(lista, 'tipo_registro');
        const porAsunto  = agrupar(lista, 'asunto');
        const porUsuario = agrupar(lista, 'usuario_registro');

        const colores = ['#2E74B5','#375623','#ED7D31','#4A148C','#C00000','#0277BD'];

        // ── Renderizar gráficos ───────────────
        renderGrafico('grafico-estado',  porEstado,  colores);
        renderGrafico('grafico-tipo',    porTipo,    colores);
        renderGrafico('grafico-asunto',  porAsunto,  colores);
        renderGrafico('grafico-usuario', porUsuario, colores);

        // ── Últimos 5 radicados ───────────────
        const ultimos = lista.slice(0, 5);
        document.getElementById('tabla-recientes').innerHTML =
            ultimos.length === 0
                ? '<tr><td colspan="5" style="text-align:center;padding:20px;color:#888">Sin registros</td></tr>'
                : ultimos.map(r => `
                    <tr>
                        <td><strong>${r.num_radicado}</strong></td>
                        <td>${r.fecha_radicado     || ''}</td>
                        <td>${r.nombre_remitente   || ''}</td>
                        <td>${r.asunto             || ''}</td>
                        <td class="${claseEstado(r.estado)}">${r.estado || ''}</td>
                    </tr>
                `).join('');

    } catch (err) {
        console.error('Error dashboard:', err);
    }
}

function agrupar(lista, campo) {
    const mapa = {};
    lista.forEach(r => {
        const val = r[campo] || 'Sin datos';
        mapa[val] = (mapa[val] || 0) + 1;
    });
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]);
}

function renderGrafico(idContenedor, datos, colores) {
    const contenedor = document.getElementById(idContenedor);
    if (!datos || datos.length === 0) {
        contenedor.innerHTML = '<p style="color:#888;font-size:0.85rem">Sin datos</p>';
        return;
    }

    const maximo = datos[0][1];

    contenedor.innerHTML = datos.map(([label, valor], i) => {
        const porcentaje = Math.round((valor / maximo) * 100);
        const color      = colores[i % colores.length];
        return `
            <div class="barra-item">
                <span class="barra-label" title="${label}">
                    ${label.length > 14 ? label.substring(0, 14) + '...' : label}
                </span>
                <div class="barra-contenedor">
                    <div class="barra-fill" style="width:${porcentaje}%; background:${color}">
                        <span class="barra-valor">${valor}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function claseEstado(estado) {
    return {
        'Pendiente':  'estado-pendiente',
        'En proceso': 'estado-proceso',
        'Respondido': 'estado-respondido',
        'Archivado':  'estado-archivado'
    }[estado] || '';
}