// ── Datos de autocompletado ───────────────────────────────────
const DESTINATARIOS = {
    'CLAUDIA DIAZ':    { cargo:'Directora',           dep:'Tesoreria',      dir:'calle 4D # 36-103', tel:'3137010602', ciudad:'Cali'      },
    'YULI CASAMACHI':  { cargo:'Secretaria',          dep:'Planeacion',     dir:'calle 4D # 36-145', tel:'3117432320', ciudad:'Medellin'  },
    'JOANA ANAYA':     { cargo:'Recursos Humanos',    dep:'Personeria',     dir:'calle 7C # 46-15',  tel:'3243241022', ciudad:'Bogota'    },
    'CAROLINA NAVARRO':{ cargo:'Servicio al cliente', dep:'Sec gobierno',   dir:'carrera 37 # 2-14', tel:'3116282036', ciudad:'Armenia'   },
    'YOLIMA PIZARE':   { cargo:'Asuntos internos',    dep:'Sec cultura',    dir:'calle 5 # 20-60',   tel:'3245079996', ciudad:'Santander' },
    'VANESA PATIÑO':   { cargo:'Encargado de archivo',dep:'Sec transito',   dir:'calle 8 # 15-80',   tel:'3108279538', ciudad:'Pereira'   },
    'PAOLA RUIZ':      { cargo:'SGD',                 dep:'Archivo General',dir:'calle 7C # 12-05',  tel:'3167879091', ciudad:'Popayan'   },
    'DANIELA BONILLA': { cargo:'Directora',           dep:'Tesoreria',      dir:'carrera 8N # 4-55', tel:'3125678989', ciudad:'Cali'      },
    'KEVIN MOSQUERA':  { cargo:'Secretaria',          dep:'Planeacion',     dir:'calle 1A # 5-34',   tel:'3151234567', ciudad:'Medellin'  },
    'JULIANA BURBANO': { cargo:'Recursos Humanos',    dep:'Personeria',     dir:'calle 7 # 2-22',    tel:'3257685534', ciudad:'Bogota'    },
    'ELOIM JIMENEZ':   { cargo:'Servicio al cliente', dep:'Sec gobierno',   dir:'carrera 2 # 7-77',  tel:'3107878567', ciudad:'Armenia'   },
    'UTERO GARCIA':    { cargo:'Asuntos internos',    dep:'Sec cultura',    dir:'carrera 9 # 8-88',  tel:'3016668888', ciudad:'Santander' },
    'SOFIA DORADO':    { cargo:'Encargado de archivo',dep:'Sec transito',   dir:'calle 3 # 3-33',    tel:'3055678971', ciudad:'Pereira'   }
};

const REMITENTES = {
    'KEVIN MOSQUERA':  { cargo:'Servicio al cliente', dep:'Sec gobierno',   dir:'calle 1A # 5-34',   tel:'3151234567', ciudad:'Popayan'   },
    'JULIANA BURBANO': { cargo:'Encargado de archivo',dep:'Sec transito',   dir:'calle 7 # 2-22',    tel:'3257685534', ciudad:'Pereira'   },
    'ELOIM JIMENEZ':   { cargo:'Secretaria',          dep:'Planeacion',     dir:'carrera 2 # 7-77',  tel:'3107878567', ciudad:'Medellin'  },
    'UTERO GARCIA':    { cargo:'Directora',           dep:'Tesoreria',      dir:'carrera 9 # 8-88',  tel:'3016668888', ciudad:'Cali'      },
    'SOFIA DORADO':    { cargo:'Recursos Humanos',    dep:'Personeria',     dir:'calle 3 # 3-33',    tel:'3055678971', ciudad:'Bogota'    },
    'CLAUDIA DIAZ':    { cargo:'Directora',           dep:'Tesoreria',      dir:'calle 4D # 36-103', tel:'3137010602', ciudad:'Cali'      },
    'YULI CASAMACHI':  { cargo:'Secretaria',          dep:'Planeacion',     dir:'calle 4D # 36-145', tel:'3117432320', ciudad:'Medellin'  },
    'JOANA ANAYA':     { cargo:'Recursos Humanos',    dep:'Personeria',     dir:'calle 7C # 46-15',  tel:'3243241022', ciudad:'Bogota'    },
    'CAROLINA NAVARRO':{ cargo:'Servicio al cliente', dep:'Sec gobierno',   dir:'carrera 37 # 2-14', tel:'3116282036', ciudad:'Armenia'   },
    'YOLIMA PIZARE':   { cargo:'Asuntos internos',    dep:'Sec cultura',    dir:'calle 5 # 20-60',   tel:'3245079996', ciudad:'Santander' },
    'VANESA PATIÑO':   { cargo:'Encargado de archivo',dep:'Sec transito',   dir:'calle 8 # 15-80',   tel:'3108279538', ciudad:'Pereira'   },
    'PAOLA RUIZ':      { cargo:'SGD',                 dep:'Archivo General',dir:'calle 7C # 12-05',  tel:'3167879091', ciudad:'Popayan'   }
};

