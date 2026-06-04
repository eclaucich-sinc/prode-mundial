require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');
const Partido = require('./models/Partido');
const Prediccion = require('./models/Prediccion');

async function generarResultadosRandom() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB para generar resultados reales (SIMULADOR DE ADMIN)');

    const partidosPendientes = await Partido.find({ estado: 'pendiente' });
    if (partidosPendientes.length === 0) {
      console.log('ℹ️ No hay partidos pendientes para jugar.');
      process.exit(0);
    }

    let partidosSimulados = 0;

    for (const partido of partidosPendientes) {
      // Generar resultado real (0 a 4 goles)
      const goles_local = Math.floor(Math.random() * 5);
      const goles_visitante = Math.floor(Math.random() * 5);
      // Actualizar partido
      partido.estado = 'finalizado';
      partido.resultado_real = { goles_local, goles_visitante };
      await partido.save();

      // Procesar predicciones de la gente
      const predicciones = await Prediccion.find({ partido_id: partido._id });

      for (let pred of predicciones) {
        let puntosSumados = 0;

        const difReal = goles_local - goles_visitante;
        const difPred = pred.prediccion_goles_local - pred.prediccion_goles_visitante;

        // --- Puntos por Resultado ---
        if (pred.prediccion_goles_local === goles_local && pred.prediccion_goles_visitante === goles_visitante) {
          puntosSumados += 5;
        } else if (
          (difReal > 0 && difPred > 0) ||
          (difReal < 0 && difPred < 0) ||
          (difReal === 0 && difPred === 0)
        ) {
          puntosSumados += 3;
        }



        // Guardar puntos en la prediccion
        pred.puntos_ganados = puntosSumados;
        await pred.save();

        // Sumar al usuario
        await Usuario.findByIdAndUpdate(pred.usuario_id, {
          $inc: { puntos_totales: puntosSumados }
        });
      }
      partidosSimulados++;
    }

    console.log(`🏆 Simulación finalizada exitosamente.`);
    console.log(`✨ Partidos jugados: ${partidosSimulados}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el simulador de resultados:', error);
    process.exit(1);
  }
}

generarResultadosRandom();
