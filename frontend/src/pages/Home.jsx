import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';

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
    speaker: 'Budi Rahardjo (AI Expert & Tech Venture Partner)', quota: 100, registered: 98, status: 'published', color: 'yellow',
    benefits: ['✨ E-Sertifikat SKKM (5 Poin)', '🍱 Free Lunch Box & Snack', '🎁 Doorprize E-Wallet 3Jt'],
    desc: 'Buka peluang karir masa depanmu! Pelajari bagaimana Generative AI dan Prompt Engineering mentransformasi industri perangkat lunak modern. Terbuka untuk seluruh mahasiswa kampus.'
  },
  {
    id: 'e2', title: 'Robotics Bootcamp & Battle Bot Tournament 2026', category: 'Technology',
    org: 'UKM Robotika Kampus', location: 'Lab Robotika & Gedung Serbaguna', date: '2026-08-22T09:00',
    speaker: 'Dr. Eng. Ir. Hendra (Pakar Mekatronika)', quota: 80, registered: 45, status: 'published', color: 'sky',
    benefits: ['✨ E-Sertifikat SKKM (5 Poin)', '🤖 Kit Komponen Robot Dasar', '🏆 Total Hadiah 5 Juta'],
    desc: 'Pelatihan praktis pembuatan robot bertema Battle Bot. Peserta akan merakit, memprogram mikrokontroler, dan bertanding di arena akhir acara.'
  },
  {
    id: 'e3', title: 'Donor Darah Massal & Pemeriksaan Kesehatan Gratis', category: 'Health',
    org: 'Himpunan Mahasiswa Kesehatan', location: 'Gedung Serbaguna Kampus', date: '2026-08-25T08:00',
    speaker: 'Tim Dokter Medis PMI Kota', quota: 150, registered: 110, status: 'published', color: 'mint',
    benefits: ['✨ Piagam Kemanusiaan PMI', '🥛 Paket Suplemen & Susu', '🩺 Cek Gula Darah & Kolesterol'],
    desc: 'Setetes darahmu penyelemat jiwa sesama! Dapatkan pemeriksaan kesehatan gratis dari dokter spesialis dan pemeriksaan gula darah mandiri.'
  },
  {
    id: 'e4', title: 'Kampus Art Exhibition & Live Acoustic Concert', category: 'Art',
    org: 'UKM Seni & Seni Suara', location: 'Lapangan Outdoor Kampus', date: '2026-08-28T15:00',
    speaker: 'Dian Sastro & Band Kampus Alumnus', quota: 200, registered: 200, status: 'published', color: 'lavender',
    benefits: ['✨ E-Sertifikat SKKM (3 Poin)', '🎨 Merch Sticker Event', '🍿 Snack & Softdrink Gratis'],
    desc: 'Nikmati pameran seni lukis dan instalasi mahasiswa kampus dipadu konser akustik merdu saat matahari terbenam.'
  },
  {
    id: 'e5', title: 'Workshop Public Speaking & Leadership Masterclass', category: 'Career',
    org: 'BEM Universitas Kampus', location: 'Ruang Seminar Perpustakaan L5', date: '2026-09-05T10:00',
    speaker: 'Najwa Shihab (Jurnalis & Founder Narasi)', quota: 120, registered: 60, status: 'published', color: 'coral',
    benefits: ['✨ E-Sertifikat SKKM (5 Poin)', '📚 Buku Panduan Leadership', '☕ Coffee Break Premium'],
    desc: 'Kuasai seni berkomunikasi di depan umum, tingkatkan rasa percaya diri, dan bangun jiwa kepemimpinan mahasiswa di era digital.'
  }
];

const CATEGORIES = ['All', 'Technology', 'Career', 'Health', 'Art'];
const CAT_LABELS = {
  All: '🌟 Semua Event',
  Technology: '🤖 Technology & AI',
  Career: '💼 Business & Career',
  Health: '🩺 Health & Social',
  Art: '🎨 Art & Culture'
};

