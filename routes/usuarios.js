const express = require('express');
const router  = express.Router();
const db      = require('../database/db');

// GET /api/usuarios — obtener todos
router.get('/', (req, res) => {
    const usuarios = db.prepare(
        'SELECT id, usuario, rol, estado, creado_en FROM usuarios ORDER BY id ASC'
    ).all();
    res.json({ ok: true, usuarios });
});

// POST /api/usuarios — crear nuevo
router.post('/', (req, res) => {
    const { usuario, contrasena, rol } = req.body;

    if (!usuario || !contrasena || !rol) {
        return res.status(400).json({
            ok: false, mensaje: 'Todos los campos son obligatorios'
        });
    }

    const existe = db.prepare(
        'SELECT id FROM usuarios WHERE usuario = ?'
    ).get(usuario);

    if (existe) {
        return res.status(400).json({
            ok: false, mensaje: 'Ya existe un usuario con ese nombre'
        });
    }

    db.prepare(
        'INSERT INTO usuarios (usuario, contrasena, rol) VALUES (?, ?, ?)'
    ).run(usuario, contrasena, rol);

    res.json({ ok: true, mensaje: 'Usuario ' + usuario + ' creado correctamente' });
});

// PUT /api/usuarios/:usuario/estado — cambiar estado
router.put('/:usuario/estado', (req, res) => {
    const { estado } = req.body;
    const { usuario } = req.params;

    if (usuario === 'admin') {
        return res.status(400).json({
            ok: false, mensaje: 'No se puede modificar el usuario admin'
        });
    }

    db.prepare(
        'UPDATE usuarios SET estado = ? WHERE usuario = ?'
    ).run(estado, usuario);

    res.json({ ok: true, mensaje: 'Estado actualizado correctamente' });
});

// PUT /api/usuarios/:usuario/contrasena — cambiar contraseña
router.put('/:usuario/contrasena', (req, res) => {
    const { contrasena } = req.body;
    const { usuario }    = req.params;

    db.prepare(
        'UPDATE usuarios SET contrasena = ? WHERE usuario = ?'
    ).run(contrasena, usuario);

    res.json({ ok: true, mensaje: 'Contraseña actualizada correctamente' });
});

module.exports = router;