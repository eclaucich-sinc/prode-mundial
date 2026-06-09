import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);
  const clientName = import.meta.env.VITE_CLIENT_NAME || 'Prode Mundial 2026';

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prode-mundial-t3nt.onrender.com'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre, 
          password,
          email: clientName === 'Q21' ? email : undefined,
          dni: clientName === 'Q21' ? dni : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setExito('¡Usuario creado con éxito! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.mensaje || 'Error al registrar el usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', margin: '5vh auto', padding: '30px 20px', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '10px' }}>🏆 Prode Mundial 2026</h1>
      <p style={{ color: 'var(--text-muted)' }}>Creá tu cuenta para empezar a jugar</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Tu nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '8px' }}
        />

        {clientName === 'Q21' && (
          <>
            <input
              type="email"
              placeholder="Tu Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px', fontSize: '16px', borderRadius: '8px' }}
            />
            <input
              type="text"
              placeholder="Tu DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              style={{ padding: '12px', fontSize: '16px', borderRadius: '8px' }}
            />
          </>
        )}
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '8px' }}
        />
        <input
          type="password"
          placeholder="Repetir contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '8px' }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ padding: '12px', fontSize: '16px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Registrando... ⏳' : 'Registrarme'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>❌ {error}</p>}
      {exito && <p style={{ color: 'var(--success-color)', marginTop: '15px', fontWeight: 'bold' }}>✅ {exito}</p>}

      <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
        ¿Ya tenés cuenta? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Iniciá sesión acá</Link>
      </p>
    </div>
  );
}
