import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ModalAyuda = ({ alCerrar }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  }}>
    <div className="glass-panel" style={{
      padding: '40px', maxWidth: '800px', width: '90%', maxHeight: '85vh', overflowY: 'auto',
      backgroundColor: '#0f172a', border: '1px solid var(--card-border)'
    }}>
      <h2 style={{ marginTop: 0, color: 'var(--primary-color)', textAlign: 'center', fontSize: '32px', marginBottom: '20px' }}>🏆 Cómo jugar al Prode Mundial</h2>

      <p style={{ textAlign: 'center', fontSize: '16px', color: 'var(--text-main)', marginBottom: '30px' }}>
        El objetivo es simple: <strong>acertar la mayor cantidad de resultados</strong> de los partidos del mundial para sumar puntos y levantar la copa del sinc(i).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
        {/* Section: Navegación */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
          <h3 style={{ color: 'var(--primary-color)', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🗺️</span> Guía de Navegación
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
            <li><strong>📅 Hoy:</strong> Como hay partidos que se juegan en la madrugada. La jornada de "Hoy" es desde las 10AM de hoy hasta las 10AM de mañana. Así no te perdés de predecir partidos que arrancan muy temprano.</li>
            <li><strong>📋 Fixture:</strong> El panorama completo. Navegá por todos los grupos, mirá qué partidos faltan y dejá tus predicciones para cualquier fecha futura.</li>
          </ul>
        </div>

        {/* Section: Reglas de Predicción */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
          <h3 style={{ color: '#3b82f6', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⏳</span> Reglas Clave
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
            <li>Las predicciones <strong>se cierran en el momento exacto en que comienza el partido</strong>. Asegurate de hacerlas a tiempo.</li>
            <li>No es obligatorio predecir todos los partidos, pero si no lo hacés, ¡perdés la oportunidad de sumar puntos!</li>
            <li>Una vez finalizado un partido, el sistema actualizará el resultado real y repartirá los puntos correspondientes a todos.</li>
            <li>Está permitido registrar una IA propia o algún sistema de predicción que juegue por ustedes. Pueden desarrollar algo en grupo si desean. Si hacen algo así, pueden registrar el nombre finalizando con (IA) así es claro que no es un humano tomando decisiones.</li>
          </ul>
        </div>

        {/* Section: Puntuación */}
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.3)' }}>
          <h3 style={{ color: 'var(--success-color)', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚽</span> Sistema de Puntuación
          </h3>
          <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ background: 'var(--success-color)', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', minWidth: '70px', textAlign: 'center' }}>+3 Pts</span>
              <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}><strong>Acertar la TENDENCIA:</strong> Adivinar quién gana o si hay empate. (Ej: decís 2-1 y termina 1-0).</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ background: 'var(--primary-color)', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', minWidth: '70px', textAlign: 'center' }}>+5 Pts</span>
              <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}><strong>Acertar el resultado EXACTO:</strong> Dar en el clavo con los goles. (Ej: decís 2-1 y termina 2-1).</span>
            </div>

            <h4 style={{ color: 'var(--text-main)', margin: '10px 0 0 0', borderBottom: '1px solid var(--card-border)', paddingBottom: '5px' }}>🎁 Bonus de Fase de Grupos (Al finalizar cada grupo)</h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ background: '#8b5cf6', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', minWidth: '70px', textAlign: 'center' }}>+5 Pts</span>
              <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}><strong>Clasificados (Desordenados):</strong> Acertar los 2 equipos que pasan a la siguiente ronda, pero en el orden incorrecto.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ background: '#8b5cf6', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', minWidth: '70px', textAlign: 'center' }}>+10 Pts</span>
              <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}><strong>Clasificados (Exactos):</strong> Acertar los 2 equipos que pasan a la siguiente ronda en el orden exacto (1ro y 2do).</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ background: '#ec4899', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', minWidth: '70px', textAlign: 'center' }}>+20 Pts</span>
              <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}><strong>Gurú de Tendencias:</strong> Acertar la TENDENCIA (quién gana o empate) de TODOS los partidos de un grupo.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ background: '#ec4899', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', minWidth: '70px', textAlign: 'center' }}>+40 Pts</span>
              <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}><strong>Perfección de Grupo:</strong> Acertar el RESULTADO EXACTO de TODOS los partidos de un grupo.</span>
            </div>
          </div>
        </div>

        {/* Section: Competencia */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
          <h3 style={{ color: '#eab308', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🤖</span> La Batalla Final
          </h3>
          <p style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Este prode es exclusivo interno al equipo <strong>sinc(i)</strong>. Sin embargo, no estaremos compitiendo solo entre nosotros, sino que también contra modelos de IA (Claude Sonnet, Gemini) y predictores aleatorios.
          </p>
          <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6', fontWeight: 'bold' }}>
            🎁 Habrá premios para el podio al finalizar el mundial... ¡A menos que gane una IA, en ese caso no nos merecemos ganar nada!
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={alCerrar}
          className="btn-primary"
          style={{ padding: '15px 40px', fontSize: '18px', borderRadius: '30px' }}
        >
          ¡Entendido, a jugar!
        </button>
      </div>
    </div>
  </div>
);

// --- SUB-COMPONENTE MEJORADO: La tarjetita de cada partido con comparativa ---
const PartidoCard = ({ partido, prediccionPrevia, token }) => {
  // Estados para los inputs de predicción (solo se usan si está pendiente)
  const [golesLocal, setGolesLocal] = useState(prediccionPrevia ? prediccionPrevia.prediccion_goles_local : 0);
  const [golesVisitante, setGolesVisitante] = useState(prediccionPrevia ? prediccionPrevia.prediccion_goles_visitante : 0);
  const [estadoGuardado, setEstadoGuardado] = useState('');
  const [expandido, setExpandido] = useState(false);

  const finalizado = partido.estado === 'finalizado';

  const ahora = new Date();
  const partidoObj = new Date(partido.fecha_hora);
  partidoObj.setHours(partidoObj.getHours() + 3);
  const prediccionCerrada = finalizado || ahora >= partidoObj;

  const fechaFormateada = new Date(partido.fecha_hora).toLocaleString([], {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
  });

  const guardarPrediccion = async () => {
    setEstadoGuardado('⏳...');
    try {
      const res = await fetch('https://prode-mundial-t3nt.onrender.com/api/predicciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          partido_id: partido._id,
          prediccion_goles_local: Number(golesLocal),
          prediccion_goles_visitante: Number(golesVisitante)
        })
      });
      if (res.ok) {
        setEstadoGuardado('✅ Guardado');
      } else {
        setEstadoGuardado('❌ Error');
      }
      setTimeout(() => setEstadoGuardado(''), 3000);
    } catch (error) {
      setEstadoGuardado('❌ Error de red');
    }
  };

  // Estilos comunes para los contenedores de marcadores
  const contenedorMarcadorStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    padding: '10px',
    borderRadius: '5px',
    background: 'rgba(255,255,255,0.05)'
  };

  const circuloGolesStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--bg-color)',
    color: 'var(--text-main)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: 'bold'
  };

  return (
    <div style={{ border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '15px', background: finalizado ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      {/* Cabecera Clickable (Vista colapsada) */}
      <div
        onClick={() => setExpandido(!expandido)}
        style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
            {partido.equipo_local} vs {partido.equipo_visitante}
          </h3>
          <span style={{ fontSize: '12px', color: '#888' }}>
            {fechaFormateada} • {partido.grupo_o_fase} {finalizado && ' • FINALIZADO'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {finalizado && (
            <div style={{ fontSize: '16px', fontWeight: 'bold', padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--card-border)' }}>
              {partido.resultado_real?.goles_local} - {partido.resultado_real?.goles_visitante}
            </div>
          )}
          {!finalizado && prediccionPrevia && (
            <span style={{ fontSize: '12px', color: 'var(--success-color)', fontWeight: 'bold' }}>✅ Pronosticado</span>
          )}
          <span style={{ fontSize: '12px', color: 'var(--primary-color)' }}>{expandido ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Contenido Expandido */}
      {expandido && (
        <div style={{ padding: '15px', borderTop: '1px solid #ddd' }}>
          {/* --- DISEÑO SI EL PARTIDO ESTÁ FINALIZADO --- */}
          {finalizado ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Fila 1: Comparativa de Marcadores */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '10px' }}>
                {/* Bloque Tu Predicción */}
                <div style={{ textAlign: 'center', flex: 1, border: '1px dashed #ccc', padding: '10px', borderRadius: '5px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Tu Predicción</div>
                  <div style={{ ...contenedorMarcadorStyle, backgroundColor: 'transparent', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{partido.equipo_local}</span>
                    <span style={{ ...circuloGolesStyle, background: 'var(--text-muted)', fontSize: '16px', width: '30px', height: '30px' }}>
                      {prediccionPrevia ? prediccionPrevia.prediccion_goles_local : '-'}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>-</span>
                    <span style={{ ...circuloGolesStyle, background: 'var(--text-muted)', fontSize: '16px', width: '30px', height: '30px' }}>
                      {prediccionPrevia ? prediccionPrevia.prediccion_goles_visitante : '-'}
                    </span>
                    <span style={{ fontSize: '14px' }}>{partido.equipo_visitante}</span>
                  </div>
                </div>

                <div style={{ fontSize: '24px' }}>👉</div>

                {/* Bloque Resultado Real */}
                <div style={{ textAlign: 'center', flex: 1, border: '2px solid var(--success-color)', padding: '10px', borderRadius: '5px', background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--success-color)', fontWeight: 'bold', marginBottom: '5px' }}>Resultado Real</div>
                  <div style={{ ...contenedorMarcadorStyle, backgroundColor: 'transparent', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{partido.equipo_local}</span>
                    <span style={circuloGolesStyle}>
                      {partido.resultado_real.goles_local}
                    </span>
                    <span style={{ fontWeight: 'bold', fontSize: '20px' }}>-</span>
                    <span style={circuloGolesStyle}>
                      {partido.resultado_real.goles_visitante}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{partido.equipo_visitante}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* --- DISEÑO SI EL PARTIDO ESTÁ PENDIENTE --- */
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>{partido.equipo_local}</label>
                  <input
                    type="number" min="0" value={golesLocal}
                    onChange={(e) => setGolesLocal(e.target.value)}
                    disabled={prediccionCerrada}
                    style={{ width: '50px', textAlign: 'center', fontSize: '18px', padding: '5px', borderRadius: '4px', opacity: prediccionCerrada ? 0.5 : 1 }}
                  />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>-</span>
                <div style={{ textAlign: 'center' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>{partido.equipo_visitante}</label>
                  <input
                    type="number" min="0" value={golesVisitante}
                    onChange={(e) => setGolesVisitante(e.target.value)}
                    disabled={prediccionCerrada}
                    style={{ width: '50px', textAlign: 'center', fontSize: '18px', padding: '5px', borderRadius: '4px', opacity: prediccionCerrada ? 0.5 : 1 }}
                  />
                </div>
              </div>

              {prediccionCerrada ? (
                <div style={{ textAlign: 'center', color: 'var(--danger-color)', fontWeight: 'bold', fontSize: '14px' }}>
                  ⏳ Predicciones cerradas.
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={guardarPrediccion}
                    className="btn-primary"
                    style={{ padding: '10px 25px', fontSize: '14px' }}>
                    Guardar Pronóstico
                  </button>
                  <span style={{ marginLeft: '10px', fontWeight: 'bold', fontSize: '14px' }}>{estadoGuardado}</span>
                </div>
              )}
            </>
          )}

          {/* Caja de Puntos (Siempre visible al final) */}
          {prediccionPrevia && prediccionPrevia.puntos_ganados !== null && (
            <div style={{ textAlign: 'center', marginTop: '15px', padding: '10px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '5px', color: 'var(--success-color)', fontWeight: 'bold', border: '1px solid rgba(34,197,94,0.3)' }}>
              🏆 Puntos obtenidos en este partido: {prediccionPrevia.puntos_ganados}
            </div>
          )}
        </div>
      )}
    </div>
  );
};



const calcularTabla = (partidos, obtenerGoles) => {
  const equipos = {};

  partidos.forEach(p => {
    if (!equipos[p.equipo_local]) equipos[p.equipo_local] = { nombre: p.equipo_local, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
    if (!equipos[p.equipo_visitante]) equipos[p.equipo_visitante] = { nombre: p.equipo_visitante, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };

    const goles = obtenerGoles(p);
    if (goles !== null) {
      const gl = goles.local;
      const gv = goles.visitante;

      equipos[p.equipo_local].pj++;
      equipos[p.equipo_visitante].pj++;
      equipos[p.equipo_local].gf += gl;
      equipos[p.equipo_local].gc += gv;
      equipos[p.equipo_visitante].gf += gv;
      equipos[p.equipo_visitante].gc += gl;

      if (gl > gv) {
        equipos[p.equipo_local].pts += 3;
        equipos[p.equipo_local].pg++;
        equipos[p.equipo_visitante].pp++;
      } else if (gl < gv) {
        equipos[p.equipo_visitante].pts += 3;
        equipos[p.equipo_visitante].pg++;
        equipos[p.equipo_local].pp++;
      } else {
        equipos[p.equipo_local].pts += 1;
        equipos[p.equipo_visitante].pts += 1;
        equipos[p.equipo_local].pe++;
        equipos[p.equipo_visitante].pe++;
      }
    }
  });

  return Object.values(equipos).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const difA = a.gf - a.gc;
    const difB = b.gf - b.gc;
    if (difB !== difA) return difB - difA;
    return b.gf - a.gf;
  });
};

const TablaPosiciones = ({ partidos, misPredicciones }) => {
  const tablaReal = calcularTabla(partidos, (p) => {
    if (p.estado === 'finalizado' && p.resultado_real) {
      return { local: p.resultado_real.goles_local, visitante: p.resultado_real.goles_visitante };
    }
    return null;
  });

  const tablaPrediccion = calcularTabla(partidos, (p) => {
    const pred = misPredicciones.find(pr => pr.partido_id === p._id);
    if (pred) {
      return { local: pred.prediccion_goles_local, visitante: pred.prediccion_goles_visitante };
    }
    return null;
  });

  const renderTabla = (tabla, titulo) => (
    <div style={{ flex: 1, minWidth: '300px' }}>
      <h4 style={{ textAlign: 'center', color: 'var(--text-main)', margin: '0 0 10px 0', fontSize: '14px' }}>{titulo}</h4>
      <div style={{ border: '1px solid var(--card-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
          <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '2px solid #ddd', fontSize: '11px', color: 'var(--text-muted)' }}>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>Equipo</th>
              <th style={{ padding: '8px' }}>Pts</th>
              <th style={{ padding: '8px' }}>PJ</th>
              <th style={{ padding: '8px' }}>GF</th>
              <th style={{ padding: '8px' }}>GC</th>
              <th style={{ padding: '8px' }}>DIF</th>
            </tr>
          </thead>
          <tbody>
            {tabla.map((eq, index) => (
              <tr key={eq.nombre} style={{ borderBottom: '1px solid var(--card-border)' }}>
                <td style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  <span style={{ color: index < 2 ? '#28a745' : '#888', marginRight: '5px' }}>{index + 1}</span>
                  {eq.nombre}
                </td>
                <td style={{ padding: '8px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{eq.pts}</td>
                <td style={{ padding: '8px' }}>{eq.pj}</td>
                <td style={{ padding: '8px' }}>{eq.gf}</td>
                <td style={{ padding: '8px' }}>{eq.gc}</td>
                <td style={{ padding: '8px' }}>{eq.gf - eq.gc > 0 ? `+${eq.gf - eq.gc}` : eq.gf - eq.gc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
      {renderTabla(tablaReal, "🏆 Clasificación Real")}
      {renderTabla(tablaPrediccion, "🔮 Tu Simulación (Predicciones)")}
    </div>
  );
};

const FaseCard = ({ fase, dataFase, misPredicciones, token }) => {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="glass-panel" style={{ marginBottom: '30px', padding: '20px' }}>
      <div
        onClick={() => setExpandido(!expandido)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: expandido ? '2px solid #f4f7f6' : 'none', paddingBottom: expandido ? '10px' : '0', marginBottom: expandido ? '15px' : '0', cursor: 'pointer', userSelect: 'none' }}
      >
        <h3 style={{ margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', color: 'var(--text-muted)', transition: 'transform 0.2s' }}>{expandido ? '▼' : '▶'}</span> {fase}
        </h3>
        <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success-color)', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold', fontSize: '14px' }}>
          Puntos sumados: {dataFase.puntosAcumulados}
        </span>
      </div>

      {expandido && (
        <div style={{ marginTop: '15px' }}>
          {fase.toLowerCase().includes('grupo') && (
            <TablaPosiciones partidos={dataFase.partidos} misPredicciones={misPredicciones} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dataFase.partidos.map(partido => {
              const prediccionPrevia = misPredicciones.find(p => p.partido_id === partido._id);
              return <PartidoCard key={partido._id} partido={partido} prediccionPrevia={prediccionPrevia} token={token} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Array de colores predefinidos para que cada línea de usuario tenga un color distinto
const COLORES = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0ed57', '#a4de6c', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const [partidos, setPartidos] = useState([]);
  const [misPredicciones, setMisPredicciones] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [datosGrafico, setDatosGrafico] = useState({ data: [], usuarios: [] }); // NUEVO estado para el gráfico
  const [lineasOcultas, setLineasOcultas] = useState({}); // Para ocultar usuarios en el gráfico
  const [albumInfo, setAlbumInfo] = useState({ puntosDisponibles: 0, figuritas: [], catalogo: [] });
  const [comprandoFigurita, setComprandoFigurita] = useState(false);
  const [flippedStickers, setFlippedStickers] = useState({});

  const toggleFlip = (num) => {
    setFlippedStickers(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const toggleLinea = (usuario) => {
    setLineasOcultas(prev => ({ ...prev, [usuario]: !prev[usuario] }));
  };
  const [cargando, setCargando] = useState(true);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('ayuda_vista')) {
      setMostrarAyuda(true);
    }
  }, []);

  const cerrarAyuda = () => {
    setMostrarAyuda(false);
    localStorage.setItem('ayuda_vista', 'true');
  };

  // Agregamos 'estadisticas' como una posible pestaña
  const [tabActiva, setTabActiva] = useState('hoy');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const nombreUsuario = localStorage.getItem('nombre_usuario') || 'Jugador';
  const rolUsuario = localStorage.getItem('rol_usuario') || 'user';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        const resPartidos = await fetch('https://prode-mundial-t3nt.onrender.com/api/partidos');
        const dataPartidos = await resPartidos.json();

        const resPredicciones = await fetch('https://prode-mundial-t3nt.onrender.com/api/predicciones/mias', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataPredicciones = await resPredicciones.json();

        const resRanking = await fetch('https://prode-mundial-t3nt.onrender.com/api/usuarios/ranking');
        const dataRanking = await resRanking.json();

        // NUEVO: Pedimos el historial para el gráfico
        const resHistorial = await fetch('https://prode-mundial-t3nt.onrender.com/api/usuarios/historial');
        const dataHistorial = await resHistorial.json();

        const resAlbum = await fetch('https://prode-mundial-t3nt.onrender.com/api/album/mias', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataAlbum = await resAlbum.json();

        // --- LÓGICA MÁGICA: Transformar datos crudos a líneas acumulativas por día ---
        const fechasSet = new Set();
        dataHistorial.forEach(item => {
          const diaCorto = new Date(item.fecha).toISOString().split('T')[0]; // Nos quedamos solo con YYYY-MM-DD
          fechasSet.add(diaCorto);
          item.diaCorto = diaCorto; // Lo guardamos para usarlo rápido después
        });

        const fechasOrdenadas = Array.from(fechasSet).sort();
        const todosLosUsuarios = dataRanking.map(u => u.nombre); // Todos los que participan

        let acumuladores = {};
        todosLosUsuarios.forEach(u => acumuladores[u] = 0); // Arrancan todos en 0

        const dataFormateada = fechasOrdenadas.map(fecha => {
          const puntoEnElTiempo = { nombreCorta: fecha.slice(5) }; // Ej: "06-15"

          // Buscamos los puntos que se repartieron ESE día específico
          const repartidosHoy = dataHistorial.filter(item => item.diaCorto === fecha);

          repartidosHoy.forEach(item => {
            acumuladores[item.usuario] += item.puntos;
          });

          // Le asignamos a cada usuario el total que lleva acumulado HASTA ESE día
          todosLosUsuarios.forEach(u => {
            puntoEnElTiempo[u] = acumuladores[u];
          });

          return puntoEnElTiempo;
        });

        setDatosGrafico({ data: dataFormateada, usuarios: todosLosUsuarios });
        // -------------------------------------------------------------------------

        setPartidos(dataPartidos);
        setMisPredicciones(dataPredicciones);
        setRanking(dataRanking);
        setAlbumInfo(dataAlbum);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [navigate, token]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre_usuario');
    navigate('/login');
  };

  if (cargando) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando la cancha... ⚽</h2>;

  const ahoraUtc = new Date();

  // Una "Jornada de Prode" arranca a las 10:00 AM de Argentina (13:00 UTC)
  let inicioVentana = new Date(ahoraUtc);
  inicioVentana.setHours(inicioVentana.getHours() + 3);
  if (inicioVentana.getHours() < 10) {
    // Si todavía no son las 10:00 UTC, seguimos en la jornada del día anterior
    inicioVentana.setUTCDate(inicioVentana.getUTCDate() - 1);
  }
  inicioVentana.setHours(10, 0, 0, 0);

  // La jornada dura 24 horas exactas (hasta las 10:00 AM del día siguiente)
  let finVentana = new Date(inicioVentana);
  finVentana.setUTCDate(finVentana.getUTCDate() + 1);

  const partidosDeHoy = partidos.filter(partido => {
    if (!partido.fecha_hora) return false;
    const fechaPartido = new Date(partido.fecha_hora);
    return fechaPartido >= inicioVentana && fechaPartido < finVentana;
  });

  const fixtureAgrupado = partidos.reduce((acc, partido) => {
    const fase = partido.grupo_o_fase;
    if (!acc[fase]) acc[fase] = { partidos: [], puntosAcumulados: 0 };
    acc[fase].partidos.push(partido);

    const prediccion = misPredicciones.find(p => p.partido_id === partido._id);
    if (prediccion && prediccion.puntos_ganados !== null) {
      acc[fase].puntosAcumulados += prediccion.puntos_ganados;
    }
    return acc;
  }, {});

  const comprarFigurita = async () => {
    setComprandoFigurita(true);
    try {
      const res = await fetch('https://prode-mundial-t3nt.onrender.com/api/album/comprar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.mensaje);
        setAlbumInfo(prev => ({ ...prev, puntosDisponibles: data.puntosDisponibles, figuritas: data.figuritas }));
      } else {
        alert(`❌ Error: ${data.mensaje}`);
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setComprandoFigurita(false);
    }
  };



  const tabStyle = (activa) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: activa ? '3px solid var(--primary-color)' : '3px solid transparent',
    fontWeight: activa ? 'bold' : 'normal',
    color: activa ? 'var(--primary-color)' : 'var(--text-muted)',
    backgroundColor: 'transparent',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    fontSize: '16px',
    flex: 1
  });

  return (
    <div style={{ display: 'flex', gap: '30px', minHeight: '100vh' }}>

      {/* --- COLUMNA 1: EL RANKING (FIJA A LA IZQUIERDA) --- */}
      <div className="glass-panel" style={{ flex: '0 0 300px', padding: '30px', borderRight: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)', borderRadius: '0 0 10px 0' }}>
        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: 'var(--primary-color)' }}>📊 Tabla de Posiciones</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
              <th style={{ padding: '10px' }}>#</th>
              <th style={{ padding: '10px' }}>Jugador</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((user, index) => (
              <tr key={user._id} style={{ borderBottom: '1px solid var(--card-border)', backgroundColor: user.nombre === nombreUsuario ? 'rgba(250, 204, 21, 0.2)' : 'transparent', fontWeight: user.nombre === nombreUsuario ? 'bold' : 'normal' }}>
                <td style={{ padding: '10px' }}>{index + 1}</td>
                <td style={{ padding: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {index === 0 && '🥇 '}{index === 1 && '🥈 '}{index === 2 && '🥉 '}{user.nombre}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', fontSize: '16px' }}>{user.puntos_totales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- COLUMNA 2: EL CONTENIDO PRINCIPAL --- */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #ddd' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-main)' }}>🏆 Hola, {nombreUsuario}</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setMostrarAyuda(true)} style={{ padding: '10px 20px', background: 'var(--success-color)', color: 'var(--text-main)', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>❔ Ayuda</button>
            {rolUsuario === 'admin' && (
              <button onClick={() => navigate('/admin')} style={{ padding: '10px 20px', background: 'var(--text-muted)', color: 'var(--text-main)', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>⚙️ Admin</button>
            )}
            <button onClick={cerrarSesion} style={{ padding: '10px 20px', background: 'var(--danger-color)', color: 'var(--text-main)', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>Salir</button>
          </div>
        </div>
        {mostrarAyuda && <ModalAyuda alCerrar={cerrarAyuda} />}

        {/* NAVEGACIÓN DE PESTAÑAS (AGREGAMOS ESTADÍSTICAS) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
          <button style={tabStyle(tabActiva === 'hoy')} onClick={() => setTabActiva('hoy')}>
            📅 Hoy
          </button>
          <button style={tabStyle(tabActiva === 'fixture')} onClick={() => setTabActiva('fixture')}>
            📋 Fixture
          </button>

          <button style={tabStyle(tabActiva === 'estadisticas')} onClick={() => setTabActiva('estadisticas')}>
            📈 Estadísticas
          </button>

          {rolUsuario === 'admin' && (
            <button style={tabStyle(tabActiva === 'album')} onClick={() => setTabActiva('album')}>
              📔 Álbum
            </button>
          )}
        </div>

        {/* CONTENIDO DE LA PESTAÑA: HOY */}
        {tabActiva === 'hoy' && (
          <div>
            {partidosDeHoy.length === 0 ? (
              <p className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                No hay partidos programados para el día de hoy.
              </p>
            ) : (
              partidosDeHoy.map(partido => {
                const prediccionPrevia = misPredicciones.find(p => p.partido_id === partido._id);
                return <PartidoCard key={partido._id} partido={partido} prediccionPrevia={prediccionPrevia} token={token} />;
              })
            )}
          </div>
        )}



        {/* CONTENIDO DE LA PESTAÑA: FIXTURE */}
        {tabActiva === 'fixture' && (
          /* ... (Todo el contenido de fixture queda igual que el mensaje anterior) ... */
          <div>
            {Object.keys(fixtureAgrupado).length === 0 ? (
              <p style={{ textAlign: 'center' }}>No hay partidos cargados en el fixture.</p>
            ) : (
              Object.keys(fixtureAgrupado).sort().map(fase => (
                <FaseCard key={fase} fase={fase} dataFase={fixtureAgrupado[fase]} misPredicciones={misPredicciones} token={token} />
              ))
            )}
          </div>
        )}



        {/* NUEVO: CONTENIDO DE LA PESTAÑA: ESTADÍSTICAS */}
        {tabActiva === 'estadisticas' && (
          <div className="glass-panel" style={{ padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Evolución de Puntos a través del Mundial</h3>

            {datosGrafico.data.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aún no hay puntos repartidos para graficar.</p>
            ) : (
              <>
                <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Haz clic en un jugador para ocultarlo/mostrarlo:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                  {datosGrafico.usuarios.map((usuario, index) => (
                    <button
                      key={usuario}
                      onClick={() => toggleLinea(usuario)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: `2px solid ${COLORES[index % COLORES.length]}`,
                        backgroundColor: lineasOcultas[usuario] ? 'white' : COLORES[index % COLORES.length],
                        color: lineasOcultas[usuario] ? COLORES[index % COLORES.length] : 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {usuario}
                    </button>
                  ))}
                </div>
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer>
                    <LineChart data={datosGrafico.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombreCorta" />
                      <YAxis />
                      <Tooltip />
                      {/* Generamos una línea de gráfico automáticamente por cada usuario */}
                      {datosGrafico.usuarios.map((usuario, index) => (
                        <Line
                          key={usuario}
                          type="monotone"
                          dataKey={usuario}
                          stroke={COLORES[index % COLORES.length]}
                          strokeWidth={3}
                          activeDot={{ r: 8 }}
                          hide={lineasOcultas[usuario]}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* PESTAÑA: ÁLBUM */}
        {tabActiva === 'album' && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>📔 Tu Álbum de Figuritas</h3>
                <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>Puntos disponibles: <strong>{albumInfo.puntosDisponibles} pts</strong></p>
              </div>
              <button
                onClick={comprarFigurita}
                disabled={comprandoFigurita || albumInfo.puntosDisponibles < 20}
                style={{
                  padding: '10px 20px',
                  background: albumInfo.puntosDisponibles >= 20 ? 'var(--primary-color)' : 'var(--text-muted)',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: albumInfo.puntosDisponibles >= 20 ? 'pointer' : 'not-allowed',
                  opacity: comprandoFigurita ? 0.7 : 1
                }}
              >
                {comprandoFigurita ? 'Comprando... ⏳' : 'Comprar Figurita (20 pts)'}
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              {Array.from({ length: 6 }, (_, i) => i + 1).map(num => {
                const laTengo = albumInfo.figuritas.includes(num);
                const infoCatalogo = albumInfo.catalogo?.find(f => f.numero === num);
                const isFlipped = flippedStickers[num];

                return (
                  <div key={num} onClick={() => laTengo && toggleFlip(num)} style={{
                    aspectRatio: '3/4',
                    borderRadius: '8px',
                    border: laTengo ? '2px solid var(--primary-color)' : '1px dashed var(--card-border)',
                    background: laTengo ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px',
                    textAlign: 'center',
                    position: 'relative',
                    cursor: laTengo ? 'pointer' : 'default',
                    overflow: 'hidden',
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}>
                    {laTengo && infoCatalogo && (infoCatalogo.img_frente || infoCatalogo.img_dorso) ? (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        <img
                          src={isFlipped ? (infoCatalogo.img_dorso || infoCatalogo.img_frente) : (infoCatalogo.img_frente || infoCatalogo.img_dorso)}
                          alt={`Figurita ${num}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backfaceVisibility: 'hidden', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                          #{num}
                        </div>
                        {infoCatalogo && infoCatalogo.nombre && (
                          <div style={{ fontSize: '12px', color: 'var(--primary-color)', margin: '5px 0' }}>{infoCatalogo.nombre}</div>
                        )}
                        {laTengo ? (
                          <>
                            <span style={{ fontSize: '40px' }}>😎</span>
                            <span style={{ fontSize: '12px', marginTop: '10px', fontWeight: 'bold', color: 'var(--primary-color)' }}>¡Obtenida!</span>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Falta</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}