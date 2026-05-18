const express = require('express');
const router = express.Router();
const Partido = require('../models/Partido');
const Prediccion = require('../models/Prediccion');
const Usuario = require('../models/Usuario');
const auth = require('../middleware/auth'); // Usamos el token para verificar quién lo envía

// RUTA: Cargar resultado de un partido y calcular puntos
router.post('/resultado/:partido_id', auth, async (req, res) => {
  try {
    const { partido_id } = req.params;
    const { goles_local, goles_visitante, hubo_roja, hubo_penal } = req.body;

    // 1. Buscamos el partido y verificamos que no esté ya finalizado
    const partido = await Partido.findById(partido_id);
    if (!partido) return res.status(404).json({ mensaje: 'Partido no encontrado' });
    
    if (partido.estado === 'finalizado') {
      return res.status(400).json({ mensaje: 'Este partido ya fue procesado antes.' });
    }

    // 2. Actualizamos el partido con la realidad
    partido.estado = 'finalizado';
    partido.resultado_real = { goles_local, goles_visitante };
    partido.eventos_especiales = { hubo_roja, hubo_penal };
    await partido.save();

    // 3. Buscamos TODAS las predicciones que la gente hizo para este partido
    const predicciones = await Prediccion.find({ partido_id });

    // 4. EL MOTOR DE CÁLCULO: Evaluamos predicción por predicción
    for (let pred of predicciones) {
      let puntosSumados = 0;

      const difReal = goles_local - goles_visitante;
      const difPred = pred.prediccion_goles_local - pred.prediccion_goles_visitante;

      // --- Puntos por Resultado ---
      if (pred.prediccion_goles_local === goles_local && pred.prediccion_goles_visitante === goles_visitante) {
        puntosSumados += 5; // Acertó el resultado exacto
      } else if (
        (difReal > 0 && difPred > 0) || // Acertó que ganaba el local
        (difReal < 0 && difPred < 0) || // Acertó que ganaba el visitante
        (difReal === 0 && difPred === 0) // Acertó que era empate
      ) {
        puntosSumados += 3; // Acertó la tendencia (ganador o empate)
      }

      // --- Puntos por Eventos Especiales (Bonus) ---
      // Si el usuario puso que SI a la roja, y hubo roja (o si puso que NO, y no hubo)
      if (hubo_roja===false && pred.prediccion_roja===false){
        puntosSumados += 1;
      }
      else if (hubo_roja===true && pred.prediccion_roja===true){
        puntosSumados += 2;
      }
      if (hubo_penal===false && pred.prediccion_penal===false){
        puntosSumados += 1;
      }
      else if (hubo_penal===true && pred.prediccion_penal===true){
        puntosSumados += 2;
      }

      // 5. Guardamos los puntos en la predicción para el historial
      pred.puntos_ganados = puntosSumados;
      await pred.save();

      // 6. Le sumamos los puntos al acumulado total del Usuario
      await Usuario.findByIdAndUpdate(pred.usuario_id, {
        $inc: { puntos_totales: puntosSumados } // $inc es una función mágica de MongoDB para sumar
      });
    }

    res.json({ 
      mensaje: '¡Resultados cargados y ranking actualizado!', 
      predicciones_procesadas: predicciones.length 
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar el resultado', error: error.message });
  }
});

module.exports = router;