import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  // Estados para guardar lo que el usuario escribe
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Herramienta de React Router para cambiar de página
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setError(''); // Limpiamos errores previos

    try {
      // Le pegamos a nuestra API de Node.js
      const response = await fetch('https://prode-mundial-t3nt.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ¡ÉXITO! Guardamos el token en la memoria del navegador
        localStorage.setItem('token', data.token);
        // Opcional: guardamos el nombre del usuario para saludarlo después
        localStorage.setItem('nombre_usuario', data.usuario.nombre);

        // Lo mandamos directo a la cancha (Dashboard)
        navigate('/dashboard');
      } else {
        // Si la contraseña está mal o el usuario no existe, mostramos el error
        setError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. ¿Está prendido el backend?');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>🏆 Prode Mundial 2026</h1>
      <p>Iniciá sesión para hacer tus pronósticos</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Tu nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{ padding: '12px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          Entrar a Jugar
        </button>
      </form>

      {/* Si hay un error, lo mostramos en rojo */}
      {error && <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>❌ {error}</p>}

      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        ¿No tenés cuenta? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Registrate acá</Link>
      </p>
    </div>
  );
}