const express = require('express');
const router = express.Router();
const Partido = require('../models/Partido');
const Prediccion = require('../models/Prediccion');
const Usuario = require('../models/Usuario');
const auth = require('../middleware/auth'); // Usamos el token para verificar quién lo envía

function calcularPosiciones(partidosSimulados) {
  const equipos = {};
  for (const p of partidosSimulados) {
    if (!equipos[p.equipo_local]) equipos[p.equipo_local] = { nombre: p.equipo_local, pts: 0, dif: 0, gf: 0 };
    if (!equipos[p.equipo_visitante]) equipos[p.equipo_visitante] = { nombre: p.equipo_visitante, pts: 0, dif: 0, gf: 0 };

    const gl = p.goles_local;
    const gv = p.goles_visitante;

    equipos[p.equipo_local].gf += gl;
    equipos[p.equipo_local].dif += (gl - gv);
    equipos[p.equipo_visitante].gf += gv;
    equipos[p.equipo_visitante].dif += (gv - gl);

    if (gl > gv) {
      equipos[p.equipo_local].pts += 3;
    } else if (gl < gv) {
      equipos[p.equipo_visitante].pts += 3;
    } else {
      equipos[p.equipo_local].pts += 1;
      equipos[p.equipo_visitante].pts += 1;
    }
  }

  const ranking = Object.values(equipos).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dif !== a.dif) return b.dif - a.dif;
    return b.gf - a.gf;
  });

  if (ranking.length < 2) return [null, null];
  return [ranking[0].nombre, ranking[1].nombre];
}

