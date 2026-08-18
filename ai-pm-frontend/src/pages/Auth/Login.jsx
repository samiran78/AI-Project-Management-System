import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/authApi';

/*
  ─── WHY I REWROTE THIS WHOLE CARD ───────────────────────────────────────────
  The original Login had background:'#fff' (pure white card).
  Meanwhile the global index.css sets input color to #fff (white text).
  So we had white text on white background = completely invisible typed text.
  I did this coz the fix isn't to override every input — the real fix is to
  bring the card itself into the dark-theme world the rest of the app lives in.
  Now the card is dark-violet glazed glass, so white text on dark bg = readable.
  ──────────────────────────────────────────────────────────────────────────────
*/

// i pulled these styles out so the JSX stays clean and readable
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    /* i did this coz on mobile the card was getting clipped at the edges —
       padding + flexbox centering handles all screen sizes cleanly */
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
    /* i did this coz glassmorphism on a dark bg looks premium and
       matches the sidebar's aesthetic — keeps the whole app coherent */
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
    /* i did this coz not setting font-size caused browser zooming on mobile
       — 15px+ prevents that iOS auto-zoom behaviour */
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

function Login() {
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
      const res = await loginUser({ email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* i did this coz a blank h2 gives no context — users need to know
            they're in the right place at a glance */}
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subtext}>Sign in to your AI PM workspace</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <label style={styles.label} htmlFor="login-password">Password</label>
          <input
            id="login-password"
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
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          No account?{' '}
          <a href="/register" style={styles.link}>Create one</a>
        </p>
      </div>
    </div>
  );
}

export default Login;