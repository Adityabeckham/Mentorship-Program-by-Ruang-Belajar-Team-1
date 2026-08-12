import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import * as yup from 'yup';

const registerSchema = yup.object().shape({
  nama: yup.string().required('Nama lengkap wajib diisi.'),
  email: yup.string().required('Email wajib diisi.').email('Format email tidak valid.'),
  password: yup.string().required('Password wajib diisi.').min(8, 'Password minimal 8 karakter.'),
  confirmPassword: yup.string()
    .required('Konfirmasi password wajib diisi.')
    .oneOf([yup.ref('password')], 'Konfirmasi password tidak cocok dengan password.'),
});

const Register = () => {
  const navigate = useNavigate();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setFieldErrors({});

    try {
      await registerSchema.validate(
        { nama, email, password, confirmPassword },
        { abortEarly: false }
      );
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
        return;
      }
    }

    setLoading(true);
    try {
      await authService.register(nama, email, password);
      toast.success('Registrasi akun mahasiswa berhasil!');
      setSuccessMsg('Registrasi akun mahasiswa berhasil! Mengalihkan ke halaman masuk...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper page-fade">
      <div className="card form-card" style={{ margin: '0 auto', width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="eyebrow" style={{ color: '#8a7355', display: 'block', marginBottom: '4px' }}>
            Pendaftaran Mahasiswa
          </div>
          <h2 style={{ margin: 0, fontSize: '26px' }}>Buat Akun Mahasiswa Baru</h2>
          <p style={{ fontSize: '13px', color: '#8a7355', marginTop: '4px' }}>
            Pendaftaran mandiri diperuntukkan bagi mahasiswa aktif kampus.
          </p>
        </div>

        {errorMsg && (
          <div className="form-msg error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="form-msg success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Budi Santoso"
              required
            />
            {fieldErrors.nama && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.nama}</div>}
          </div>

          <div className="field">
            <label>Email Kampus Resmi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi@kampus.ac.id"
              required
            />
            {fieldErrors.email && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.email}</div>}
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
            />
            {fieldErrors.password && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.password}</div>}
            <small>Gunakan kombinasi huruf &amp; angka</small>
          </div>

          <div className="field">
            <label>Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {fieldErrors.confirmPassword && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-navy"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '12px' }}
          >
            {loading ? 'Memproses Registrasi...' : 'Daftar Akun Mahasiswa →'}
          </button>
        </form>

        <p className="switch-link" style={{ marginTop: '20px' }}>
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
