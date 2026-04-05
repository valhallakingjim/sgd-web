const express = require('express');
const router  = express.Router();
const db      = require('../database/db');

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { usuario, contrasena } = req.body;

    // Validar que llegaron los datos
    if (!usuario || !contrasena) {
        return res.status(400).json({
            ok:      false,
            mensaje: 'Usuario y contrasena son obligatorios'
        });
    }

    // Buscar usuario en la base de datos
    const user = db.prepare(
        'SELECT * FROM usuarios WHERE usuario = ?'
    ).get(usuario);

    // Verificar si existe
    if (!user) {
        return res.status(401).json({
            ok:      false,
            mensaje: 'Usuario o contrasena incorrectos'
        });
    }

    // Verificar contrasena
    if (user.contrasena !== contrasena) {
        return res.status(401).json({
            ok:      false,
            mensaje: 'Usuario o contrasena incorrectos'
        });
    }

    // Verificar estado
    if (user.estado !== 'Activo') {
        return res.status(401).json({
            ok:      false,
            mensaje: 'Usuario inactivo. Contacte al administrador'
        });
    }

    // Login exitoso
    res.json({
        ok:      true,
        mensaje: 'Login exitoso',
        usuario: user.usuario,
        rol:     user.rol
    });
});

module.exports = router;