const formatDate = (dt) => new Date(dt).toLocaleDateString('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeModalEvent, setActiveModalEvent] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const filtered = useMemo(() => {
    return EVENTS.filter(ev => {
      const matchCat = selectedCat === 'All' || ev.category === selectedCat;
      const matchSearch = !search ||
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.org.toLowerCase().includes(search.toLowerCase()) ||
        ev.speaker.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCat, search]);

  const handleRegisterEvent = useCallback(async (ev) => {
    if (!user) {
      toast.error('Silakan masuk (login) terlebih dahulu untuk mendaftar event.');
      navigate('/login');
      return;
    }
    
    setIsRegistering(true);
    // Simulate API Call for Registration
    setTimeout(() => {
      toast.success(`Berhasil mendaftar event: "${ev.title}"! Tiket tersedia di Dashboard Anda.`);
      setIsRegistering(false);
      setActiveModalEvent(null);
    }, 1200);
  }, [user, navigate]);

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

      {/* Poster Board Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '18px', margin: '0 0 8px' }}>😔 Tidak ada event yang sesuai.</p>
          <p style={{ fontSize: '13px', color: '#dbe6f2' }}>Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
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
                onClick={() => setActiveModalEvent(ev)}
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
      {activeModalEvent && (
        <div className="modal-backdrop" onClick={() => setActiveModalEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModalEvent(null)}>✕</button>

            <div className="eyebrow" style={{ color: '#8a7355', marginBottom: '4px' }}>
              Detail Event Resmi Kampus
            </div>

            <div className="detail-wrap" style={{ marginTop: '12px' }}>
              <div className={`detail-poster ${POSTER_COLORS[activeModalEvent.color] || 'c-yellow'}`}>
                <span className="cat-badge">{activeModalEvent.category}</span>
                <div className="org" style={{ marginTop: '4px' }}>{activeModalEvent.org}</div>
                <h2>{activeModalEvent.title}</h2>
                <div className="speaker-highlight" style={{ fontSize: '13px', padding: '6px 10px', background: 'rgba(255,255,255,0.6)' }}>
                  🎤 Speaker: {activeModalEvent.speaker}
                </div>
                <p className="desc">{activeModalEvent.desc}</p>
                <div className="perks-box">
                  <h4>Fasilitas &amp; Benefit Peserta:</h4>
                  {activeModalEvent.benefits.map((b, i) => (
                    <div key={i} className="perk-item">{b}</div>
                  ))}
                </div>
              </div>

              <div className="ticket">
                <div>
                  <h4>Status Kuota Pendaftaran</h4>
                  <div style={{ fontSize: '20px', fontFamily: "'Anton', sans-serif", marginTop: '6px' }}>
                    {activeModalEvent.registered} / {activeModalEvent.quota} Terisi
                  </div>
                  
                  <div className="quota-bar">
                    <div
                      className={
                        activeModalEvent.registered >= activeModalEvent.quota
                          ? 'full'
                          : (activeModalEvent.quota - activeModalEvent.registered) <= 10
                          ? 'warn'
                          : ''
                      }
                      style={{ width: `${Math.min(100, (activeModalEvent.registered / activeModalEvent.quota) * 100)}%` }}
                    />
                  </div>

                  <div className="perforation" />

                  <h4>Waktu &amp; Tempat</h4>
                  <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--ink)' }}>
                    📅 {formatDate(activeModalEvent.date)}<br />
                    📍 {activeModalEvent.location}
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  {activeModalEvent.registered >= activeModalEvent.quota ? (
                    <button className="btn btn-danger" style={{ width: '100%' }} disabled>
                      🚫 Kuota Pendaftaran Penuh
                    </button>
                  ) : (
                    <button
                      className="btn btn-navy"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleRegisterEvent(activeModalEvent)}
                      disabled={isRegistering}
                    >
                      {isRegistering ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite', marginRight: '6px' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Memproses Pendaftaran...
                        </>
                      ) : (
                        user ? '🎟️ Daftar Event Sekarang' : '🔑 Masuk untuk Mendaftar'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
