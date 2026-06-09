import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Recover() {
  const [nombre, setNombre] = useState('');
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

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://prode-mundial-t3nt.onrender.com'}/api/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, dni })
      });

      const data = await response.json();

      if (response.ok) {
        setExito(data.mensaje || '¡Solicitud enviada exitosamente!');
        setTimeout(() => navigate('/login'), 4000);
      } else {
        setError(data.mensaje || 'Error al recuperar la contraseña');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', margin: '10vh auto', padding: '30px 20px', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '10px' }}>Recuperar Contraseña</h1>
      <p style={{ color: 'var(--text-muted)' }}>{clientName}</p>

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
          type="text"
          placeholder="Tu DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '8px' }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ padding: '12px', fontSize: '16px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Enviando... ⏳' : 'Solicitar contraseña'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>❌ {error}</p>}
      {exito && <p style={{ color: 'var(--success-color)', marginTop: '15px', fontWeight: 'bold' }}>✅ {exito}</p>}

      <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
        <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Volver al Login</Link>
      </p>
    </div>
  );
}
