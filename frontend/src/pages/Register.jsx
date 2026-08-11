import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nama || !email || !password || !confirmPassword) {
      setErrorMsg('Semua kolom formulir wajib diisi.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(nama, email, password);
      setSuccessMsg('Registrasi akun mahasiswa berhasil! Mengalihkan ke halaman masuk...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper page-fade">
      <div className="card form-card" style={{ margin: 0, width: '100%', maxWidth: '420px' }}>
        <div className="eyebrow" style={{ color: '#8a7355' }}>Pendaftaran Mahasiswa</div>
        <h2>Buat Akun Mahasiswa Baru</h2>
        <p style={{ fontSize: '12.5px', color: '#8a7355', marginTop: '-6px' }}>
          Pendaftaran mandiri diperuntukkan bagi mahasiswa aktif kampus.
        </p>

        {errorMsg && <div className="form-msg error">{errorMsg}</div>}
        {successMsg && <div className="form-msg success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nama Lengkap</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Budi Santoso" />
          </div>
          <div className="field">
            <label>Email Kampus Resmi</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@kampus.ac.id" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" />
            <small>Kombinasi huruf &amp; angka</small>
          </div>
          <div className="field">
            <label>Konfirmasi Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button
            type="submit"
            className="btn btn-navy"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Memproses...' : 'Daftar Akun Mahasiswa'}
          </button>
        </form>

        <p className="switch-link">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
