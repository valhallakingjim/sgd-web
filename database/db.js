const Database = require('better-sqlite3');
const path     = require('path');

const db = new Database(path.join(__dirname, 'sgd.db'));

db.pragma('journal_mode = WAL');
db.pragma('cache_size = 2000');
db.pragma('synchronous = NORMAL');

// Crear tabla usuarios
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario    TEXT    NOT NULL UNIQUE,
        contrasena TEXT    NOT NULL,
        rol        TEXT    NOT NULL,
        estado     TEXT    DEFAULT 'Activo',
        creado_en  TEXT    DEFAULT (datetime('now'))
    )
`);

// Crear tabla radicados con id explícito
db.exec(`
    CREATE TABLE IF NOT EXISTS radicados (
        id                    INTEGER PRIMARY KEY AUTOINCREMENT,
        num_radicado          TEXT    NOT NULL UNIQUE,
        fecha_radicado        TEXT,
        hora_radicado         TEXT,
        fecha_documento       TEXT,
        nombre_remitente      TEXT,
        cargo_remitente       TEXT,
        dependencia_remitente TEXT,
        direccion_remitente   TEXT,
        telefono_remitente    TEXT,
        ciudad_remitente      TEXT,
        nombre_destinatario   TEXT,
        cargo_destinatario    TEXT,
        dependencia_dest      TEXT,
        direccion_dest        TEXT,
        telefono_dest         TEXT,
        ciudad_dest           TEXT,
        asunto                TEXT,
        medios_entrega        TEXT,
        tiempo_respuesta      TEXT,
        fecha_est_respuesta   TEXT,
        estado                TEXT    DEFAULT 'Pendiente',
        observaciones         TEXT,
        tipo_registro         TEXT,
        usuario_registro      TEXT,
        creado_en             TEXT    DEFAULT (datetime('now'))
    )
`);

// Insertar usuarios iniciales si no existen
const adminExiste = db.prepare(
    "SELECT id FROM usuarios WHERE usuario = 'admin'"
).get();

if (!adminExiste) {
    db.prepare(`
        INSERT INTO usuarios (usuario, contrasena, rol)
        VALUES (?, ?, ?)
    `).run('admin',     'admin123', 'Administrador');

    db.prepare(`
        INSERT INTO usuarios (usuario, contrasena, rol)
        VALUES (?, ?, ?)
    `).run('empleado1', 'emp2026',  'Empleado');

    db.prepare(`
        INSERT INTO usuarios (usuario, contrasena, rol)
        VALUES (?, ?, ?)
    `).run('usuario1',  'user2026', 'Usuario');

    console.log('Usuarios iniciales creados');
}

module.exports = db;