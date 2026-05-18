// test-auth.js
async function probarAutenticacion() {
  try {
    console.log('⏳ 1. Probando el Registro de usuario...');
    const resRegistro = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nombre: 'De Paul', 
        password: 'superpassword' 
      })
    });
    const dataRegistro = await resRegistro.json();
    console.log('Respuesta del servidor:', dataRegistro);

    console.log('\n⏳ 2. Probando el Inicio de Sesión (Login)...');
    const resLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nombre: 'De Paul', 
        password: 'superpassword' 
      })
    });
    const dataLogin = await resLogin.json();
    console.log('Respuesta del servidor:', dataLogin);

    if (dataLogin.token) {
      console.log('\n✅ ¡ÉXITO! El token JWT se generó correctamente. Tu autenticación funciona perfecto.');
    }

  } catch (error) {
    console.error('❌ Hubo un error en la prueba:', error);
  }
}

probarAutenticacion();