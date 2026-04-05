// Verificar sesión
const usuario = sessionStorage.getItem('usuario');
const rol     = sessionStorage.getItem('rol');
if (!usuario) window.location.href = '/';

let todosLosRegistros  = [];
let registrosFiltrados = [];
let radicadoActivo     = null;

// Cargar al iniciar
window.addEventListener('load', cargarRadicados);

async function cargarRadicados() {
    const cuerpo = document.getElementById('cuerpo-tabla');
    cuerpo.innerHTML = `<tr><td colspan="17" class="cargando">Cargando...</td></tr>`;

    try {
        const res   = await fetch('/api/radicados');
        const datos = await res.json();

        todosLosRegistros  = datos.datos || [];
        registrosFiltrados = [...todosLosRegistros];
        actualizarTabla(todosLosRegistros);

    } catch (err) {
        console.error('Error:', err);
        cuerpo.innerHTML =
            `<tr><td colspan="17" class="cargando">Error al cargar datos.</td></tr>`;
    }
}

// ── Filtrar ───────────────────────────────────────────────────
function filtrarTabla() {
    const termino = document.getElementById('campo-busqueda')
        .value.trim().toLowerCase();
    const filtro  = document.getElementById('filtro-campo').value;

    if (!termino) {
        registrosFiltrados = [...todosLosRegistros];
        actualizarTabla(registrosFiltrados);
        return;
    }

    registrosFiltrados = todosLosRegistros.filter(r => {
        switch (filtro) {
            case 'radicado':     return r.num_radicado?.toLowerCase().includes(termino);
            case 'remitente':    return r.nombre_remitente?.toLowerCase().includes(termino);
            case 'destinatario': return r.nombre_destinatario?.toLowerCase().includes(termino);
            case 'asunto':       return r.asunto?.toLowerCase().includes(termino);
            case 'estado':       return r.estado?.toLowerCase().includes(termino);
            default: return (
                r.num_radicado?.toLowerCase().includes(termino)        ||
                r.nombre_remitente?.toLowerCase().includes(termino)    ||
                r.nombre_destinatario?.toLowerCase().includes(termino) ||
                r.asunto?.toLowerCase().includes(termino)              ||
                r.estado?.toLowerCase().includes(termino)              ||
                r.fecha_radicado?.toLowerCase().includes(termino)
            );
        }
    });

    actualizarTabla(registrosFiltrados, termino);
}

