import React, { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import toast from 'react-hot-toast';

const INITIAL_EVENTS = [
  { id: 'p-1', title: 'Seminar Nasional: Generative AI & Career Transformation 2026', date: '20 Agt 2026, 09:00', status: 'published', peserta: 98, quota: 100, category: 'Technology', speaker: 'Budi Rahardjo' },
  { id: 'p-2', title: 'Hackathon Kampus 24 Jam: Build Smart Campus Apps', date: '01 Sep 2026, 08:00', status: 'rejected', peserta: 0, quota: 60, category: 'Technology', speaker: 'Senior Architect Gojek' },
  { id: 'p-3', title: 'Workshop Android App Development with Kotlin', date: '10 Sep 2026, 13:00', status: 'pending_verification', peserta: 0, quota: 50, category: 'Technology', speaker: 'Mobile Lead Engineer' },
];

const PanitiaDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [speaker, setSpeaker] = useState('');
  const [quota, setQuota] = useState('100');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');

  const stats = [
    { num: String(events.length), lbl: 'Total Event Dibuat', accent: 'navy' },
    { num: String(events.filter(e => e.status === 'pending_verification').length), lbl: 'Pending Verifikasi', accent: 'amber' },
    { num: String(events.filter(e => e.status === 'published').length), lbl: 'Event Published', accent: 'mint' },
    { num: String(events.filter(e => e.status === 'rejected').length), lbl: 'Event Ditolak', accent: 'coral' },
  ];

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!title || !speaker || !location || !date) {
      toast.error('Harap isi semua kolom formulir!');
      return;
    }

    const newEvent = {
      id: `p-${Date.now()}`,
      title,
      date: new Date(date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'pending_verification',
      peserta: 0,
      quota: parseInt(quota) || 100,
      category,
      speaker,
    };

    setEvents([newEvent, ...events]);
    toast.success('Draft event berhasil diajukan! Menunggu verifikasi dari Admin Platform.');
    setShowCreateModal(false);
    setTitle('');
    setSpeaker('');
    setLocation('');
    setDate('');
    setDesc('');
  };

  return (
    <div className="page-fade">
      {/* Title */}
      <div className="section-title">
        <span className="eyebrow">Statistik Organisasi • {user?.nama || 'Panitia'}</span>
        <h2 style={{ color: '#fff' }}>Dashboard Panitia Organisasi</h2>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.lbl} className={`stat-card ${s.accent}`}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Events Table Card */}
      <div className="card">
        <div className="toolbar">
          <div>
            <h3 style={{ fontSize: '19px', margin: 0 }}>Ringkasan Event Milik Organisasi Saya</h3>
            <p style={{ fontSize: '12.5px', color: '#8a7355', margin: '2px 0 0' }}>
              Seluruh pengajuan event yang telah atau sedang diproses oleh Admin Platform.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Buat Draft Event Baru
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Judul Event</th>
                <th>Kategori</th>
                <th>Tanggal Pelaksanaan</th>
                <th>Status Verifikasi Admin</th>
                <th>Peserta Terdaftar / Kuota</th>
                <th style={{ textAlign: 'right' }}>Aksi Panitia</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td><strong>{ev.title}</strong></td>
                  <td><span className="cat-badge" style={{ margin: 0 }}>{ev.category}</span></td>
                  <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11.5px' }}>{ev.date}</td>
                  <td>
                    <span className={`badge ${ev.status}`}>
                      {ev.status === 'published' ? '✅ Published' : ev.status === 'pending_verification' ? '⏳ Pending Review' : '❌ Rejected'}
                    </span>
                  </td>
                  <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '12.5px' }}>
                    {ev.peserta} / {ev.quota} Peserta
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline dark btn-sm"
                      onClick={() => toast.info(`Detail event '${ev.title}' dalam pratinjau panitia.`)}
                    >
                      👁️ Pratinjau
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>

            <div className="eyebrow" style={{ color: '#8a7355', marginBottom: '4px' }}>Pengajuan Event Baru</div>
            <h2>Formulir Draft Event Kampus</h2>
            <p style={{ fontSize: '13px', color: '#8a7355', marginTop: '-4px', marginBottom: '18px' }}>
              Event yang kamu ajukan akan diajukan ke Admin Platform untuk diverifikasi sebelum diterbitkan.
            </p>

            <form onSubmit={handleCreateEvent}>
              <div className="field">
                <label>Judul Event Resmi</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="mis. Seminar Nasional Generative AI 2026"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field">
                  <label>Kategori Event</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Technology">Technology &amp; AI</option>
                    <option value="Career">Career &amp; Business</option>
                    <option value="Health">Health &amp; Social</option>
                    <option value="Art">Art &amp; Culture</option>
                  </select>
                </div>
                <div className="field">
                  <label>Kuota Peserta</label>
                  <input
                    type="number"
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    placeholder="100"
                    min="10"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Nama Narasumber / Guest Speaker</label>
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="mis. Budi Rahardjo (AI Expert)"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field">
                  <label>Tanggal &amp; Waktu</label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Lokasi Acara</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="mis. Auditorium Utama"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Deskripsi Singkat Acara</label>
                <textarea
                  rows="3"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Jelaskan secara singkat tujuan dan materi acara..."
                />
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline dark" onClick={() => setShowCreateModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  🚀 Ajukan Event ke Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanitiaDashboard;