// RUTA: Cargar resultado de un partido y calcular puntos
router.post('/resultado/:partido_id', auth, async (req, res) => {
  try {
    const { partido_id } = req.params;
    const { goles_local, goles_visitante } = req.body;

    // 1. Buscamos el partido y verificamos que no esté ya finalizado
    const partido = await Partido.findById(partido_id);
    if (!partido) return res.status(404).json({ mensaje: 'Partido no encontrado' });

    if (partido.estado === 'finalizado') {
      return res.status(400).json({ mensaje: 'Este partido ya fue procesado antes.' });
    }

    // 2. Actualizamos el partido con la realidad
    partido.estado = 'finalizado';
    partido.resultado_real = { goles_local, goles_visitante };
    await partido.save();

    // 2.5. LÓGICA DE sinc(i): Generar la predicción del bot basado en las tendencias de la gente
    const isSincI = process.env.CLIENT_NAME === 'sinc(i)';

    if (isSincI) {
      let usuarioSincI = await Usuario.findOne({ nombre: 'sinc(i)' });

      const modelosIA = ['Random1', 'Random2', 'Random3', 'Claude Sonnet 4.6', 'GPT-5.5', 'Qwen3.6', 'DeepSeek-V3', 'Gemini 3.1 Pro'];
      const usuariosReales = await Usuario.find({ nombre: { $nin: modelosIA } });
      const idsUsuariosReales = usuariosReales.map(u => u._id.toString());

      let prediccionesReales = await Prediccion.find({ partido_id });
      prediccionesReales = prediccionesReales.filter(p => idsUsuariosReales.includes(p.usuario_id.toString()));

      if (prediccionesReales.length > 0 && usuarioSincI) {
        let ganaLocal = [], ganaVisitante = [], empate = [];

        for (const p of prediccionesReales) {
          if (p.prediccion_goles_local > p.prediccion_goles_visitante) ganaLocal.push(p);
          else if (p.prediccion_goles_local < p.prediccion_goles_visitante) ganaVisitante.push(p);
          else empate.push(p);
        }

        let tendenciaGanadora = ganaLocal;
        if (ganaVisitante.length > tendenciaGanadora.length) tendenciaGanadora = ganaVisitante;
        if (empate.length > tendenciaGanadora.length) tendenciaGanadora = empate;

        // Si hay empate en cantidades, nos quedamos con la tendenciaGanadora actual que ya se seteó (prioridad: Local -> Visitante -> Empate)

        const calcularMediana = (arr) => {
          if (arr.length === 0) return 0;
          const sorted = [...arr].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
        };

        const predLocales = tendenciaGanadora.map(p => p.prediccion_goles_local);
        const predVisitantes = tendenciaGanadora.map(p => p.prediccion_goles_visitante);

        const golesLocalSinc = calcularMediana(predLocales);
        const golesVisitanteSinc = calcularMediana(predVisitantes);

        let predSincI = await Prediccion.findOne({ usuario_id: usuarioSincI._id, partido_id });
        if (!predSincI) {
          predSincI = new Prediccion({
            usuario_id: usuarioSincI._id,
            partido_id,
            prediccion_goles_local: golesLocalSinc,
            prediccion_goles_visitante: golesVisitanteSinc
          });
        } else {
          predSincI.prediccion_goles_local = golesLocalSinc;
          predSincI.prediccion_goles_visitante = golesVisitanteSinc;
        }
        await predSincI.save();
      }
    }

    // 3. Buscamos TODAS las predicciones que la gente hizo para este partido (incluida la nueva de sinc(i))
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


      // 5. Guardamos los puntos en la predicción para el historial
      pred.puntos_ganados = puntosSumados;
      await pred.save();

      // 6. Le sumamos los puntos al acumulado total del Usuario
      await Usuario.findByIdAndUpdate(pred.usuario_id, {
        $inc: { puntos_totales: puntosSumados } // $inc es una función mágica de MongoDB para sumar
      });
    }

    res.json({
      mensaje: `¡Resultados cargados y ranking actualizado!`,
      predicciones_procesadas: predicciones.length
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar el resultado', error: error.message });
  }
});

// RUTA: Calcular bonus de grupo bajo demanda
router.post('/bonus/:grupo', auth, async (req, res) => {
  try {
    const { grupo } = req.params;

    const partidosDelGrupo = await Partido.find({ grupo_o_fase: grupo });
    if (partidosDelGrupo.length === 0) {
      return res.status(404).json({ mensaje: 'Grupo no encontrado o sin partidos' });
    }

    const todosFinalizados = partidosDelGrupo.every(p => p.estado === 'finalizado');
    if (!todosFinalizados) {
      return res.status(400).json({ mensaje: 'No todos los partidos del grupo están finalizados' });
    }

    // Check if we already applied bonus to this group
    const yaAplicado = partidosDelGrupo.some(p => p.bonus_aplicado);
    if (yaAplicado) {
      return res.status(400).json({ mensaje: 'El bonus de este grupo ya fue calculado' });
    }

    const X = 5; // Valor base del bonus
    const usuarios = await Usuario.find({});

    // Clasificados reales
    const realMatches = partidosDelGrupo.map(p => ({
      equipo_local: p.equipo_local,
      equipo_visitante: p.equipo_visitante,
      goles_local: p.resultado_real.goles_local,
      goles_visitante: p.resultado_real.goles_visitante
    }));
    const [real1, real2] = calcularPosiciones(realMatches);

    for (let usuario of usuarios) {
      const predsUsuario = await Prediccion.find({
        usuario_id: usuario._id,
        partido_id: { $in: partidosDelGrupo.map(p => p._id) }
      });

      if (predsUsuario.length === 0) continue;

      let bonusSumados = 0;

      // Bonus 1: Top 2 teams (Clasificados)
      const userMatches = partidosDelGrupo.map(p => {
        const pred = predsUsuario.find(pr => pr.partido_id.toString() === p._id.toString());
        return {
          equipo_local: p.equipo_local,
          equipo_visitante: p.equipo_visitante,
          goles_local: pred ? pred.prediccion_goles_local : 0,
          goles_visitante: pred ? pred.prediccion_goles_visitante : 0
        };
      });
      const [user1, user2] = calcularPosiciones(userMatches);

      if (user1 === real1 && user2 === real2) {
        bonusSumados += (2 * X); // Orden correcto
      } else if ((user1 === real1 || user1 === real2) && (user2 === real1 || user2 === real2)) {
        bonusSumados += X; // Orden incorrecto
      }

      // Bonus 2: Tendencias / Exactos del Grupo Completo
      let allTendenciesCorrect = true;
      let allExactCorrect = true;

      if (predsUsuario.length !== partidosDelGrupo.length) {
        allTendenciesCorrect = false;
        allExactCorrect = false;
      } else {
        for (let p of partidosDelGrupo) {
          const pred = predsUsuario.find(pr => pr.partido_id.toString() === p._id.toString());
          const realL = p.resultado_real.goles_local;
          const realV = p.resultado_real.goles_visitante;
          const predL = pred.prediccion_goles_local;
          const predV = pred.prediccion_goles_visitante;

          if (predL !== realL || predV !== realV) {
            allExactCorrect = false;
          }

          const difReal = realL - realV;
          const difPred = predL - predV;
          const tendenciaCorrecta = (difReal > 0 && difPred > 0) || (difReal < 0 && difPred < 0) || (difReal === 0 && difPred === 0);

          if (!tendenciaCorrecta) {
            allTendenciesCorrect = false;
          }
        }
      }

      if (allExactCorrect) {
        bonusSumados += (8 * X);
      } else if (allTendenciesCorrect) {
        bonusSumados += 4 * X;
      }

      if (bonusSumados > 0) {
        usuario.puntos_totales += bonusSumados;
        usuario[`bonus_${grupo}`] = bonusSumados; // Guardamos el bonus por grupo
        await usuario.save();

        // Actualizamos los puntos ganados de la última predicción del grupo
        const ultimaPred = predsUsuario[predsUsuario.length - 1];
        if (ultimaPred) {
          ultimaPred.puntos_ganados = (ultimaPred.puntos_ganados || 0) + bonusSumados;
          await ultimaPred.save();
        }
      }
    }

    // Set flag so we don't calculate again
    for (let p of partidosDelGrupo) {
      p.bonus_aplicado = true;
      await p.save();
    }

    res.json({ mensaje: `¡Bonus del ${grupo} calculado exitosamente!` });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al calcular bonus', error: error.message });
  }
});

module.exports = router;