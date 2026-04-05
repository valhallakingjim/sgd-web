const express = require('express');
const path    = require('path');
const cors    = require('cors');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const authRoutes     = require('./routes/auth');
const radicadoRoutes = require('./routes/radicados');

app.use('/api/auth', authRoutes);
app.use('/api/radicados', radicadoRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`SGD corriendo en http://localhost:${PORT}`);
});

const usuarioRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuarioRoutes);