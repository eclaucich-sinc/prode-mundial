// test-admin.js
async function probarMotorDePuntos() {
  try {
    console.log('🔑 1. Iniciando sesión...');
    const resLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'lio', password: 'superpassword' })
    });
    const dataLogin = await resLogin.json();
    const token = dataLogin.token;

    console.log('\n🏟️ 2. Creando un partido (Final: Argentina vs. Francia)...');
    const resPartido = await fetch('http://localhost:5000/api/partidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipo_local: 'Argentina',
        equipo_visitante: 'Francia',
        fecha_hora: new Date('2026-07-19T15:00:00Z'),
        grupo_o_fase: 'Final'
      })
    });
    const dataPartido = await resPartido.json();
    const partidoId = dataPartido.partido._id;

    console.log('🔮 3. Haciendo la predicción: Argentina 2 - 1 Francia (Sin rojas, con penal)...');
    await fetch('http://localhost:5000/api/predicciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        partido_id: partidoId,
        prediccion_goles_local: 2,
        prediccion_goles_visitante: 1,
        prediccion_roja: false,
        prediccion_penal: false
      })
    });

    console.log('\n⚙️ 4. SIMULANDO ADMINISTRADOR: Cargando resultado real...');
    console.log('   Resultado real: Argentina 3 - 1 Francia (Sin rojas, con penal)');
    const resAdmin = await fetch(`http://localhost:5000/api/admin/resultado/${partidoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        goles_local: 3,
        goles_visitante: 1,
        hubo_roja: false,
        hubo_penal: true
      })
    });
    const dataAdmin = await resAdmin.json();
    console.log('✅ Servidor responde:', dataAdmin.mensaje);

    console.log('\n📊 5. Verificando los puntos ganados en el sistema...');
    const resMias = await fetch('http://localhost:5000/api/predicciones/mias', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataMias = await resMias.json();
    
    // Filtramos para ver solo la predicción de este partido específico
    const miPrediccion = dataMias.find(p => p.partido_id === partidoId);
    
    console.log(`\n🏆 ¡MAGIA PURA! Puntos calculados para este partido: ${miPrediccion.puntos_ganados}`);
    if (miPrediccion.puntos_ganados === 4) {
      console.log('✅ ¡El cálculo es correcto! (3 pts por ganador + 2 pts por acertar el penal).');
    } else {
      console.log('❌ Mmm, la matemática falló.');
    }

  } catch (error) {
    console.error('❌ Hubo un error en la prueba:', error);
  }
}

probarMotorDePuntos();