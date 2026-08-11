import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="page-fade" style={{ textAlign: 'center', padding: '80px 20px', color: '#fff' }}>
    <h1 style={{ fontSize: '80px', color: 'var(--paper-yellow)', margin: '0 0 8px', textShadow: '3px 4px 0 rgba(0,0,0,0.3)' }}>404</h1>
    <h2 style={{ color: '#fff', fontSize: '28px' }}>Halaman Tidak Ditemukan</h2>
    <p className="lede" style={{ margin: '12px auto 28px' }}>
      Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan dari papan.
    </p>
    <Link to="/" className="btn btn-primary">← Kembali ke Papan Event</Link>
  </div>
);

export default NotFound;
