import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const POSTER_COLORS = {
  yellow: 'c-yellow',
  coral: 'c-coral',
  sky: 'c-sky',
  mint: 'c-mint',
  lavender: 'c-lavender',
};

const EVENTS = [
  {
    id: 'e1', title: 'Seminar Nasional: Generative AI & Career Transformation 2026', category: 'Technology',
    org: 'BEM Fakultas Ilmu Komputer', location: 'Auditorium Utama & Zoom Hybrid', date: '2026-08-20T09:00',
    speaker: 'Budi Rahardjo (AI Expert & Tech Venture Partner)', quota: 100, registered: 2, status: 'published', color: 'yellow',
    benefits: ['✨ E-Sertifikat SKKM (5 Poin)', '🍱 Free Lunch Box & Snack', '🎁 Doorprize E-Wallet 3Jt'],
    desc: 'Buka peluang karir masa depanmu! Pelajari bagaimana Generative AI dan Prompt Engineering mentransformasi industri perangkat lunak modern.'
  },
  {
    id: 'e3', title: 'Donor Darah Massal & Pemeriksaan Kesehatan Gratis', category: 'Health',
    org: 'Himpunan Mahasiswa Kesehatan', location: 'Gedung Serbaguna Kampus', date: '2026-08-25T08:00',
    speaker: 'Tim Dokter Medis PMI Kota', quota: 150, registered: 1, status: 'published', color: 'mint',
    benefits: ['✨ Piagam Kemanusiaan PMI', '🥛 Paket Suplemen & Susu', '🩺 Cek Gula Darah & Kolesterol'],
    desc: 'Setetes darahmu penyelemat jiwa sesama! Dapatkan pemeriksaan kesehatan gratis dari dokter spesialis.'
  },
];

const CATEGORIES = ['All', 'Technology', 'Career', 'Health', 'Art'];
const CAT_LABELS = {
  All: '🌟 Semua Event', Technology: '🤖 Technology & AI',
  Career: '💼 Business & Career', Health: '🩺 Health & Social', Art: '🎨 Art & Culture'
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const filtered = EVENTS.filter(ev => {
    const matchCat = selectedCat === 'All' || ev.category === selectedCat;
    const matchSearch = !search || ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.org.toLowerCase().includes(search.toLowerCase()) || ev.speaker.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatDate = (dt) => new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page-fade">
      {/* Hero */}
      <div className="hero">
        <div className="eyebrow">Platform Resmi Acara Kampus</div>
        <h1>Temukan Acara Kampus Terbaik,<br />Kembangkan Skill &amp; Dapatkan E-Sertifikat.</h1>
        <p className="lede">
          Eksplorasi seminar, workshop, dan kompetisi resmi dari BEM, UKM, &amp; Himpunan. Seluruh event telah diverifikasi resmi oleh Admin Platform Kampus.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="filter-section">
        <div className="filter-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cari event, narasumber, atau organisasi (mis. 'AI', 'Robotika', 'BEM')..."
          />
        </div>
        <div className="category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${selectedCat === cat ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat)}
            >
              {CAT_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Poster Board */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>😔 Tidak ada event yang sesuai dengan pencarian.</p>
        </div>
      ) : (
        <div className="board">
          {filtered.map(ev => {
            const isFull = ev.registered >= ev.quota;
            const isUrgent = !isFull && (ev.quota - ev.registered) <= 10;
            return (
              <div
                key={ev.id}
                className={`poster ${POSTER_COLORS[ev.color] || 'c-yellow'}`}
                onClick={() => user ? null : navigate('/login')}
              >
                <div>
                  <span className="cat-badge">{ev.category}</span>
                  <div className="org">{ev.org}</div>
                  <h3>{ev.title}</h3>
                  <div className="speaker-highlight">🎤 {ev.speaker}</div>
                  <div className="benefit-chips">
                    {ev.benefits.map((b, i) => <span key={i} className="chip">{b}</span>)}
                  </div>
                  <div className="meta">
                    📅 {formatDate(ev.date)}<br />
                    📍 {ev.location}
                  </div>
                </div>
                <div>
                  <span className={`quota-tag ${isFull ? 'full' : isUrgent ? 'urgent' : ''}`}>
                    🎟️ {isFull ? 'PENUH' : `${ev.quota - ev.registered} sisa dari ${ev.quota}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
