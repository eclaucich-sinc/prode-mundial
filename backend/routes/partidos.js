const express = require('express');
const router = express.Router();
const Partido = require('../models/Partido');
const Prediccion = require('../models/Prediccion');

// RUTA: Obtener estadísticas detalladas de partidos finalizados
router.get('/estadisticas', async (req, res) => {
  try {
    const partidosFinalizados = await Partido.find({ estado: 'finalizado' }).sort({ fecha_hora: -1 });
    
    if (partidosFinalizados.length === 0) {
      return res.json([]);
    }

    const predicciones = await Prediccion.find({ partido_id: { $in: partidosFinalizados.map(p => p._id) } });

    const estadisticas = partidosFinalizados.map(partido => {
      const predsPartido = predicciones.filter(p => p.partido_id.toString() === partido._id.toString());
      
      let maxPuntos = 0;
      let sumaPuntos = 0;
      let totalPreds = predsPartido.length;
      let aciertosExactos = 0;
      let aciertosTendencia = 0;
      let ceros = 0;

      predsPartido.forEach(p => {
        const pts = p.puntos_ganados || 0;
        sumaPuntos += pts;
        if (pts > maxPuntos) maxPuntos = pts;
        if (pts === 5) aciertosExactos++;
        else if (pts === 3) aciertosTendencia++;
        else if (pts === 0) ceros++;
      });

      const promedioPuntos = totalPreds > 0 ? (sumaPuntos / totalPreds).toFixed(1) : 0;

      return {
        partido_id: partido._id,
        equipo_local: partido.equipo_local,
        equipo_visitante: partido.equipo_visitante,
        resultado_real: partido.resultado_real,
        promedioPuntos,
        maxPuntos,
        totalPreds,
        aciertosExactos,
        aciertosTendencia,
        ceros
      };
    });

    res.json(estadisticas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las estadísticas' });
  }
});

// RUTA: Obtener todos los partidos (ordenados por fecha)
router.get('/', async (req, res) => {
  try {
    const partidos = await Partido.find().sort({ fecha_hora: 1 });
    res.json(partidos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los partidos' });
  }
});

// RUTA: Crear un partido (Por ahora la dejamos abierta para cargar datos de prueba)
router.post('/', async (req, res) => {
  try {
    const nuevoPartido = new Partido(req.body);
    await nuevoPartido.save();
    res.status(201).json({ mensaje: 'Partido creado', partido: nuevoPartido });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear partido', error: error.message });
  }
});

module.exports = router;