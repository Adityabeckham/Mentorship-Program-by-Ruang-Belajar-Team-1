import React, { useState } from 'react';
import toast from 'react-hot-toast';

const INITIAL_EVENTS = [
  { id: 'v-1', org: 'UKM Robotika Kampus', title: 'Robotics Bootcamp & Battle Bot Tournament 2026', date: '22 Agt 2026, 09:00', status: 'pending_verification', speaker: 'Dr. Eng. Ir. Hendra (Pakar Mekatronika)', quota: 80, registered: 0, location: 'Lab Robotika & Gedung Serbaguna', desc: 'Kompetisi battle bot dan pelatihan pembuatan robot dari dasar hingga tahap pemrograman mikrokontroler.', benefits: ['✨ E-Sertifikat SKKM 5 Poin', '🤖 Kit Komponen Robot dasar', '🏆 Piala & Total Hadiah 5 Juta'] },
  { id: 'v-2', org: 'UKM Seni & Seni Suara', title: 'Kampus Art Exhibition & Live Acoustic Concert', date: '28 Agt 2026, 15:00', status: 'pending_verification', speaker: 'Dian Sastro & Band Kampus Alumnus', quota: 200, registered: 0, location: 'Lapangan Outdoor Kampus', desc: 'Pameran karya lukis & seni instalasi mahasiswa gabungan dengan konser musik akustik sore hari.', benefits: ['✨ E-Sertifikat SKKM 3 Poin', '🎨 Merch Sticker Event', '🍿 Snack & Softdrink Gratis'] },
  { id: 'v-3', org: 'BEM Fakultas Ilmu Komputer', title: 'Seminar Nasional: Generative AI & Career Transformation 2026', date: '20 Agt 2026, 09:00', status: 'published', speaker: 'Budi Rahardjo (AI Expert)', quota: 100, registered: 2, location: 'Auditorium Utama & Zoom Hybrid', desc: 'Buka peluang karir masa depanmu! Pelajari bagaimana Generative AI mentransformasi industri modern.', benefits: ['✨ E-Sertifikat SKKM 5 Poin', '🍱 Lunch Box & Snack', '🎁 Doorprize E-Wallet 3 Juta'] },
  { id: 'v-4', org: 'BEM Fakultas Ilmu Komputer', title: 'Hackathon Kampus 24 Jam: Build Smart Campus Apps', date: '01 Sep 2026, 08:00', status: 'rejected', speaker: 'Senior Architect Gojek', quota: 60, registered: 0, location: 'Co-Working Space Perpustakaan', desc: 'Kompetisi coding 24 jam membuat solusi aplikasi pintar untuk kampus.', benefits: ['✨ E-Sertifikat SKKM 10 Poin', '🍕 Free Flow Coffee & Pizza'] },
];

