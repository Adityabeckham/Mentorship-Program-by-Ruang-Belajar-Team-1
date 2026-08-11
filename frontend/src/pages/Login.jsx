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
      console.error(error);
      const msg = error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="font-anton text-[46px] text-white tracking-wide" style={{ textShadow: '2px 3px 0 rgba(0, 0, 0, .3)', lineHeight: 1.1 }}>
          MASUK PLATFORM
        </h1>
        <div className="font-mono text-xs text-[#f0e6cf] uppercase tracking-[1.5px] mt-2 opacity-85 inline-block">
          Verifikasi Identitas Anda
        </div>
      </div>

      {/* Card */}
      <div className="bg-paper-white rounded-xl shadow-pin p-6 md:p-8 w-full max-w-[460px] text-ink relative">
        {/* Pin decoration */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full shadow-[0_3px_6px_rgba(0,0,0,.45)]"
          style={{ background: 'radial-gradient(circle at 35% 30%, #fff8, var(--color-stamp-red) 60%)' }}>
        </div>

        <h2 className="font-anton text-[28px] mb-4 text-center">LOGIN MAHASISWA</h2>

        {errorMsg && (
          <div className="text-[13px] font-semibold p-3 rounded-lg mb-4 bg-[#fbe3df] text-[#8c2b1e] border border-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[13px] font-bold text-ink-soft mb-1.5">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kampus.ac.id"
              className="w-full px-3.5 py-2.5 border-2 border-[#d9cfba] rounded-lg font-work text-sm bg-[#fffdf8] focus:border-navy focus:bg-white focus:outline-none transition-colors"
              required
            />
            <small className="text-[#8a7355] text-[11.5px] block mt-1">Gunakan email akademik kampus.</small>
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-bold text-ink-soft mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border-2 border-[#d9cfba] rounded-lg font-work text-sm bg-[#fffdf8] focus:border-navy focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-navy justify-center py-3 text-[14.5px]"
          >
            {loading ? 'MEMVALIDASI...' : 'MASUK SEKARANG'}
          </button>
        </form>

        <div className="text-[13px] text-center mt-5 text-ink-soft font-work">
          Belum memiliki akun?{' '}
          <Link to="/register" className="text-navy font-bold underline cursor-pointer">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