const ASUNTOS = {
    'Tutela':     { dias: 10 },
    'Peticion':   { dias: 10 },
    'Queja':      { dias: 15 },
    'Reclamo':    { dias: 15 },
    'Sugerencia': { dias: 15 },
    'Denuncia':   { dias: 15 }
};

// ── Sesión ────────────────────────────────────────────────────
const usuario = sessionStorage.getItem('usuario');
const rol     = sessionStorage.getItem('rol');
if (!usuario) window.location.href = '/';

// ── Iniciar ───────────────────────────────────────────────────
window.addEventListener('load', nuevoRadicado);

// ── Mostrar nombre del archivo adjunto ────────────────────────
document.getElementById('archivo_adjunto')
    .addEventListener('change', function() {
        const nombre = this.files[0]
            ? this.files[0].name
            : 'Ningún archivo seleccionado';
        document.getElementById('nombre-archivo').textContent = nombre;
    });

// ── Autocompletar Destinatario ────────────────────────────────
function autocompletarDestinatario() {
    const nombre = document.getElementById('nombre_destinatario').value;
    const datos  = DESTINATARIOS[nombre];
    if (datos) {
        document.getElementById('cargo_destinatario').value  = datos.cargo;
        document.getElementById('dependencia_dest').value    = datos.dep;
        document.getElementById('direccion_dest').value      = datos.dir;
        document.getElementById('telefono_dest').value       = datos.tel;
        document.getElementById('ciudad_dest').value         = datos.ciudad;
    } else {
        ['cargo_destinatario','dependencia_dest',
         'direccion_dest','telefono_dest','ciudad_dest']
            .forEach(id => document.getElementById(id).value = '');
    }
}

// ── Autocompletar Remitente ───────────────────────────────────
function autocompletarRemitente() {
    const nombre = document.getElementById('nombre_remitente').value;
    const datos  = REMITENTES[nombre];
    if (datos) {
        document.getElementById('cargo_remitente').value      = datos.cargo;
        document.getElementById('dependencia_remitente').value = datos.dep;
        document.getElementById('direccion_remitente').value   = datos.dir;
        document.getElementById('telefono_remitente').value    = datos.tel;
        document.getElementById('ciudad_remitente').value      = datos.ciudad;
    } else {
        ['cargo_remitente','dependencia_remitente',
         'direccion_remitente','telefono_remitente','ciudad_remitente']
            .forEach(id => document.getElementById(id).value = '');
    }
}

