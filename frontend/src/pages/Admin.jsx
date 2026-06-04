import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- SUB-COMPONENTE: Tarjeta de carga para el Administrador ---
const PartidoAdminCard = ({ partido, token }) => {
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [estadoCarga, setEstadoCarga] = useState('');

  const cargarResultadoReal = async () => {
    // Validamos que no envíe campos vacíos
    if (golesLocal === '' || golesVisitante === '') {
      setEstadoCarga('⚠️ Faltan goles');
      return;
    }

    // Confirmación para no cargar un resultado por error
    if (!window.confirm(`¿Confirmás que ${partido.equipo_local} salió ${golesLocal} - ${golesVisitante} ${partido.equipo_visitante}? Esto calculará los puntos de todos los usuarios y no se puede deshacer.`)) {
      return;
    }

    setEstadoCarga('⏳ Calculando...');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://prode-mundial-t3nt.onrender.com'}/api/admin/resultado/${partido._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          goles_local: Number(golesLocal),
          goles_visitante: Number(golesVisitante)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setEstadoCarga(`✅ ¡Listo! ${data.predicciones_procesadas} predicciones evaluadas.`);
        // Recargamos la página después de 2 segundos para actualizar el estado del partido
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setEstadoCarga(`❌ Error: ${data.mensaje}`);
      }
    } catch (error) {
      setEstadoCarga('❌ Error de conexión');
    }
  };

  const finalizado = partido.estado === 'finalizado';

  return (
    <div style={{ border: '1px solid var(--card-border)', borderRadius: '8px', padding: '15px', marginBottom: '15px', background: finalizado ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)' }}>
      <h3 style={{ margin: '0 0 5px 0', textAlign: 'center' }}>
        {partido.equipo_local} vs {partido.equipo_visitante}
      </h3>
      <p style={{ margin: '0 0 10px 0', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        {new Date(partido.fecha_hora).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })}
      </p>

      {finalizado ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p><strong>PARTIDO CERRADO Y PUNTOS REPARTIDOS</strong></p>
          <p>Resultado Oficial: {partido.resultado_real.goles_local} - {partido.resultado_real.goles_visitante}</p>
        </div>
      ) : (
        <>
          <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>Ingresar Resultado Real</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
            <input
              type="number" min="0" placeholder="L" value={golesLocal}
              onChange={(e) => setGolesLocal(e.target.value)}
              style={{ width: '50px', textAlign: 'center', fontSize: '18px', padding: '5px' }}
            />
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>-</span>
            <input
              type="number" min="0" placeholder="V" value={golesVisitante}
              onChange={(e) => setGolesVisitante(e.target.value)}
              style={{ width: '50px', textAlign: 'center', fontSize: '18px', padding: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}></div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={cargarResultadoReal}
              className="btn-primary"
              style={{ padding: '8px 20px' }}>
              Procesar y Repartir Puntos
            </button>
            <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{estadoCarga}</p>
          </div>
        </>
      )}
    </div>
  );
};


// --- COMPONENTE PRINCIPAL: El Panel de Admin ---

// Definimos todas las fases posibles del mundial 2026 en orden
const fasesTorneo = [
  'Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F',
  'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L',
  '32avos', '16avos', '8avos', '4tos', 'Semifinal', 'Tercer Puesto', 'Final'
];

// Todos los equipos del mundial
const equiposMundial = ["Alemania", "Arabia Saudita", "Argelia", "Argentina",
  "Australia", "Austria", "Bélgica", "Boznia y Herzegovina", "Brasil", "Cabo Verde", "Canadá", "Catar",
  "Colombia", "Corea del Sur", "Costa de Marfil", "Croacia", "Curazao", "Ecuador",
  "Egipto", "Escocia", "España", "Estados Unidos", "Francia", "Ghana", "Haití",
  "Inglaterra", "Irak", "Irán", "Japón", "Jordania", "Marruecos", "México", "Noruega",
  "Nueva Zelanda", "Países Bajos", "Panamá", "Paraguay", "Portugal", "Congo", "República Checa", "Senegal",
  "Sudáfrica", "Suecia", "Suiza", "Túnez", "Turquía", "Uruguay", "Uzbekistán"]

export default function Admin() {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el formulario de nuevo partido
  const [nuevoLocal, setNuevoLocal] = useState(''); // Arranca con el primer equipo del listado
  const [nuevoVisitante, setNuevoVisitante] = useState(''); // Arranca con el segundo equipo del listado
  const [nuevoGrupo, setNuevoGrupo] = useState(''); // Ahora se llenará con el Select
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [mensajeCreacion, setMensajeCreacion] = useState('');

  // NUEVO: Estado para la pestaña activa en el panel admin
  const [tabActiva, setTabActiva] = useState(fasesTorneo[0]); // Arranca en Grupo A

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const rolUsuario = localStorage.getItem('rol_usuario');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (rolUsuario !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const cargarPartidos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://prode-mundial-t3nt.onrender.com'}/api/partidos`);
        const data = await res.json();
        setPartidos(data);
      } catch (error) {
        console.error('Error al cargar partidos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPartidos();
  }, [navigate, token]);

  const crearPartido = async (e) => {
    e.preventDefault();
    setMensajeCreacion('⏳ Guardando...');

    // Parse DD/MM and HH:MM into a 2026 date
    let fechaHora;
    if (nuevaFecha.includes('/') && nuevaHora.includes(':')) {
      const [dia, mes] = nuevaFecha.split('/');
      const [hora, minutos] = nuevaHora.split(':');
      if (!dia || !mes || !hora || !minutos || isNaN(dia) || isNaN(mes) || isNaN(hora) || isNaN(minutos)) {
        setMensajeCreacion('❌ Usa el formato DD/MM y HH:MM');
        return;
      }
      fechaHora = `2026-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora.padStart(2, '0')}:${minutos.padStart(2, '0')}:00Z`;
    } else {
      setMensajeCreacion('❌ Revisa la fecha y la hora');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://prode-mundial-t3nt.onrender.com'}/api/partidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          equipo_local: nuevoLocal,
          equipo_visitante: nuevoVisitante,
          grupo_o_fase: nuevoGrupo,
          fecha_hora: fechaHora
        })
      });

      if (res.ok) {
        setMensajeCreacion('✅ Partido creado exitosamente');
        // Cambiamos a la pestaña del partido recién creado para que el usuario lo vea
        setTabActiva(nuevoGrupo);

        // Recargamos para traer el partido desde la base de datos
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMensajeCreacion('❌ Error al crear el partido');
      }
    } catch (error) {
      setMensajeCreacion('❌ Error de conexión');
    }
  };

  const calcularBonusGrupo = async () => {
    if (!window.confirm(`¿Confirmás calcular el bonus para ${tabActiva}? Esto solo debe hacerse cuando todos los partidos del grupo estén finalizados y no se puede deshacer.`)) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://prode-mundial-t3nt.onrender.com'}/api/admin/bonus/${tabActiva}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
         alert(`✅ ${data.mensaje}`);
         // Recargar para que se actualicen las flags si fuera necesario
         window.location.reload();
      } else {
         alert(`❌ Error: ${data.mensaje}`);
      }
    } catch(err) {
      alert("❌ Error de conexión");
    }
  };

  // NUEVO: Filtramos los partidos según la pestaña seleccionada
  const partidosDeLaFase = partidos.filter(
    partido => partido.grupo_o_fase === tabActiva
  );

  if (cargando) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando panel de control... ⚙️</h2>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>⚙️ Panel de Administrador</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Volver al Dashboard
        </button>
      </div>

      {/* --- FORMULARIO DE CREACIÓN MEJORADO --- */}
      <div style={{ backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>➕ Cargar Nuevo Partido</h3>
        <form onSubmit={crearPartido} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              required
              value={nuevoLocal}
              onChange={(e) => setNuevoLocal(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
            >
              <option value="" disabled>Seleccionar Equipo...</option>
              {equiposMundial.map(equipo => (
                <option key={equipo} value={equipo}>{equipo}</option>
              ))}
            </select>
            <select
              required
              value={nuevoVisitante}
              onChange={(e) => setNuevoVisitante(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
            >
              <option value="" disabled>Seleccionar Equipo...</option>
              {equiposMundial.map(equipo => (
                <option key={equipo} value={equipo}>{equipo}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* El input libre ahora es un SELECT desplegable */}
            <select
              required
              value={nuevoGrupo}
              onChange={(e) => setNuevoGrupo(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
            >
              <option value="" disabled>Seleccionar Fase...</option>
              {fasesTorneo.map(fase => (
                <option key={fase} value={fase}>{fase}</option>
              ))}
            </select>
            <input type="text" placeholder="Fecha (DD/MM)" required value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Hora (HH:MM)" required value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <button type="submit" style={{ padding: '10px', background: 'var(--success-color)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Guardar Partido en el Fixture
          </button>
          {mensajeCreacion && <p style={{ textAlign: 'center', margin: '5px 0 0 0', fontWeight: 'bold', color: '#28a745' }}>{mensajeCreacion}</p>}
        </form>
      </div>

      {/* --- PESTAÑAS (FASES DEL TORNEO) --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #ddd' }}>
        {fasesTorneo.map(fase => (
          <button
            key={fase}
            onClick={() => setTabActiva(fase)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: tabActiva === fase ? '#343a40' : '#f8f9fa',
              color: tabActiva === fase ? 'white' : '#495057',
              fontWeight: tabActiva === fase ? 'bold' : 'normal',
              fontSize: '13px',
              border: tabActiva === fase ? '1px solid #343a40' : '1px solid #ced4da'
            }}
          >
            {fase}
          </button>
        ))}
      </div>

      {/* --- LISTA DE PARTIDOS FILTRADOS --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Partidos - {tabActiva}</h3>
        {tabActiva.toLowerCase().includes('grupo') && (
          <button 
            onClick={calcularBonusGrupo}
            style={{ padding: '8px 15px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🎁 Calcular Bonus de {tabActiva}
          </button>
        )}
      </div>
      {partidosDeLaFase.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '8px', color: 'var(--text-muted)' }}>
          No hay partidos cargados en {tabActiva}.
        </p>
      ) : (
        partidosDeLaFase.map(partido => (
          <PartidoAdminCard key={partido._id} partido={partido} token={token} />
        ))
      )}
    </div>
  );
}