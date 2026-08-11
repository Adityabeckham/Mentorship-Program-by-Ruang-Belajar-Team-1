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
    desc: 'Buka peluang karir masa depanmu! Pelajari bagaimana Generative AI dan Prompt Engineering mentransformasi industri perangkat lunak modern. Cocok untuk mahasiswa semua jurusan yang ingin beradaptasi dengan era AI.'
  },
  {
    id: 'e3', title: 'Donor Darah Massal & Pemeriksaan Kesehatan Gratis', category: 'Health',
    org: 'Himpunan Mahasiswa Kesehatan', location: 'Gedung Serbaguna Kampus', date: '2026-08-25T08:00',
    speaker: 'Tim Dokter Medis PMI Kota', quota: 150, registered: 1, status: 'published', color: 'mint',
    benefits: ['✨ Piagam Kemanusiaan PMI', '🥛 Paket Suplemen & Susu', '🩺 Cek Gula Darah & Kolesterol'],
    desc: 'Setetes darahmu penyelemat jiwa sesama! Dapatkan pemeriksaan kesehatan gratis dari dokter spesialis. Kegiatan ini juga terbuka untuk umum dan warga sekitar kampus.'
  },
  {
    id: 'e4', title: 'Workshop UI/UX Design: Figma for Beginners', category: 'Art',
    org: 'UKM Multimedia & Desain', location: 'Lab Komputer A', date: '2026-08-28T13:00',
    speaker: 'Sarah Wijaya (Senior Product Designer)', quota: 40, registered: 35, status: 'published', color: 'lavender',
    benefits: ['✨ E-Sertifikat', '🎨 Figma Pro 1 Bulan', '📈 Portfolio Review'],
    desc: 'Belajar desain antarmuka aplikasi mobile menggunakan Figma dari nol. Bawa laptop masing-masing yang sudah terinstall Figma desktop app.'
  },
  {
    id: 'e5', title: 'Lomba Esai Mahasiswa Nasional 2026', category: 'Career',
    org: 'UKM Penalaran', location: 'Online Submission', date: '2026-09-10T23:59',
    speaker: '-', quota: 500, registered: 120, status: 'published', color: 'coral',
    benefits: ['🏆 Total Hadiah 10 Juta', '🏅 Medali Pemenang', '📚 Publikasi Nasional'],
    desc: 'Tuangkan ide kreatifmu dalam Lomba Esai bertema "Mahasiswa di Era Disrupsi Digital". Pendaftaran gratis bagi mahasiswa kampus ini.'
  }
];

const CATEGORIES = ['All', 'Technology', 'Career', 'Health', 'Art'];
const CAT_LABELS = {
  All: '🌟 Semua Event', Technology: '🤖 Technology & AI',
  Career: '💼 Business & Career', Health: '🩺 Health & Social', Art: '🎨 Art & Culture'
};

const formatDate = (dt) => new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const EventDetailModal = ({ event, onClose, user, navigate }) => {
  if (!event) return null;
  const isFull = event.registered >= event.quota;

  const handleRegister = () => {
    if (!user) {
      navigate('/login');
    } else {
      alert('Fitur pendaftaran event akan segera hadir di Sprint selanjutnya!');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="cat-badge">{event.category}</span>
            <span style={{ fontSize: '12.5px', color: '#8a7355', fontWeight: 'bold' }}>{event.org}</span>
          </div>
          
          <h2>{event.title}</h2>
          
          <div style={{ marginBottom: '24px', fontSize: '15px', lineHeight: '1.6', color: '#4a3626' }}>
            {event.desc}
          </div>

          <div className="modal-grid">
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a7355', fontWeight: 'bold', marginBottom: '4px' }}>Jadwal Pelaksanaan</div>
              <div style={{ fontWeight: '600', color: '#132840' }}>📅 {formatDate(event.date)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a7355', fontWeight: 'bold', marginBottom: '4px' }}>Lokasi</div>
              <div style={{ fontWeight: '600', color: '#132840' }}>📍 {event.location}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a7355', fontWeight: 'bold', marginBottom: '4px' }}>Pembicara/Pemateri</div>
              <div style={{ fontWeight: '600', color: '#132840' }}>🎤 {event.speaker}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a7355', fontWeight: 'bold', marginBottom: '4px' }}>Sisa Kuota</div>
              <div style={{ fontWeight: '600', color: isFull ? '#b5342a' : '#2f7a4f' }}>
                🎟️ {isFull ? 'Kouta Penuh' : `${event.quota - event.registered} kursi tersedia (dari ${event.quota})`}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a7355', fontWeight: 'bold', marginBottom: '8px' }}>Benefit Peserta</div>
            <div className="benefit-chips" style={{ flexWrap: 'wrap' }}>
              {event.benefits.map((b, i) => <span key={i} className="chip">{b}</span>)}
            </div>
          </div>

          <button 
            className="btn btn-navy" 
            style={{ width: '100%', justifyContent: 'center', opacity: isFull ? 0.6 : 1 }}
            disabled={isFull}
            onClick={handleRegister}
          >
            {isFull ? 'Event Penuh' : (user ? 'Daftar Event Ini' : 'Login untuk Mendaftar')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filtered = EVENTS.filter(ev => {
    const matchCat = selectedCat === 'All' || ev.category === selectedCat;
    const matchSearch = !search || ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.org.toLowerCase().includes(search.toLowerCase()) || ev.speaker.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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

      {/* Poster Board (Katalog Event) */}
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
                onClick={() => setSelectedEvent(ev)}
                style={{ cursor: 'pointer' }}
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

      {/* Event Detail Modal */}
      <EventDetailModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)}
        user={user}
        navigate={navigate}
      />
    </div>
  );
};

export default Home;
