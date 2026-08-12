import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import authService from '../services/authService';

/* ============================================================
   ROBOT MASCOT SVG
   - Eyes follow email character count (pupil slides left→right)
   - Hands cover eyes when password is focused
   - Head turns red + frown when error occurs
   ============================================================ */
const RobotMascot = ({ emailLength, passwordFocused, hasError }) => {
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  // Pupil X offset: 0 chars → -9px  |  ~20 chars → 0px  |  40+ chars → +9px
  const pupilOffset = clamp((emailLength / 30) * 18 - 9, -9, 9);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2px', userSelect: 'none' }}>
      <svg
        width="130" height="108"
        viewBox="-8 -14 126 120"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Robot maskot EventHub Kampus"
        style={{
          filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.22))',
          animation: (!passwordFocused && !hasError) ? 'mascotBob 2.4s ease-in-out infinite' : 'none',
          transition: 'filter 0.3s ease',
        }}
      >
        {/* Ground shadow */}
        <ellipse cx="55" cy="100" rx="30" ry="5.5" fill="rgba(0,0,0,0.13)" />

        {/* Antenna stem */}
        <line x1="55" y1="-2" x2="55" y2="10" stroke="#8a7355" strokeWidth="3.5" strokeLinecap="round" />

        {/* Antenna ball — pulsing */}
        <circle cx="55" cy="-7" r="6.5" fill={hasError ? '#b5342a' : '#f6c945'} stroke={hasError ? '#87231c' : '#b8912b'} strokeWidth="2.2">
          <animate attributeName="r" values="6.5;8;6.5" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.7;1" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* Head body */}
        <rect
          x="8" y="8" width="94" height="76" rx="24"
          fill={hasError ? '#fdecea' : '#f4ede0'}
          stroke={hasError ? '#b5342a' : '#c9bda2'}
          strokeWidth="3"
          style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
        />

        {/* Top visor band */}
        <rect x="16" y="11" width="78" height="10" rx="5" fill={hasError ? '#b5342a' : '#1e3a5f'} opacity="0.11" />

        {/* Ear bolt left */}
        <circle cx="8" cy="46" r="6.5" fill="#e0d5c0" stroke="#c9bda2" strokeWidth="2.2" />
        <circle cx="8" cy="46" r="2.8" fill="#8a7355" />

        {/* Ear bolt right */}
        <circle cx="102" cy="46" r="6.5" fill="#e0d5c0" stroke="#c9bda2" strokeWidth="2.2" />
        <circle cx="102" cy="46" r="2.8" fill="#8a7355" />

        {/* ===== EYES ===== */}
        {!passwordFocused ? (
          <>
            {/* Left eye */}
            <circle cx="37" cy="44" r="15.5" fill="white" stroke="#d9cfba" strokeWidth="2" />
            <g style={{ transform: `translateX(${pupilOffset}px)`, transition: 'transform 0.18s ease' }}>
              <circle cx="37" cy="44" r="8.5" fill={hasError ? '#b5342a' : '#1e3a5f'} />
              <circle cx="33.5" cy="40.5" r="3" fill="white" opacity="0.85" />
              <circle cx="40.5" cy="42" r="1.5" fill="white" opacity="0.5" />
            </g>

            {/* Right eye */}
            <circle cx="73" cy="44" r="15.5" fill="white" stroke="#d9cfba" strokeWidth="2" />
            <g style={{ transform: `translateX(${pupilOffset}px)`, transition: 'transform 0.18s ease' }}>
              <circle cx="73" cy="44" r="8.5" fill={hasError ? '#b5342a' : '#1e3a5f'} />
              <circle cx="69.5" cy="40.5" r="3" fill="white" opacity="0.85" />
              <circle cx="76.5" cy="42" r="1.5" fill="white" opacity="0.5" />
            </g>
          </>
        ) : (
          /* Password focused — squint + hands */
          <>
            {/* Squinting arcs */}
            <path d="M 23 39 Q 37 51 51 39" stroke="#1e3a5f" strokeWidth="3.8" fill="none" strokeLinecap="round" />
            <path d="M 59 39 Q 73 51 87 39" stroke="#1e3a5f" strokeWidth="3.8" fill="none" strokeLinecap="round" />

            {/* ─── Left arm + hand ─── */}
            <path d="M 2 98 Q 4 70 26 52" stroke="#7a5230" strokeWidth="10" strokeLinecap="round" fill="none"
              style={{ animation: 'liftHand 0.38s cubic-bezier(0.16,1,0.3,1) both' }} />
            <circle cx="26" cy="51" r="12.5" fill="#f6c945" stroke="#b8912b" strokeWidth="2.5"
              style={{ animation: 'liftHand 0.38s cubic-bezier(0.16,1,0.3,1) both' }} />
            {/* Left fingers */}
            {[[18, 40], [26, 35], [36, 36]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="6" fill="#f6c945" stroke="#b8912b" strokeWidth="2"
                style={{ animation: `liftHand 0.38s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both` }} />
            ))}

            {/* ─── Right arm + hand ─── */}
            <path d="M 108 98 Q 106 70 84 52" stroke="#7a5230" strokeWidth="10" strokeLinecap="round" fill="none"
              style={{ animation: 'liftHand 0.38s cubic-bezier(0.16,1,0.3,1) both' }} />
            <circle cx="84" cy="51" r="12.5" fill="#f6c945" stroke="#b8912b" strokeWidth="2.5"
              style={{ animation: 'liftHand 0.38s cubic-bezier(0.16,1,0.3,1) both' }} />
            {/* Right fingers */}
            {[[92, 40], [84, 35], [74, 36]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="6" fill="#f6c945" stroke="#b8912b" strokeWidth="2"
                style={{ animation: `liftHand 0.38s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both` }} />
            ))}
          </>
        )}

        {/* ===== MOUTH ===== */}
        {hasError ? (
          <path d="M 38 66 Q 55 57 72 66" stroke="#b5342a" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 38 66 Q 55 76 72 66" stroke="#1e3a5f" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        )}

        {/* Blush cheeks (happy state) */}
        {!hasError && !passwordFocused && (
          <>
            <ellipse cx="22" cy="62" rx="8" ry="5.5" fill="#ef6f4e" opacity="0.26" />
            <ellipse cx="88" cy="62" rx="8" ry="5.5" fill="#ef6f4e" opacity="0.26" />
          </>
        )}
      </svg>
    </div>
  );
};

