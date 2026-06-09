import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoQ21 from '../assets/logo_q21.png';
import logoSinc from '../assets/logo_sinc.png';

export default function Login() {
  // Estados para guardar lo que el usuario escribe
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const clientName = import.meta.env.VITE_CLIENT_NAME || 'Prode Mundial 2026';

  // Herramienta de React Router para cambiar de página
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setError(''); // Limpiamos errores previos
    setLoading(true);

    try {
      // Le pegamos a nuestra API de Node.js
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prode-mundial-t3nt.onrender.com'}/api/auth/login`, {
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
        localStorage.setItem('rol_usuario', data.usuario.rol);

        // Lo mandamos directo a la cancha (Dashboard)
        navigate('/dashboard');
      } else {
        // Si la contraseña está mal o el usuario no existe, mostramos el error
        setError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. ¿Está prendido el backend?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', margin: '5vh auto', padding: '30px 20px', textAlign: 'center' }}>
      {clientName === 'Q21' && (
        <img src={logoQ21} alt="Logo Q21" style={{ maxWidth: '300px', marginBottom: '15px' }} />
      )}
      {clientName === 'sinc(i)' && (
        <img src={logoSinc} alt="Logo Sinc" style={{ maxWidth: '300px', marginBottom: '15px' }} />
      )}
      <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '10px' }}>
        🏆 Prode Mundial 2026 {clientName !== 'Q21' && <><br /> {clientName}</>}
      </h1>
      <p style={{ color: 'var(--text-muted)' }}>Iniciá sesión para hacer tus pronósticos</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Tu nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '8px' }}
        />
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '8px' }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ padding: '12px', fontSize: '16px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Entrando... ⏳' : 'Entrar a Jugar'}
        </button>
      </form>

      {/* Si hay un error, lo mostramos en rojo */}
      {error && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>❌ {error}</p>}

      <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
        ¿No tenés cuenta? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Registrate acá</Link>
      </p>

      {clientName === 'Q21' && (
        <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
          ¿Olvidaste tu contraseña? <Link to="/recover" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Recuperala acá</Link>
        </p>
      )}
    </div>
  );
}