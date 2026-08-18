import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import DOMPurify from 'dompurify';
import StatusBadge from '../../components/ui/StatusBadge';

const eventSchema = yup.object().shape({
  title: yup.string().required('Judul event wajib diisi.'),
  category: yup.string().required('Kategori wajib diisi.'),
  speaker: yup.string().required('Narasumber wajib diisi.'),
  quota: yup.number().typeError('Kuota harus berupa angka.').min(1, 'Minimal kuota 1.').required('Kuota wajib diisi.'),
  location: yup.string().required('Lokasi wajib diisi.'),
  date: yup.date().typeError('Tanggal tidak valid.').required('Tanggal wajib diisi.'),
  desc: yup.string().required('Deskripsi singkat acara wajib diisi.'),
});

const INITIAL_EVENTS = [
  { id: 'p-1', title: 'Seminar Nasional: Generative AI & Career Transformation 2026', date: '20 Agt 2026, 09:00', status: 'published', peserta: 98, quota: 100, category: 'Technology', speaker: 'Budi Rahardjo' },
  { id: 'p-2', title: 'Robotics Bootcamp & Battle Bot Tournament 2026', date: '22 Agt 2026, 09:00', status: 'pending_verification', peserta: 0, quota: 80, category: 'Technology', speaker: 'Dr. Eng. Ir. Hendra' },
  { id: 'p-3', title: 'Hackathon Kampus 24 Jam: Build Smart Campus Apps', date: '01 Sep 2026, 08:00', status: 'rejected', peserta: 0, quota: 60, category: 'Technology', speaker: 'Senior Architect Gojek' },
];

const PanitiaDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [speaker, setSpeaker] = useState('');
  const [quota, setQuota] = useState('100');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const stats = useMemo(() => [
    { num: String(events.length), lbl: 'Total Event Dibuat', accent: 'navy' },
    { num: String(events.filter(e => e.status === 'pending_verification').length), lbl: 'Pending Verifikasi', accent: 'amber' },
    { num: String(events.filter(e => e.status === 'published').length), lbl: 'Event Published', accent: 'mint' },
    { num: String(events.filter(e => e.status === 'rejected').length), lbl: 'Event Ditolak', accent: 'coral' },
  ], [events]);

  const handleCreateEvent = useCallback(async (e) => {
    e.preventDefault();
    setFieldErrors({});

    try {
      await eventSchema.validate(
        { title, category, speaker, quota, location, date, desc },
        { abortEarly: false }
      );
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
        toast.error('Periksa kembali isian formulir Anda.');
        return;
      }
    }

    const newEvent = {
      id: `p-${Date.now()}`,
      title: DOMPurify.sanitize(title),
      date: new Date(date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'pending_verification',
      peserta: 0,
      quota: parseInt(quota) || 100,
      category,
      speaker: DOMPurify.sanitize(speaker),
      desc: DOMPurify.sanitize(desc),
    };

    setEvents(prev => [newEvent, ...prev]);
    toast.success('Draft event berhasil diajukan! Menunggu verifikasi dari Admin Platform.');
    setShowCreateModal(false);
    setTitle('');
    setSpeaker('');
    setLocation('');
    setDate('');
    setDesc('');
  }, [title, category, speaker, quota, location, date, desc]);

  const handleEditClick = useCallback((ev) => {
    setEditingEventId(ev.id);
    setTitle(ev.title);
    setCategory(ev.category);
    setSpeaker(ev.speaker);
    setQuota(String(ev.quota || 100));
    setLocation(ev.location || '');
    // convert ev.date back to input-friendly format when possible
    try {
      const parsed = new Date(ev.date);
      const iso = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000).toISOString().slice(0,16);
      setDate(iso);
    } catch (err) {
      setDate('');
    }
    setDesc(ev.desc || '');
    setShowEditModal(true);
  }, []);

  const handleUpdateEvent = useCallback(async (e) => {
    e.preventDefault();
    setFieldErrors({});

    try {
      await eventSchema.validate(
        { title, category, speaker, quota, location, date, desc },
        { abortEarly: false }
      );
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
        toast.error('Periksa kembali isian formulir Anda.');
        return;
      }
    }

    setEvents(prev => prev.map(ev => {
      if (ev.id !== editingEventId) return ev;
      return {
        ...ev,
        title: DOMPurify.sanitize(title),
        category,
        speaker: DOMPurify.sanitize(speaker),
        quota: parseInt(quota) || ev.quota,
        location: DOMPurify.sanitize(location),
        date: new Date(date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        desc: DOMPurify.sanitize(desc),
      };
    }));

    toast.success('Perubahan event berhasil disimpan.');
    setShowEditModal(false);
    setEditingEventId(null);
    setTitle(''); setSpeaker(''); setLocation(''); setDate(''); setDesc('');
  }, [title, category, speaker, quota, location, date, desc, editingEventId]);

  const handleSubmitVerification = useCallback((id) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'pending_verification' } : ev));
    toast.success('Event diajukan untuk verifikasi ke Admin.');
  }, []);

  const handleDeleteEvent = useCallback((id) => {
    const ok = window.confirm('Yakin ingin menghapus event ini? Tindakan tidak bisa dibatalkan.');
    if (!ok) return;
    setEvents(prev => prev.filter(ev => ev.id !== id));
    toast.success('Event berhasil dihapus.');
  }, []);

  return (
    <div className="page-fade">
      {/* Title Header */}
      <div className="section-title">
        <span className="eyebrow">Dashboard Panitia Penyelenggara</span>
        <h2 style={{ color: '#fff' }}>Kelola Event Organisasi Saya</h2>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.accent}`}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    <StatusBadge status={ev.status} />
                  </td>
                  <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '12.5px' }}>
                    {ev.peserta} / {ev.quota} Peserta
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-outline dark btn-sm"
                        onClick={() => toast.info(`Detail event '${ev.title}' dalam pratinjau panitia.`)}
                      >
                        👁️ Pratinjau
                      </button>

                      <button
                        className="btn btn-outline dark btn-sm"
                        onClick={() => handleEditClick(ev)}
                      >
                        ✏️ Edit
                      </button>

                      {ev.status !== 'pending_verification' && ev.status !== 'published' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSubmitVerification(ev.id)}
                        >
                          📤 Ajukan Verifikasi
                        </button>
                      )}

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteEvent(ev.id)}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
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
                {fieldErrors.title && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.title}</div>}
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
                  {fieldErrors.quota && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.quota}</div>}
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
                {fieldErrors.speaker && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.speaker}</div>}
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
                  {fieldErrors.date && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.date}</div>}
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
                  {fieldErrors.location && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.location}</div>}
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
                {fieldErrors.desc && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.desc}</div>}
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

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>

            <div className="eyebrow" style={{ color: '#8a7355', marginBottom: '4px' }}>Edit Draft Event</div>
            <h2>Ubah Detail Event</h2>
            <p style={{ fontSize: '13px', color: '#8a7355', marginTop: '-4px', marginBottom: '18px' }}>
              Sunting informasi event sebelum diajukan ke Admin atau dipublikasikan.
            </p>

            <form onSubmit={handleUpdateEvent}>
              <div className="field">
                <label>Judul Event Resmi</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="mis. Seminar Nasional Generative AI 2026"
                  required
                />
                {fieldErrors.title && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.title}</div>}
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
                  {fieldErrors.quota && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.quota}</div>}
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
                {fieldErrors.speaker && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.speaker}</div>}
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
                  {fieldErrors.date && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.date}</div>}
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
                  {fieldErrors.location && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.location}</div>}
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
                {fieldErrors.desc && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.desc}</div>}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline dark" onClick={() => setShowEditModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Perubahan
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
