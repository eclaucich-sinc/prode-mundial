require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');
const Partido = require('./models/Partido');
const Prediccion = require('./models/Prediccion');

async function resetearResultados() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB. Iniciando limpieza del sistema...');

    // 1. Resetear todos los Partidos a 'pendiente' y borrar resultados reales
    const resPartidos = await Partido.updateMany({}, {
      $set: {
        estado: 'pendiente',
        resultado_real: { goles_local: null, goles_visitante: null }
      }
    });
    console.log(`🏟️  Partidos reseteados a estado pendiente: ${resPartidos.modifiedCount}`);

    // 2. Resetear Predicciones (borrar los puntos ganados, pero mantener la predicción intacta)
    const resPredicciones = await Prediccion.updateMany({}, {
      $set: { puntos_ganados: null }
    });
    console.log(`🔮 Predicciones limpiadas (puntos borrados): ${resPredicciones.modifiedCount}`);

    // 3. Resetear Usuarios (volver el puntaje total a 0)
    const resUsuarios = await Usuario.updateMany({}, {
      $set: { puntos_totales: 0 }
    });
    console.log(`👥 Usuarios reiniciados (puntaje en 0): ${resUsuarios.modifiedCount}`);

    console.log('\n✨ ¡Reseteo completado exitosamente!');
    console.log('El sistema ahora está limpio y listo para volver a probar o arrancar el torneo real.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el reseteo:', error);
    process.exit(1);
  }
}

resetearResultados();