// ── Renderizar tabla ──────────────────────────────────────────
function actualizarTabla(lista, termino = '') {
    const cuerpo = document.getElementById('cuerpo-tabla');

    document.getElementById('total-registros').textContent =
        '📊 Mostrando: ' + lista.length + ' de ' +
        todosLosRegistros.length + ' registro(s)';

    if (lista.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="17" class="cargando">
            Sin resultados${termino ? ' para: "' + termino + '"' : ''}.
        </td></tr>`;
        return;
    }

    cuerpo.innerHTML = lista.map((r, idx) => `
        <tr onclick="verDetalle(${idx})">
            <td><strong>${resaltar(r.num_radicado, termino)}</strong></td>
            <td>${r.fecha_radicado        || ''}</td>
            <td>${r.hora_radicado         || ''}</td>
            <td>${r.tipo_registro         || ''}</td>
            <td>${resaltar(r.nombre_remitente, termino)}</td>
            <td>${r.cargo_remitente       || ''}</td>
            <td>${r.dependencia_remitente || ''}</td>
            <td>${resaltar(r.nombre_destinatario, termino)}</td>
            <td>${r.cargo_destinatario    || ''}</td>
            <td>${r.dependencia_dest      || ''}</td>
            <td>${resaltar(r.asunto, termino)}</td>
            <td>${r.medios_entrega        || ''}</td>
            <td>${r.tiempo_respuesta      || ''}</td>
            <td>${r.fecha_est_respuesta   || ''}</td>
            <td>
                <span class="${claseEstado(r.estado)}">${resaltar(r.estado, termino)}</span>
            </td>
            <td>${r.usuario_registro || ''}</td>
            <td onclick="event.stopPropagation()">
                <button class="btn-detalle"
                        onclick="verDetalle(${idx})">
                    👁 Ver
                </button>
                <button class="btn-estado"
                        onclick="abrirModalEstado(${idx})">
                    ✏️ Estado
                </button>
            </td>
        </tr>
    `).join('');
}

// ── Modal cambiar estado ──────────────────────────────────────
function abrirModalEstado(idx) {
    radicadoActivo = registrosFiltrados[idx];
    if (!radicadoActivo) return;

    document.getElementById('estado-titulo').textContent =
        'Cambiar Estado — ' + radicadoActivo.num_radicado;

    document.getElementById('estado-radicado-info').innerHTML =
        '<strong>Radicado:</strong> ' + radicadoActivo.num_radicado +
        ' &nbsp;|&nbsp; <strong>Asunto:</strong> ' + (radicadoActivo.asunto || '') +
        ' &nbsp;|&nbsp; <strong>Estado actual:</strong> <span class="' +
        claseEstado(radicadoActivo.estado) + '">' + (radicadoActivo.estado || '') + '</span>';

    document.getElementById('modal-estado').classList.remove('oculto');
}

async function aplicarEstado(nuevoEstado) {
    if (!radicadoActivo) {
        alert('Error: no hay radicado activo.');
        return;
    }

    const idUsar     = radicadoActivo.id;
    const numRadicado = radicadoActivo.num_radicado;

    if (!idUsar) {
        alert('Error: el radicado no tiene ID. Recargue la página con F5.');
        return;
    }

    try {
        const respuesta = await fetch('/api/radicados/' + idUsar + '/estado', {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ estado: nuevoEstado })
        });

        const resp = await respuesta.json();

        if (resp.ok) {
            // Actualizar PRIMERO los arrays locales
            todosLosRegistros = todosLosRegistros.map(r =>
                r.id === idUsar ? { ...r, estado: nuevoEstado } : r
            );
            registrosFiltrados = registrosFiltrados.map(r =>
                r.id === idUsar ? { ...r, estado: nuevoEstado } : r
            );

            // Cerrar modal DESPUÉS de actualizar
            document.getElementById('modal-estado').classList.add('oculto');
            radicadoActivo = null;

            // Refrescar tabla
            filtrarTabla();

            // Mostrar confirmación
            mostrarToast('✅ ' + numRadicado + ' → ' + nuevoEstado);

        } else {
            alert('Error: ' + resp.mensaje);
        }

    } catch (err) {
        console.error('Error:', err);
        alert('Error de conexión: ' + err.message);
    }
}

function cerrarModalEstado() {
    document.getElementById('modal-estado').classList.add('oculto');
    radicadoActivo = null;
}

// ── Toast de confirmación ─────────────────────────────────────
function mostrarToast(mensaje) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; right: 30px;
            background: #375623; color: white;
            padding: 12px 20px; border-radius: 8px;
            font-size: 0.9rem; font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999; transition: opacity 0.4s;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ── Ver detalle completo ──────────────────────────────────────
function verDetalle(idx) {
    const r = registrosFiltrados[idx];
    if (!r) return;

    document.getElementById('modal-titulo').textContent =
        '📋 Detalle — ' + r.num_radicado;

    document.getElementById('modal-contenido').innerHTML = `
        <div class="modal-seccion">
            <div class="modal-seccion-titulo azul">📌 DATOS DEL RADICADO</div>
            <div class="modal-grid">
                <div class="modal-campo">
                    <label>N° Radicado</label>
                    <span>${r.num_radicado || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Tipo de Registro</label>
                    <span>${r.tipo_registro || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Fecha de Radicado</label>
                    <span>${r.fecha_radicado || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Hora de Radicado</label>
                    <span>${r.hora_radicado || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Fecha del Documento</label>
                    <span>${r.fecha_documento || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Estado</label>
                    <span class="${claseEstado(r.estado)}">${r.estado || ''}</span>
                </div>
            </div>
        </div>
        <div class="modal-seccion">
            <div class="modal-seccion-titulo verde">📬 DATOS DEL DESTINATARIO</div>
            <div class="modal-grid">
                <div class="modal-campo">
                    <label>Nombre</label>
                    <span>${r.nombre_destinatario || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Cargo</label>
                    <span>${r.cargo_destinatario || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Dependencia</label>
                    <span>${r.dependencia_dest || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Dirección</label>
                    <span>${r.direccion_dest || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Teléfono</label>
                    <span>${r.telefono_dest || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Ciudad</label>
                    <span>${r.ciudad_dest || ''}</span>
                </div>
            </div>
        </div>
        <div class="modal-seccion">
            <div class="modal-seccion-titulo morado">📤 DATOS DEL REMITENTE</div>
            <div class="modal-grid">
                <div class="modal-campo">
                    <label>Nombre</label>
                    <span>${r.nombre_remitente || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Cargo</label>
                    <span>${r.cargo_remitente || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Dependencia</label>
                    <span>${r.dependencia_remitente || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Dirección</label>
                    <span>${r.direccion_remitente || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Teléfono</label>
                    <span>${r.telefono_remitente || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Ciudad</label>
                    <span>${r.ciudad_remitente || ''}</span>
                </div>
            </div>
        </div>
        <div class="modal-seccion">
            <div class="modal-seccion-titulo oscuro">📄 INFORMACIÓN DEL DOCUMENTO</div>
            <div class="modal-grid">
                <div class="modal-campo ancho">
                    <label>Asunto</label>
                    <span>${r.asunto || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Medios de Entrega</label>
                    <span>${r.medios_entrega || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Tiempo de Respuesta</label>
                    <span>${r.tiempo_respuesta || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Fecha Est. Respuesta</label>
                    <span>${r.fecha_est_respuesta || ''}</span>
                </div>
                <div class="modal-campo">
                    <label>Usuario Registro</label>
                    <span>${r.usuario_registro || ''}</span>
                </div>
                <div class="modal-campo ancho">
                    <label>Observaciones</label>
                    <span>${r.observaciones || 'Sin observaciones'}</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modal-overlay').classList.remove('oculto');
}

// ── Cerrar modales ────────────────────────────────────────────
function cerrarModal(event) {
    if (event.target === document.getElementById('modal-overlay')) {
        cerrarModalBtn();
    }
}

function cerrarModalBtn() {
    document.getElementById('modal-overlay').classList.add('oculto');
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        cerrarModalBtn();
        cerrarModalEstado();
    }
});

// ── Helpers ───────────────────────────────────────────────────
function claseEstado(estado) {
    return {
        'Pendiente':  'estado-pendiente',
        'En proceso': 'estado-proceso',
        'Respondido': 'estado-respondido',
        'Archivado':  'estado-archivado',
        'Vencido':    'estado-vencido'
    }[estado] || '';
}

function resaltar(texto, termino) {
    if (!texto || !termino) return texto || '';
    const regex = new RegExp('(' + termino + ')', 'gi');
    return String(texto).replace(regex, '<span class="resaltado">$1</span>');
}

// ── PDF ───────────────────────────────────────────────────────
async function exportarPDF() {
    if (registrosFiltrados.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }
    if (!window.jspdf?.jsPDF) {
        alert('Recargue la página con F5 e intente de nuevo.');
        return;
    }
    generarPDF();
}

function generarPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');

        doc.setFillColor(31, 56, 100);
        doc.rect(0, 0, 297, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text('SISTEMA DE GESTIÓN DOCUMENTAL', 148, 12, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Base de Datos — Radicados', 148, 20, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(189, 215, 238);
        doc.text('Generado: ' + new Date().toLocaleDateString('es-CO') +
                 '  |  Usuario: ' + (usuario || ''), 148, 26, { align: 'center' });

        const cols   = ['N° Radicado','Fecha','Remitente','Destinatario','Asunto','Estado','Tipo'];
        const anchos = [28, 22, 42, 42, 38, 25, 24];
        let x = 10, y = 38;

        doc.setFillColor(46, 116, 181);
        doc.rect(10, y - 6, 272, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        cols.forEach((col, i) => { doc.text(col, x + 2, y); x += anchos[i]; });

        y += 9;
        doc.setFont('helvetica', 'normal');

        registrosFiltrados.forEach((r, idx) => {
            if (y > 195) { doc.addPage(); y = 20; }
            const bg = idx % 2 === 0 ? [235, 243, 251] : [255, 255, 255];
            doc.setFillColor(...bg);
            doc.rect(10, y - 5, 272, 8, 'F');
            x = 10;
            [
                r.num_radicado,
                r.fecha_radicado,
                (r.nombre_remitente    || '').substring(0, 16),
                (r.nombre_destinatario || '').substring(0, 16),
                (r.asunto              || '').substring(0, 15),
                r.estado,
                r.tipo_registro
            ].forEach((val, i) => {
                if (val === 'Pendiente' || val === 'Vencido')
                    doc.setTextColor(192, 0, 0);
                else if (val === 'Respondido')
                    doc.setTextColor(55, 86, 35);
                else
                    doc.setTextColor(50, 50, 50);
                doc.text(String(val || ''), x + 2, y);
                x += anchos[i];
            });
            y += 8;
        });

        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text('SGD v1.0  |  Total: ' + registrosFiltrados.length +
                 ' registro(s)  |  © ' + new Date().getFullYear(),
                 148, 205, { align: 'center' });

        doc.save('Radicados_' +
            new Date().toLocaleDateString('es-CO').replace(/\//g, '-') + '.pdf');

    } catch (error) {
        console.error('Error PDF:', error);
        alert('Error al generar PDF: ' + error.message);
    }
}

// ── PDF del detalle ───────────────────────────────────────────
function imprimirDetalle() {
    const contenido = document.getElementById('modal-contenido').innerHTML;
    const titulo    = document.getElementById('modal-titulo').textContent;
    const ventana   = window.open('', '_blank', 'width=800,height=600');
    ventana.document.write(`
        <!DOCTYPE html><html lang="es"><head>
        <meta charset="UTF-8"><title>${titulo}</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: Calibri, sans-serif; padding: 20px; }
            h1 { background:#1F3864; color:white; padding:15px 20px;
                 font-size:1rem; margin-bottom:20px; border-radius:6px; }
            .modal-seccion { margin-bottom: 18px; }
            .modal-seccion-titulo { font-size:0.85rem; font-weight:bold;
                color:white; padding:6px 12px; border-radius:4px; margin-bottom:10px; }
            .modal-seccion-titulo.azul   { background:#2E74B5; }
            .modal-seccion-titulo.verde  { background:#1B5E20; }
            .modal-seccion-titulo.morado { background:#4A148C; }
            .modal-seccion-titulo.oscuro { background:#1F3864; }
            .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
            .modal-campo { display:flex; flex-direction:column; gap:3px; }
            .modal-campo label { font-size:0.7rem; font-weight:bold;
                color:#666; text-transform:uppercase; }
            .modal-campo span { font-size:0.85rem; padding:5px 8px;
                background:#F5F7FA; border-radius:4px;
                border-left:3px solid #2E74B5; min-height:28px; }
            .modal-campo.ancho { grid-column: span 2; }
            .estado-pendiente { color:#C00000; font-weight:bold; }
            .estado-respondido { color:#375623; font-weight:bold; }
            .footer-print { margin-top:30px; text-align:center;
                font-size:0.75rem; color:#888;
                border-top:1px solid #DDD; padding-top:10px; }
        </style></head><body>
        <h1>${titulo}</h1>
        ${contenido}
        <div class="footer-print">SGD v1.0 | © ${new Date().getFullYear()} |
        Impreso: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}
        </div></body></html>
    `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => { ventana.print(); ventana.close(); }, 500);
}

function guardarPDFDetalle() {
    if (!window.jspdf?.jsPDF) {
        alert('Recargue la página con F5 e intente de nuevo.');
        return;
    }
    const titulo = document.getElementById('modal-titulo').textContent;
    const numRad = titulo.replace('📋 Detalle — ', '').trim();
    const r      = registrosFiltrados.find(x => x.num_radicado === numRad);
    if (!r) { alert('Error al obtener los datos.'); return; }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        doc.setFillColor(31, 56, 100);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SISTEMA DE GESTIÓN DOCUMENTAL', 105, 13, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Detalle del Radicado: ' + r.num_radicado, 105, 22, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(189, 215, 238);
        doc.text('Generado: ' + new Date().toLocaleDateString('es-CO') +
                 '  |  Usuario: ' + (usuario || ''), 105, 28, { align: 'center' });

        let y = 40;

        function seccion(titulo, color, campos) {
            const rgb = {
                azul:   [46, 116, 181],
                verde:  [27, 94, 32],
                morado: [74, 20, 140],
                oscuro: [31, 56, 100]
            }[color] || [46, 116, 181];
            doc.setFillColor(...rgb);
            doc.rect(10, y - 5, 190, 9, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(titulo, 13, y + 1);
            y += 12;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            for (let i = 0; i < campos.length; i += 2) {
                const col1 = campos[i];
                const col2 = campos[i + 1];
                doc.setFillColor(248, 250, 253);
                doc.rect(10, y - 4, 190, 10, 'F');
                doc.setTextColor(100, 100, 100);
                doc.setFont('helvetica', 'bold');
                doc.text(col1.label + ':', 12, y);
                doc.setTextColor(30, 30, 30);
                doc.setFont('helvetica', 'normal');
                doc.text(String(col1.valor || '—'), 12, y + 5);
                if (col2) {
                    doc.setTextColor(100, 100, 100);
                    doc.setFont('helvetica', 'bold');
                    doc.text(col2.label + ':', 107, y);
                    doc.setTextColor(30, 30, 30);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(col2.valor || '—'), 107, y + 5);
                }
                y += 13;
                if (y > 265) { doc.addPage(); y = 20; }
            }
            y += 4;
        }

        seccion('📌 DATOS DEL RADICADO', 'azul', [
            { label: 'N° Radicado',       valor: r.num_radicado   },
            { label: 'Tipo de Registro',  valor: r.tipo_registro  },
            { label: 'Fecha de Radicado', valor: r.fecha_radicado },
            { label: 'Hora de Radicado',  valor: r.hora_radicado  },
            { label: 'Fecha Documento',   valor: r.fecha_documento},
            { label: 'Estado',            valor: r.estado         }
        ]);
        seccion('📬 DATOS DEL DESTINATARIO', 'verde', [
            { label: 'Nombre',      valor: r.nombre_destinatario },
            { label: 'Cargo',       valor: r.cargo_destinatario  },
            { label: 'Dependencia', valor: r.dependencia_dest    },
            { label: 'Dirección',   valor: r.direccion_dest      },
            { label: 'Teléfono',    valor: r.telefono_dest       },
            { label: 'Ciudad',      valor: r.ciudad_dest         }
        ]);
        seccion('📤 DATOS DEL REMITENTE', 'morado', [
            { label: 'Nombre',      valor: r.nombre_remitente      },
            { label: 'Cargo',       valor: r.cargo_remitente       },
            { label: 'Dependencia', valor: r.dependencia_remitente },
            { label: 'Dirección',   valor: r.direccion_remitente   },
            { label: 'Teléfono',    valor: r.telefono_remitente    },
            { label: 'Ciudad',      valor: r.ciudad_remitente      }
        ]);
        seccion('📄 INFORMACIÓN DEL DOCUMENTO', 'oscuro', [
            { label: 'Asunto',               valor: r.asunto             },
            { label: 'Medios de Entrega',    valor: r.medios_entrega     },
            { label: 'Tiempo de Respuesta',  valor: r.tiempo_respuesta   },
            { label: 'Fecha Est. Respuesta', valor: r.fecha_est_respuesta},
            { label: 'Usuario Registro',     valor: r.usuario_registro   },
            { label: 'Observaciones',        valor: r.observaciones      }
        ]);

        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text('SGD v1.0  |  © ' + new Date().getFullYear(), 105, 287, { align: 'center' });
        doc.save('Radicado_' + r.num_radicado + '.pdf');

    } catch (error) {
        console.error('Error PDF:', error);
        alert('Error al generar PDF: ' + error.message);
    }
}