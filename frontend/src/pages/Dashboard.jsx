import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- SUB-COMPONENTE MEJORADO: La tarjetita de cada partido con comparativa ---
const PartidoCard = ({ partido, prediccionPrevia, token }) => {
  // Estados para los inputs de predicción (solo se usan si está pendiente)
  const [golesLocal, setGolesLocal] = useState(prediccionPrevia ? prediccionPrevia.prediccion_goles_local : 0);
  const [golesVisitante, setGolesVisitante] = useState(prediccionPrevia ? prediccionPrevia.prediccion_goles_visitante : 0);
  const [hayRoja, setHayRoja] = useState(prediccionPrevia ? prediccionPrevia.prediccion_roja : false);
  const [hayPenal, setHayPenal] = useState(prediccionPrevia ? prediccionPrevia.prediccion_penal : false);
  const [estadoGuardado, setEstadoGuardado] = useState('');
  const [expandido, setExpandido] = useState(false);

  const finalizado = partido.estado === 'finalizado';

  const fechaFormateada = new Date(partido.fecha_hora).toLocaleString([], {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
  });

  const guardarPrediccion = async () => {
    setEstadoGuardado('⏳...');
    try {
      const res = await fetch('http://localhost:5000/api/predicciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          partido_id: partido._id,
          prediccion_goles_local: Number(golesLocal),
          prediccion_goles_visitante: Number(golesVisitante),
          prediccion_roja: hayRoja,
          prediccion_penal: hayPenal
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
    backgroundColor: '#fff'
  };

  const circuloGolesStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#333',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: 'bold'
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', marginBottom: '15px', backgroundColor: finalizado ? '#f1f3f5' : '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
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
            <div style={{ fontSize: '16px', fontWeight: 'bold', backgroundColor: '#e9ecef', padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd' }}>
              {partido.resultado_real?.goles_local} - {partido.resultado_real?.goles_visitante}
            </div>
          )}
          {!finalizado && prediccionPrevia && (
            <span style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>✅ Pronosticado</span>
          )}
          <span style={{ fontSize: '12px', color: '#007bff' }}>{expandido ? '▲' : '▼'}</span>
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
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Tu Predicción</div>
                  <div style={{...contenedorMarcadorStyle, backgroundColor: 'transparent', gap: '8px'}}>
                    <span style={{fontSize: '14px'}}>{partido.equipo_local}</span>
                    <span style={{...circuloGolesStyle, backgroundColor: '#6c757d', fontSize: '16px', width: '30px', height: '30px'}}>
                      {prediccionPrevia ? prediccionPrevia.prediccion_goles_local : '-'}
                    </span>
                    <span style={{fontWeight: 'bold'}}>-</span>
                    <span style={{...circuloGolesStyle, backgroundColor: '#6c757d', fontSize: '16px', width: '30px', height: '30px'}}>
                      {prediccionPrevia ? prediccionPrevia.prediccion_goles_visitante : '-'}
                    </span>
                    <span style={{fontSize: '14px'}}>{partido.equipo_visitante}</span>
                  </div>
                </div>

                <div style={{fontSize: '24px'}}>👉</div>

                {/* Bloque Resultado Real */}
                <div style={{ textAlign: 'center', flex: 1, border: '2px solid #28a745', padding: '10px', borderRadius: '5px', backgroundColor: 'white' }}>
                  <div style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold', marginBottom: '5px' }}>Resultado Real</div>
                  <div style={{...contenedorMarcadorStyle, backgroundColor: 'transparent', gap: '8px'}}>
                    <span style={{fontSize: '14px', fontWeight: 'bold'}}>{partido.equipo_local}</span>
                    <span style={circuloGolesStyle}>
                      {partido.resultado_real.goles_local}
                    </span>
                    <span style={{fontWeight: 'bold', fontSize: '20px'}}>-</span>
                    <span style={circuloGolesStyle}>
                      {partido.resultado_real.goles_visitante}
                    </span>
                    <span style={{fontSize: '14px', fontWeight: 'bold'}}>{partido.equipo_visitante}</span>
                  </div>
                </div>
              </div>

              {/* Fila 2: Comparativa de Eventos Especiales */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '13px', color: '#555', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <span>
                  🔴 Roja: real <strong>{partido.eventos_especiales.hubo_roja ? 'Sí' : 'No'}</strong> 
                  (pusiste {prediccionPrevia?.prediccion_roja ? 'Sí' : 'No'})
                </span>
                <span>
                  ⚽ Penal: real <strong>{partido.eventos_especiales.hubo_penal ? 'Sí' : 'No'}</strong>
                  (pusiste {prediccionPrevia?.prediccion_penal ? 'Sí' : 'No'})
                </span>
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
                    style={{ width: '50px', textAlign: 'center', fontSize: '18px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }} 
                  />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>-</span>
                <div style={{ textAlign: 'center' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>{partido.equipo_visitante}</label>
                  <input 
                    type="number" min="0" value={golesVisitante}
                    onChange={(e) => setGolesVisitante(e.target.value)}
                    style={{ width: '50px', textAlign: 'center', fontSize: '18px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px', fontSize: '14px', color: '#555' }}>
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={hayRoja} onChange={(e) => setHayRoja(e.target.checked)} style={{ marginRight: '5px' }} />
                  ¿Habrá Roja?
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={hayPenal} onChange={(e) => setHayPenal(e.target.checked)} style={{ marginRight: '5px' }} />
                  ¿Habrá Penal?
                </label>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={guardarPrediccion}
                  style={{ padding: '10px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                  Guardar Pronóstico
                </button>
                <span style={{ marginLeft: '10px', fontWeight: 'bold', fontSize: '14px' }}>{estadoGuardado}</span>
              </div>
            </>
          )}

          {/* Caja de Puntos (Siempre visible al final) */}
          {prediccionPrevia && prediccionPrevia.puntos_ganados !== null && (
            <div style={{ textAlign: 'center', marginTop: '15px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px', color: '#155724', fontWeight: 'bold', border: '1px solid #c3e6cb' }}>
              🏆 Puntos obtenidos en este partido: {prediccionPrevia.puntos_ganados}
            </div>
          )}
        </div>
      )}
    </div>
  );
};



const TablaPosiciones = ({ partidos }) => {
  const equipos = {};

  partidos.forEach(p => {
    if (!equipos[p.equipo_local]) equipos[p.equipo_local] = { nombre: p.equipo_local, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };
    if (!equipos[p.equipo_visitante]) equipos[p.equipo_visitante] = { nombre: p.equipo_visitante, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 };

    if (p.estado === 'finalizado' && p.resultado_real) {
      const gl = p.resultado_real.goles_local;
      const gv = p.resultado_real.goles_visitante;
      
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

  const tabla = Object.values(equipos).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const difA = a.gf - a.gc;
    const difB = b.gf - b.gc;
    if (difB !== difA) return difB - difA;
    return b.gf - a.gf;
  });

  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center', backgroundColor: '#fff' }}>
        <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd', fontSize: '12px', color: '#555' }}>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left' }}>Equipo</th>
            <th style={{ padding: '10px' }}>Pts</th>
            <th style={{ padding: '10px' }}>PJ</th>
            <th style={{ padding: '10px' }}>G</th>
            <th style={{ padding: '10px' }}>E</th>
            <th style={{ padding: '10px' }}>P</th>
            <th style={{ padding: '10px' }}>GF</th>
            <th style={{ padding: '10px' }}>GC</th>
            <th style={{ padding: '10px' }}>DIF</th>
          </tr>
        </thead>
        <tbody>
          {tabla.map((eq, index) => (
            <tr key={eq.nombre} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>
                <span style={{ color: index < 2 ? '#28a745' : '#888', marginRight: '8px' }}>{index + 1}</span>
                {eq.nombre}
              </td>
              <td style={{ padding: '10px', fontWeight: 'bold', fontSize: '14px', color: '#007bff' }}>{eq.pts}</td>
              <td style={{ padding: '10px' }}>{eq.pj}</td>
              <td style={{ padding: '10px' }}>{eq.pg}</td>
              <td style={{ padding: '10px' }}>{eq.pe}</td>
              <td style={{ padding: '10px' }}>{eq.pp}</td>
              <td style={{ padding: '10px' }}>{eq.gf}</td>
              <td style={{ padding: '10px' }}>{eq.gc}</td>
              <td style={{ padding: '10px' }}>{eq.gf - eq.gc > 0 ? `+${eq.gf - eq.gc}` : eq.gf - eq.gc}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

  const toggleLinea = (usuario) => {
    setLineasOcultas(prev => ({ ...prev, [usuario]: !prev[usuario] }));
  };
  const [cargando, setCargando] = useState(true);
  
  // Agregamos 'estadisticas' como una posible pestaña
  const [tabActiva, setTabActiva] = useState('hoy'); 
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const nombreUsuario = localStorage.getItem('nombre_usuario') || 'Jugador';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        const resPartidos = await fetch('http://localhost:5000/api/partidos');
        const dataPartidos = await resPartidos.json();
        
        const resPredicciones = await fetch('http://localhost:5000/api/predicciones/mias', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataPredicciones = await resPredicciones.json();

        const resRanking = await fetch('http://localhost:5000/api/usuarios/ranking');
        const dataRanking = await resRanking.json();

        // NUEVO: Pedimos el historial para el gráfico
        const resHistorial = await fetch('http://localhost:5000/api/usuarios/historial');
        const dataHistorial = await resHistorial.json();

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

  const fechaHoyObj = new Date();
  const stringHoy = `${fechaHoyObj.getFullYear()}-${String(fechaHoyObj.getMonth() + 1).padStart(2, '0')}-${String(fechaHoyObj.getDate()).padStart(2, '0')}`;
  const partidosDeHoy = partidos.filter(partido => partido.fecha_hora && partido.fecha_hora.startsWith(stringHoy));

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



  const tabStyle = (activa) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: activa ? '3px solid #007bff' : '3px solid transparent',
    fontWeight: activa ? 'bold' : 'normal',
    color: activa ? '#007bff' : '#555',
    backgroundColor: 'transparent',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    fontSize: '16px',
    flex: 1
  });

  return (
    <div style={{ display: 'flex', gap: '30px', fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
      
      {/* --- COLUMNA 1: EL RANKING (FIJA A LA IZQUIERDA) --- */}
      <div style={{ flex: '0 0 300px', backgroundColor: '#e9ecef', padding: '30px', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd', borderRadius: '0 0 10px 0' }}>
        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#333' }}>📊 Tabla de Posiciones</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '10px' }}>#</th>
              <th style={{ padding: '10px' }}>Jugador</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((user, index) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #ddd', backgroundColor: user.nombre === nombreUsuario ? '#d4edda' : 'transparent', fontWeight: user.nombre === nombreUsuario ? 'bold' : 'normal' }}>
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
          <h1 style={{ margin: 0, fontSize: '28px', color: '#1a1a1a' }}>🏆 Hola, {nombreUsuario}</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/admin')} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>⚙️ Admin</button>
            <button onClick={cerrarSesion} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>Salir</button>
          </div>
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS (AGREGAMOS ESTADÍSTICAS) */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '30px' }}>
          <button style={tabStyle(tabActiva === 'hoy')} onClick={() => setTabActiva('hoy')}>
            📅 Hoy
          </button>
          <button style={tabStyle(tabActiva === 'fixture')} onClick={() => setTabActiva('fixture')}>
            📋 Fixture
          </button>

          <button style={tabStyle(tabActiva === 'estadisticas')} onClick={() => setTabActiva('estadisticas')}>
            📈 Estadísticas
          </button>
        </div>

        {/* CONTENIDO DE LA PESTAÑA: HOY */}
        {tabActiva === 'hoy' && (
          <div>
            {partidosDeHoy.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
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
              Object.keys(fixtureAgrupado).map(fase => (
                <div key={fase} style={{ marginBottom: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f4f7f6', paddingBottom: '10px', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>{fase}</h3>
                    <span style={{ backgroundColor: '#e2f0d9', color: '#2e7d32', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold', fontSize: '14px' }}>
                      Puntos sumados: {fixtureAgrupado[fase].puntosAcumulados}
                    </span>
                  </div>
                  {fase.toLowerCase().includes('grupo') && (
                    <TablaPosiciones partidos={fixtureAgrupado[fase].partidos} />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {fixtureAgrupado[fase].partidos.map(partido => {
                      const prediccionPrevia = misPredicciones.find(p => p.partido_id === partido._id);
                      return <PartidoCard key={partido._id} partido={partido} prediccionPrevia={prediccionPrevia} token={token} />;
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}



        {/* NUEVO: CONTENIDO DE LA PESTAÑA: ESTADÍSTICAS */}
        {tabActiva === 'estadisticas' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Evolución de Puntos a través del Mundial</h3>
            
            {datosGrafico.data.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Aún no hay puntos repartidos para graficar.</p>
            ) : (
              <>
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginBottom: '10px' }}>
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

      </div>
    </div>
  );
}