/* ============================================================
   MAGNETIC BUTTON — follows cursor magnet-style on hover
   ============================================================ */
const MagneticButton = ({ children, className, disabled, style, type }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const btnRef = useRef(null);
  const isTouch = useRef(typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches);

  const handleMouseMove = useCallback((e) => {
    if (disabled || isTouch.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.38;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.38;
    setOffset({ x, y });
  }, [disabled]);

  const handleMouseLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return (
    <button
      ref={btnRef}
      type={type || 'button'}
      className={`btn-magnetic ${className || ''}`}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: (offset.x === 0 && offset.y === 0)
          ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s'
          : 'transform 0.1s ease',
      }}
    >
      {children}
    </button>
  );
};

/* ============================================================
   EMAIL LENGTH INDICATOR (small progress dots)
   ============================================================ */
const EmailDots = ({ length }) => {
  const steps = 5;
  const filled = Math.min(Math.floor((length / 30) * steps), steps);
  return (
    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', alignItems: 'center' }}>
      {Array.from({ length: steps }).map((_, i) => (
        <div key={i} style={{
          width: i < filled ? '14px' : '6px', height: '6px', borderRadius: '3px',
          background: i < filled ? 'var(--navy)' : '#d9cfba',
          transition: 'all 0.25s ease',
        }} />
      ))}
      {length > 0 && (
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#8a7355', marginLeft: '4px' }}>
          {length} karakter
        </span>
      )}
    </div>
  );
};

/* ============================================================
   MAIN LOGIN PAGE
   ============================================================ */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [shaking, setShaking] = useState(false);
  const formRef = useRef(null);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 700);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const authToken = res?.token || res?.data?.token;
      const userObj = res?.user || res?.data?.user;

      login({ token: authToken, user: userObj });

      if (userObj?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userObj?.role === 'panitia') {
        navigate('/panitia/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setErrorMsg(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper page-fade">
      <div
        ref={formRef}
        className={`card form-card ${shaking ? 'form-shake-error' : ''}`}
        style={{
          margin: 0,
          width: '100%',
          maxWidth: '420px',
          paddingBottom: '28px',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* ── MASCOT ── */}
        <RobotMascot
          emailLength={email.length}
          passwordFocused={passwordFocused}
          hasError={!!errorMsg}
        />

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="eyebrow" style={{ color: '#8a7355', display: 'block', marginBottom: '4px' }}>
            Autentikasi Akun
          </div>
          <h2 style={{ margin: 0, fontSize: '26px' }}>Masuk EventHub Kampus</h2>
        </div>

        {/* ── ERROR MESSAGE ── */}
        {errorMsg && (
          <div className="form-msg error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="field">
            <label>Email Kampus</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="budi@kampus.ac.id"
              autoComplete="email"
            />
            <EmailDots length={email.length} />
          </div>

          {/* Password */}
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {passwordFocused && (
              <small style={{ color: '#8a7355', fontFamily: "'Space Mono', monospace" }}>
                🔒 Maskot menutup mata saat kamu mengetik!
              </small>
            )}
          </div>

          {/* Magnetic Submit Button */}
          <MagneticButton
            type="submit"
            className="btn btn-navy"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '4px', fontSize: '14px', letterSpacing: '0.5px' }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Memvalidasi...
              </>
            ) : 'Masuk Sekarang →'}
          </MagneticButton>
        </form>

        {/* ── SWITCH LINK ── */}
        <p className="switch-link" style={{ marginTop: '18px' }}>
          Belum punya akun?{' '}
          <Link to="/register">Daftar Akun Mahasiswa</Link>
        </p>
      </div>

      {/* Spinner keyframe (for loading state) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
