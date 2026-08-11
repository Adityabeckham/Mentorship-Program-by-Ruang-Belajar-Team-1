import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import authService from '../services/authService';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade">
      <div className="card form-card">
        <div className="eyebrow" style={{ color: '#8a7355' }}>Autentikasi Akun</div>
        <h2>Masuk EventHub Kampus</h2>

        {errorMsg && (
          <div className="form-msg error">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email Kampus</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi@kampus.ac.id"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="btn btn-navy"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Memvalidasi...' : 'Masuk Sekarang'}
          </button>
        </form>

        <p className="switch-link">
          Belum punya akun? <Link to="/register">Daftar Akun Mahasiswa</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
