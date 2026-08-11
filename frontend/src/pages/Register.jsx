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
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 border-2 border-[#d9cfba] rounded-lg font-work text-sm bg-[#fffdf8] focus:border-navy focus:bg-white focus:outline-none transition-colors";
  const labelClass = "block text-[13px] font-bold text-ink-soft mb-1.5";

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 py-10">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="font-anton text-[46px] text-white tracking-wide" style={{ textShadow: '2px 3px 0 rgba(0, 0, 0, .3)', lineHeight: 1.1 }}>
          DAFTAR AKUN BARU
        </h1>
        <div className="font-mono text-xs text-[#f0e6cf] uppercase tracking-[1.5px] mt-2 opacity-85 inline-block">
          Akses Platform Resmi Acara Kampus
        </div>
      </div>

      {/* Card */}
      <div className="bg-paper-white rounded-xl shadow-pin p-6 md:p-8 w-full max-w-[460px] text-ink relative">
        {/* Pin decoration */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full shadow-[0_3px_6px_rgba(0,0,0,.45)]"
          style={{ background: 'radial-gradient(circle at 35% 30%, #fff8, var(--color-stamp-red) 60%)' }}>
        </div>

        <h2 className="font-anton text-[28px] mb-4 text-center">REGISTRASI MAHASISWA</h2>

        {errorMsg && (
          <div className="text-[13px] font-semibold p-3 rounded-lg mb-4 bg-[#fbe3df] text-[#8c2b1e] border border-red-400">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="text-[13px] font-semibold p-3 rounded-lg mb-4 bg-[#e2f3e8] text-[#2f7a4f] border border-green-400">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClass}>Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Ahmad Kurnia"
              className={inputClass}
              required
            />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kampus.ac.id"
              className={inputClass}
              required
            />
            <small className="text-[#8a7355] text-[11.5px] block mt-1">Gunakan email akademik kampus.</small>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              required
            />
          </div>

          <div className="mb-5">
            <label className={labelClass}>Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary justify-center py-3 text-[14.5px]"
          >
            {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
          </button>
        </form>

        <div className="text-[13px] text-center mt-5 text-ink-soft font-work">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-navy font-bold underline cursor-pointer">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
