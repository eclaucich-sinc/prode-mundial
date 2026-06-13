const express = require('express');
const router = express.Router();
const Prediccion = require('../models/Prediccion');
const Partido = require('../models/Partido');
const auth = require('../middleware/auth'); // Traemos al "guardia de seguridad"

// RUTA: Guardar o actualizar una predicción (Requiere Token)
router.post('/', auth, async (req, res) => {
  try {
    const { partido_id, prediccion_goles_local, prediccion_goles_visitante } = req.body;
    const usuario_id = req.usuario.id; // Esto lo extrajo nuestro middleware del Token!

    // Validar que el partido exista y no haya expirado el tiempo de predicción
    const partido = await Partido.findById(partido_id);
    if (!partido) return res.status(404).json({ mensaje: 'Partido no encontrado' });

    const ahora = new Date();
    const partidoObj = new Date(partido.fecha_hora);
    partidoObj.setHours(partidoObj.getHours() + 3); // Ajuste de zona horaria UTC-3 (Argentina)

    if (ahora >= partidoObj) {
      return res.status(403).json({ mensaje: 'Ya no puedes hacer predicciones para este partido. El partido ya comenzó.' });
    }

    // Usamos findOneAndUpdate con upsert para evitar race conditions si el usuario hace doble click rápido
    const prediccion = await Prediccion.findOneAndUpdate(
      { usuario_id, partido_id }, // Criterio de búsqueda
      { 
        prediccion_goles_local, 
        prediccion_goles_visitante 
      }, // Valores a actualizar o insertar
      { 
        new: true, // Devuelve el documento ya actualizado
        upsert: true, // Si no existe, lo crea
        setDefaultsOnInsert: true // Aplica los defaults (como puntos_ganados: null)
      }
    );

    res.json({ mensaje: 'Predicción guardada exitosamente', prediccion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar la predicción', error: error.message });
  }
});

// RUTA: Obtener las predicciones del usuario que está logueado (Requiere Token)
router.get('/mias', auth, async (req, res) => {
  try {
    const predicciones = await Prediccion.find({ usuario_id: req.usuario.id });
    res.json(predicciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener predicciones' });
  }
});

module.exports = router;