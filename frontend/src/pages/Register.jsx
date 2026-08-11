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
      setErrorMsg('Semua kolom wajib diisi');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        nama,
        email,
        password,
        role: 'mahasiswa'
      });

      if (response.status === 'success' || response.statusCode === 201) {
        setSuccessMsg('Registrasi berhasil! Mengalihkan ke halaman login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMsg(response.message || 'Registrasi gagal');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Daftar Akun</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Daftar sebagai Mahasiswa untuk mengikuti event</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 text-sm rounded-lg">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Ahmad Kurnia"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kampus.ac.id"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