const AdminVerify = () => {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [filter, setFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = events.filter(e => {
    if (filter === 'PENDING') return e.status === 'pending_verification';
    if (filter === 'PUBLISHED') return e.status === 'published';
    if (filter === 'REJECTED') return e.status === 'rejected';
    return true;
  });

  const handleApprove = (id) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'published' } : e));
    toast.success('Event telah disetujui & otomatis diterbitkan ke Papan Event!');
    if (selectedEvent?.id === id) {
      setSelectedEvent(prev => ({ ...prev, status: 'published' }));
    }
  };

  const handleReject = (id) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e));
    toast.error('Event telah ditolak.');
    if (selectedEvent?.id === id) {
      setSelectedEvent(prev => ({ ...prev, status: 'rejected' }));
    }
  };

  return (
    <div className="page-fade">
      {/* Title */}
      <div className="section-title">
        <span className="eyebrow">Pusat Verifikasi Event Kampus</span>
        <h2 style={{ color: '#fff' }}>Verifikasi Pengajuan Event</h2>
      </div>

      {/* Filter Tabs */}
      <div className="filter-section" style={{ marginBottom: '20px' }}>
        <div className="category-pills" style={{ marginTop: 0 }}>
          <button
            className={`cat-pill ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            📋 Semua Event ({events.length})
          </button>
          <button
            className={`cat-pill ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            ⏳ Menunggu Verifikasi ({events.filter(e => e.status === 'pending_verification').length})
          </button>
          <button
            className={`cat-pill ${filter === 'PUBLISHED' ? 'active' : ''}`}
            onClick={() => setFilter('PUBLISHED')}
          >
            ✅ Disetujui / Published ({events.filter(e => e.status === 'published').length})
          </button>
          <button
            className={`cat-pill ${filter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setFilter('REJECTED')}
          >
            ❌ Ditolak ({events.filter(e => e.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        <div className="toolbar">
          <h3 style={{ fontSize: '18px', margin: 0 }}>Daftar Pengajuan Event Resmi</h3>
          <span style={{ fontSize: '12.5px', color: '#8a7355', fontFamily: "'Space Mono', monospace" }}>
            Klik "Tinjau Detail" untuk melihat berkas &amp; informasi lengkap event.
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Penyelenggara</th>
                <th>Judul Event</th>
                <th>Tanggal &amp; Lokasi</th>
                <th>Narasumber</th>
                <th>Kuota</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Tidak ada pengajuan event dalam kategori ini.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700 }}>
                      {ev.org}
                    </td>
                    <td><strong>{ev.title}</strong></td>
                    <td style={{ fontSize: '12px' }}>
                      📅 {ev.date}<br />
                      📍 {ev.location}
                    </td>
                    <td style={{ fontSize: '12.5px' }}>🎤 {ev.speaker}</td>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>{ev.quota} Kursi</td>
                    <td>
                      <span className={`badge ${ev.status}`}>
                        {ev.status === 'published' ? '✅ Published' : ev.status === 'pending_verification' ? '⏳ Pending' : '❌ Rejected'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline dark btn-sm" onClick={() => setSelectedEvent(ev)}>
                          🔍 Tinjau
                        </button>
                        {ev.status === 'pending_verification' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(ev.id)}>
                              ✅ Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(ev.id)}>
                              ❌ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>✕</button>

            <div className="eyebrow" style={{ color: '#8a7355', marginBottom: '4px' }}>
              Tinjauan Pengajuan Event • {selectedEvent.org}
            </div>

            <div className="detail-wrap" style={{ marginTop: '12px' }}>
              <div className="detail-poster c-yellow">
                <span className="cat-badge">{selectedEvent.org}</span>
                <h2>{selectedEvent.title}</h2>
                <div style={{ fontWeight: 600, fontSize: '13px', margin: '8px 0', background: 'rgba(255,255,255,0.5)', padding: '6px 10px', borderRadius: '6px' }}>
                  🎤 Speaker: {selectedEvent.speaker}
                </div>
                <p className="desc">{selectedEvent.desc}</p>
                <div className="perks-box">
                  <h4>Benefit &amp; Fasilitas Event:</h4>
                  {selectedEvent.benefits?.map((b, i) => (
                    <div key={i} className="perk-item">{b}</div>
                  ))}
                </div>
              </div>

              <div className="ticket">
                <div>
                  <h4>Status Verifikasi</h4>
                  <div style={{ textAlign: 'center', margin: '14px 0' }}>
                    <span className={`badge ${selectedEvent.status}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
                      {selectedEvent.status === 'published' ? '✅ DISERTAI / PUBLISHED' : selectedEvent.status === 'pending_verification' ? '⏳ MENUNGGU VERIFIKASI' : '❌ DITOLAK'}
                    </span>
                  </div>

                  <div className="perforation" />

                  <h4 style={{ marginTop: '12px' }}>Detail Pelaksanaan</h4>
                  <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--ink)' }}>
                    🗓️ <strong>Tanggal:</strong> {selectedEvent.date}<br />
                    📍 <strong>Lokasi:</strong> {selectedEvent.location}<br />
                    🎟️ <strong>Kuota Total:</strong> {selectedEvent.quota} Peserta
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedEvent.status === 'pending_verification' && (
                    <>
                      <button className="btn btn-success" style={{ width: '100%' }} onClick={() => handleApprove(selectedEvent.id)}>
                        ✅ Setujui &amp; Publikasikan Event
                      </button>
                      <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => handleReject(selectedEvent.id)}>
                        ❌ Tolak Pengajuan Event
                      </button>
                    </>
                  )}
                  <button className="btn btn-outline dark" style={{ width: '100%' }} onClick={() => setSelectedEvent(null)}>
                    Tutup Tinjauan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerify;
