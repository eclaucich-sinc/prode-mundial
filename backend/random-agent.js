require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');
const Partido = require('./models/Partido');
const Prediccion = require('./models/Prediccion');

async function hacerPrediccionesRandom() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const nombreUsuario = "Random3"

    console.log(`✅ Conectado a MongoDB para agente ${nombreUsuario}`);


    const usuarioRandom = await Usuario.findOne({ nombre: nombreUsuario });
    if (!usuarioRandom) {
      console.log(`❌ El usuario "${nombreUsuario}" no existe en la base de datos.`);
      process.exit(1);
    }

    const partidosPendientes = await Partido.find({ estado: 'pendiente' });
    if (partidosPendientes.length === 0) {
      console.log('ℹ️ No hay partidos pendientes para predecir.');
      process.exit(0);
    }

    let prediccionesNuevas = 0;
    let prediccionesActualizadas = 0;

    for (const partido of partidosPendientes) {
      // Generar goles aleatorios (ej. de 0 a 4)
      const golesLocal = Math.floor(Math.random() * 5);
      const golesVisitante = Math.floor(Math.random() * 5);
      // Generar probabilidad de roja (ej. 15% de chances)
      const huboRoja = Math.random() < 0.5;
      // Generar probabilidad de penal (ej. 25% de chances)
      const huboPenal = Math.random() < 0.5;

      const prediccionData = {
        usuario_id: usuarioRandom._id,
        partido_id: partido._id,
        prediccion_goles_local: golesLocal,
        prediccion_goles_visitante: golesVisitante,
        prediccion_roja: huboRoja,
        prediccion_penal: huboPenal
      };

      const prediccionExistente = await Prediccion.findOne({
        usuario_id: usuarioRandom._id,
        partido_id: partido._id
      });

      if (prediccionExistente) {
        await Prediccion.updateOne(
          { _id: prediccionExistente._id },
          { $set: prediccionData }
        );
        prediccionesActualizadas++;
      } else {
        await new Prediccion(prediccionData).save();
        prediccionesNuevas++;
      }
    }

    console.log(`🤖 Agente ${nombreUsuario} finalizó exitosamente.`);
    console.log(`✨ Predicciones nuevas: ${prediccionesNuevas}`);
    console.log(`🔄 Predicciones actualizadas: ${prediccionesActualizadas}`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error en el agente ${nombreUsuario}:`, error);
    process.exit(1);
  }
}

hacerPrediccionesRandom();
