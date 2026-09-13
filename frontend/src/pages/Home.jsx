import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import toast from 'react-hot-toast';
import eventService from '../services/eventService';
import registrationService from '../services/registrationService';

const POSTER_COLORS = ['c-yellow', 'c-sky', 'c-mint', 'c-coral', 'c-lavender'];

const CATEGORIES = ['All', 'Technology', 'Career', 'Health', 'Art'];
const CAT_LABELS = {
  All: '🌟 Semua Event',
  Technology: '🤖 Technology & AI',
  Career: '💼 Business & Career',
  Health: '🩺 Health & Social',
  Art: '🎨 Art & Culture',
};

const formatDate = (dt) => {
  if (!dt) return '-';
  const parsed = new Date(dt);
  return Number.isNaN(parsed.getTime())
    ? '-'
    : parsed.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeModalEvent, setActiveModalEvent] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getAllEvents();
      const serverEvents = (res.data || []).map((ev, idx) => ({
        id: ev.id,
        title: ev.title,
        category: ev.category || 'General',
        org: ev.users?.organization_name || ev.users?.nama || 'Panitia Kampus',
        location: ev.location || '-',
        date: ev.event_date,
        speaker: ev.speaker || 'Narasumber Kampus',
        quota: ev.quota || 0,
        registered: ev.registered || ev.peserta || 0,
        status: ev.status || 'published',
        color: POSTER_COLORS[idx % POSTER_COLORS.length],
        benefits: ev.benefits || ['✨ E-Sertifikat SKKM Resmi'],
        desc: ev.description || 'Tidak ada deskripsi tambahan.',
      }));
      setEventsData(serverEvents);
    } catch (err) {
      toast.error('Gagal mengambil daftar event.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered = useMemo(() => {
    return eventsData.filter((ev) => {
      const matchCat = selectedCat === 'All' || ev.category.toLowerCase() === selectedCat.toLowerCase();
      const matchSearch =
        search.trim() === '' ||
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.org.toLowerCase().includes(search.toLowerCase()) ||
        ev.speaker.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCat, search, eventsData]);

  const handleRegisterEvent = useCallback(
    async (ev) => {
      if (!user) {
        toast.error('Silakan masuk (login) terlebih dahulu untuk mendaftar event.');
        navigate('/login');
        return;
      }

      if (user.role === 'panitia' || user.role === 'admin') {
        toast.error('Pendaftaran event khusus untuk akun role Mahasiswa.');
        return;
      }

      setIsRegistering(true);
      try {
        await registrationService.registerForEvent(ev.id);
        toast.success(`Berhasil mendaftar event: "${ev.title}"! Tiket tersedia di Dashboard Anda.`);
        setActiveModalEvent(null);
        fetchEvents();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal mendaftar event. Silakan coba lagi.');
      } finally {
        setIsRegistering(false);
      }
    },
    [user, navigate, fetchEvents]
  );

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
          {CATEGORIES.map((cat) => (
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
      {loading ? (
        <div className="empty-state">
          <p style={{ fontSize: '16px', margin: 0, color: '#dbe6f2' }}>Memuat daftar event kampus...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '18px', margin: '0 0 8px' }}>😔 Belum ada event yang dipublikasikan.</p>
          <p style={{ fontSize: '13px', color: '#dbe6f2' }}>Coba ubah kata kunci pencarian atau silakan kembali lagi nanti.</p>
        </div>
      ) : (
        <div className="board">
          {filtered.map((ev) => {
            const isFull = ev.registered >= ev.quota;
            const isUrgent = !isFull && ev.quota - ev.registered <= 10;
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
                    {ev.benefits.map((b, i) => (
                      <span key={i} className="chip">{b}</span>
                    ))}
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
                          : activeModalEvent.quota - activeModalEvent.registered <= 10
                          ? 'warn'
                          : ''
                      }
                      style={{
                        width: `${Math.min(
                          100,
                          (activeModalEvent.registered / (activeModalEvent.quota || 1)) * 100
                        )}%`,
                      }}
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
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            style={{ animation: 'spin 0.8s linear infinite', marginRight: '6px' }}
                          >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Memproses Pendaftaran...
                        </>
                      ) : user ? (
                        user.role === 'panitia' || user.role === 'admin' ? (
                          'ℹ️ Hanya Mahasiswa yang Dapat Mendaftar'
                        ) : (
                          '🎟️ Daftar Event Sekarang'
                        )
                      ) : (
                        '🔑 Masuk untuk Mendaftar'
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