// ── Autocompletar Asunto + calcular fecha ─────────────────────
function autocompletarAsunto() {
    const asunto = document.getElementById('asunto').value;
    const datos  = ASUNTOS[asunto];
    if (!datos) {
        document.getElementById('tiempo_respuesta').value   = '';
        document.getElementById('fecha_est_respuesta').value = '';
        return;
    }

    document.getElementById('tiempo_respuesta').value =
        datos.dias + ' dias habiles';

    // Calcular fecha estimada en días hábiles
    let fecha   = new Date();
    let habiles = 0;
    while (habiles < datos.dias) {
        fecha.setDate(fecha.getDate() + 1);
        const dia = fecha.getDay();
        if (dia !== 0 && dia !== 6) habiles++;
    }

    document.getElementById('fecha_est_respuesta').value =
        fecha.toLocaleDateString('es-CO', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
}

// ── Nuevo Radicado ────────────────────────────────────────────
async function nuevoRadicado() {
    const res   = await fetch('/api/radicados/siguiente');
    const datos = await res.json();
    document.getElementById('num_radicado').value = datos.siguiente;

    const ahora = new Date();
    document.getElementById('fecha_radicado').value =
        ahora.toLocaleDateString('es-CO');
    document.getElementById('hora_radicado').value =
        ahora.toLocaleTimeString('es-CO');

    const selects = ['tipo_registro','estado','nombre_destinatario',
                     'nombre_remitente','asunto','medios_entrega'];
    selects.forEach(id => document.getElementById(id).value = '');

    const inputs = ['fecha_documento','cargo_destinatario','dependencia_dest',
        'direccion_dest','telefono_dest','ciudad_dest','cargo_remitente',
        'dependencia_remitente','direccion_remitente','telefono_remitente',
        'ciudad_remitente','tiempo_respuesta','fecha_est_respuesta','observaciones'];
    inputs.forEach(id => document.getElementById(id).value = '');

    document.getElementById('archivo_adjunto').value = '';
    document.getElementById('nombre-archivo').textContent = 'Ningún archivo seleccionado';
    ocultarMensaje();
}

// ── Adjuntar Documento ────────────────────────────────────────
function adjuntarDocumento() {
    const num     = document.getElementById('num_radicado').value;
    const archivo = document.getElementById('archivo_adjunto').files[0];

    if (!num) {
        mostrarMensaje('Primero cree o cargue un radicado.', 'error');
        return;
    }
    if (!archivo) {
        mostrarMensaje('Seleccione un archivo primero usando el campo Documento Adjunto.', 'error');
        return;
    }

    // Por ahora confirmar — en producción se subiría al servidor
    mostrarMensaje(
        '📎 Archivo "' + archivo.name + '" listo para adjuntar al radicado ' + num +
        '. Se guardará cuando presione RADICAR.',
        'exito'
    );
}

// ── Radicar Documento ─────────────────────────────────────────
async function radicarDocumento() {
    const num  = document.getElementById('num_radicado').value;
    const dest = document.getElementById('nombre_destinatario').value;
    const rem  = document.getElementById('nombre_remitente').value;
    const asu  = document.getElementById('asunto').value;

    if (!dest) { mostrarMensaje('El Destinatario es obligatorio.', 'error'); return; }
    if (!rem)  { mostrarMensaje('El Remitente es obligatorio.',    'error'); return; }
    if (!asu)  { mostrarMensaje('El Asunto es obligatorio.',       'error'); return; }

    const datos = {
        num_radicado:          num,
        fecha_radicado:        document.getElementById('fecha_radicado').value,
        hora_radicado:         document.getElementById('hora_radicado').value,
        fecha_documento:       document.getElementById('fecha_documento').value,
        nombre_destinatario:   dest,
        cargo_destinatario:    document.getElementById('cargo_destinatario').value,
        dependencia_dest:      document.getElementById('dependencia_dest').value,
        direccion_dest:        document.getElementById('direccion_dest').value,
        telefono_dest:         document.getElementById('telefono_dest').value,
        ciudad_dest:           document.getElementById('ciudad_dest').value,
        nombre_remitente:      rem,
        cargo_remitente:       document.getElementById('cargo_remitente').value,
        dependencia_remitente: document.getElementById('dependencia_remitente').value,
        direccion_remitente:   document.getElementById('direccion_remitente').value,
        telefono_remitente:    document.getElementById('telefono_remitente').value,
        ciudad_remitente:      document.getElementById('ciudad_remitente').value,
        asunto:                asu,
        medios_entrega:        document.getElementById('medios_entrega').value,
        tiempo_respuesta:      document.getElementById('tiempo_respuesta').value,
        fecha_est_respuesta:   document.getElementById('fecha_est_respuesta').value,
        estado:                document.getElementById('estado').value || 'Pendiente',
        observaciones:         document.getElementById('observaciones').value,
        tipo_registro:         document.getElementById('tipo_registro').value,
        usuario_registro:      usuario
    };

    try {
        const res  = await fetch('/api/radicados', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(datos)
        });
        const resp = await res.json();

        if (resp.ok) {
            mostrarMensaje('✅ ' + resp.mensaje, 'exito');
            setTimeout(nuevoRadicado, 2000);
        } else {
            mostrarMensaje(resp.mensaje, 'error');
        }
    } catch (err) {
        mostrarMensaje('Error de conexión con el servidor.', 'error');
    }
}

// ── Helpers ───────────────────────────────────────────────────
function mostrarMensaje(texto, tipo) {
    const msg = document.getElementById('mensaje');
    msg.textContent = texto;
    msg.className   = 'mensaje ' + tipo;
    msg.scrollIntoView({ behavior: 'smooth' });
}

function ocultarMensaje() {
    document.getElementById('mensaje').className = 'mensaje oculto';
}