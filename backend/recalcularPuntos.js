const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Adjust if env is elsewhere

const Usuario = require('./models/Usuario');
const Prediccion = require('./models/Prediccion');
const Partido = require('./models/Partido');

async function recalcularPuntos() {
  try {
    console.log('Conectando a la base de datos...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prode');
    console.log('Conexión exitosa.');

    const usuarios = await Usuario.find({});
    console.log(`Se encontraron ${usuarios.length} usuarios.`);

    for (let usuario of usuarios) {
      console.log(`Recalculando puntos para ${usuario.nombre}...`);
      
      // Obtener todas las predicciones del usuario con puntos ganados
      const predicciones = await Prediccion.find({ 
        usuario_id: usuario._id,
        puntos_ganados: { $ne: null }
      });

      let totalPuntos = 0;
      for (let pred of predicciones) {
        totalPuntos += pred.puntos_ganados;
      }

      console.log(`  -> Puntos sumados de predicciones: ${totalPuntos}`);
      
      // Actualizar los puntos totales del usuario
      usuario.puntos_totales = totalPuntos;
      await usuario.save();
    }

    console.log('Recálculo finalizado exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error al recalcular puntos:', error);
    process.exit(1);
  }
}

recalcularPuntos();
