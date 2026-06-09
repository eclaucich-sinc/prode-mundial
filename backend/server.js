const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const partidosRoutes = require('./routes/partidos');         // NUEVO
const prediccionesRoutes = require('./routes/predicciones'); // NUEVO
const adminRoutes = require('./routes/admin'); // NUEVO: Importamos las rutas de admin
const usuariosRoutes = require('./routes/usuarios'); // NUEVO
const albumRoutes = require('./routes/album'); // NUEVO

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('⚽ ¡Conectado exitosamente a MongoDB!'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error));

app.use('/api/auth', authRoutes);
app.use('/api/partidos', partidosRoutes);         // NUEVO
app.use('/api/predicciones', prediccionesRoutes); // NUEVO
app.use('/api/admin', adminRoutes); // NUEVO: Activamos la ruta admin
app.use('/api/usuarios', usuariosRoutes); // NUEVO
app.use('/api/album', albumRoutes); // NUEVO

app.get('/', (req, res) => {
  res.send('El servidor del Prode Mundial está funcionando 🏆');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});