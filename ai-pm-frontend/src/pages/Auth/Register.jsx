import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../api/authApi';

/*
  ─── WHY I REBUILT THE REGISTER CARD ────────────────────────────────────────
  Same exact problem as Login — white card + white text = invisible inputs.
  I did this coz both auth pages had `background:'#fff'` hardcoded as inline
  style which overrode the nice dark theme we set in index.css everywhere else.
  The global `input { color: #fff }` rule makes perfect sense for dark pages,
  just not when the card is white. So instead of adding `color: #000` overrides
  on every single input, I just switched the card to dark glass — one fix,
  everything correct, no hackery.
  ──────────────────────────────────────────────────────────────────────────────
*/

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(167,139,250,0.25)',
    borderRadius: 16,
    padding: '40px 36px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.1)',
  },
  heading: {
    color: '#c4b5fd',
    fontSize: 28,
    fontWeight: 700,
    margin: '0 0 8px',
    letterSpacing: 0.3,
  },
  subtext: {
    color: '#9d94b5',
    fontSize: 14,
    margin: '0 0 32px',
  },
  label: {
    display: 'block',
    color: '#c4b5fd',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    marginBottom: 20,
    fontSize: 15,
    /* i did this coz font-size < 16px triggers iOS auto-zoom on focus —
       annoying UX, this prevents it */
  },
  button: {
    width: '100%',
    padding: '13px',
    fontSize: 15,
    marginTop: 4,
  },
  error: {
    color: '#f87171',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 20,
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    color: '#9d94b5',
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    color: '#c4b5fd',
    textDecoration: 'none',
    fontWeight: 600,
  },
};

function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h1 style={styles.heading}>Create account</h1>
        <p style={styles.subtext}>Join your AI PM workspace</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />

          <label style={styles.label} htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <label style={styles.label} htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <a href="/login" style={styles.link}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default Register;