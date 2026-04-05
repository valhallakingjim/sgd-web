const express = require('express');
const router  = express.Router();
const db      = require('../database/db');

// GET /api/radicados — obtener todos
router.get('/', (req, res) => {
    const radicados = db.prepare(
        'SELECT * FROM radicados ORDER BY id DESC'
    ).all();
    res.json({ ok: true, datos: radicados });
});

// GET /api/radicados/siguiente — próximo número
router.get('/siguiente', (req, res) => {
    const ultimo = db.prepare(
        'SELECT num_radicado FROM radicados ORDER BY id DESC LIMIT 1'
    ).get();

    let numero = 1;
    if (ultimo) {
        numero = parseInt(ultimo.num_radicado.split('-')[1]) + 1;
    }

    res.json({ ok: true, siguiente: 'RAD-' + String(numero).padStart(4, '0') });
});

// GET /api/radicados/buscar — buscar
router.get('/buscar', (req, res) => {
    const q = '%' + (req.query.q || '') + '%';
    const resultados = db.prepare(`
        SELECT * FROM radicados
        WHERE num_radicado        LIKE ?
        OR    nombre_remitente    LIKE ?
        OR    nombre_destinatario LIKE ?
        OR    asunto              LIKE ?
        OR    fecha_radicado      LIKE ?
        ORDER BY id DESC
    `).all(q, q, q, q, q);
    res.json({ ok: true, datos: resultados });
});

// POST /api/radicados — crear nuevo
router.post('/', (req, res) => {
    const d = req.body;

    const existe = db.prepare(
        'SELECT id FROM radicados WHERE num_radicado = ?'
    ).get(d.num_radicado);

    if (existe) {
        return res.status(400).json({
            ok: false, mensaje: 'Este radicado ya existe'
        });
    }

    const stmt = db.prepare(`
        INSERT INTO radicados (
            num_radicado,          fecha_radicado,
            hora_radicado,         fecha_documento,
            nombre_remitente,      cargo_remitente,
            dependencia_remitente, direccion_remitente,
            telefono_remitente,    ciudad_remitente,
            nombre_destinatario,   cargo_destinatario,
            dependencia_dest,      direccion_dest,
            telefono_dest,         ciudad_dest,
            asunto,                medios_entrega,
            tiempo_respuesta,      fecha_est_respuesta,
            estado,                observaciones,
            tipo_registro,         usuario_registro
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?
        )
    `);

    stmt.run(
        d.num_radicado,          d.fecha_radicado,
        d.hora_radicado,         d.fecha_documento,
        d.nombre_remitente,      d.cargo_remitente,
        d.dependencia_remitente, d.direccion_remitente,
        d.telefono_remitente,    d.ciudad_remitente,
        d.nombre_destinatario,   d.cargo_destinatario,
        d.dependencia_dest,      d.direccion_dest,
        d.telefono_dest,         d.ciudad_dest,
        d.asunto,                d.medios_entrega,
        d.tiempo_respuesta,      d.fecha_est_respuesta,
        d.estado,                d.observaciones,
        d.tipo_registro,         d.usuario_registro
    );

    res.json({
        ok:      true,
        mensaje: 'Radicado ' + d.num_radicado + ' guardado correctamente'
    });
});

// PUT /api/radicados/:id/estado — cambiar estado
router.put('/:id/estado', (req, res) => {
    const { estado } = req.body;
    const id         = parseInt(req.params.id);

    console.log('PUT estado — id:', id, '— estado:', estado);

    if (!id || isNaN(id)) {
        return res.status(400).json({
            ok: false, mensaje: 'ID inválido: ' + req.params.id
        });
    }

    const estados = ['Pendiente','En proceso','Respondido','Archivado','Vencido'];
    if (!estados.includes(estado)) {
        return res.status(400).json({
            ok: false, mensaje: 'Estado no válido: ' + estado
        });
    }

    const result = db.prepare(
        'UPDATE radicados SET estado = ? WHERE id = ?'
    ).run(estado, id);

    console.log('Filas actualizadas:', result.changes);

    if (result.changes === 0) {
        return res.status(404).json({
            ok: false, mensaje: 'Radicado no encontrado — id: ' + id
        });
    }

    res.json({ ok: true, mensaje: 'Estado actualizado a: ' + estado });
});

module.exports = router;




