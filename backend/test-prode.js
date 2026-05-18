// test-prode.js
async function probarProde() {
  try {
    console.log('🔑 1. Iniciando sesión para obtener el Token...');
    const resLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'lio', password: 'superpassword' })
    });
    const dataLogin = await resLogin.json();
    const token = dataLogin.token;

    if (!token) {
      console.log('❌ Error al iniciar sesión. ¿El servidor está prendido?');
      return;
    }
    console.log('✅ Token obtenido con éxito.');

    console.log('\n🏟️ 2. Creando un partido de prueba (Argentina vs. México)...');
    const resPartido = await fetch('http://localhost:5000/api/partidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipo_local: 'Argentina',
        equipo_visitante: 'México',
        fecha_hora: new Date('2026-06-15T15:00:00Z'),
        grupo_o_fase: 'Grupo C'
      })
    });
    const dataPartido = await resPartido.json();
    const partidoId = dataPartido.partido._id;
    console.log('✅ Partido creado con ID:', partidoId);

    console.log('\n🔮 3. Guardando una predicción para ese partido...');
    const resPrediccion = await fetch('http://localhost:5000/api/predicciones', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ACÁ ENVIAMOS EL PASE VIP
      },
      body: JSON.stringify({
        partido_id: partidoId,
        prediccion_goles_local: 2,
        prediccion_goles_visitante: 0,
        prediccion_roja: false,
        prediccion_penal: true
      })
    });
    const dataPrediccion = await resPrediccion.json();
    console.log('✅ Respuesta del servidor al predecir:', dataPrediccion.mensaje);

    console.log('\n📋 4. Buscando mis predicciones guardadas...');
    const resMias = await fetch('http://localhost:5000/api/predicciones/mias', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataMias = await resMias.json();
    console.log(`✅ ¡Éxito! Tenés ${dataMias.length} predicción/es guardada/s en la base de datos.`);
    console.log(dataMias[0]);

  } catch (error) {
    console.error('❌ Hubo un error en la prueba:', error);
  }
}

probarProde();