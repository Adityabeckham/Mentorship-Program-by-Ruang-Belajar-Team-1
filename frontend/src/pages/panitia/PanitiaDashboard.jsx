import React, { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import DOMPurify from 'dompurify';
import eventService from '../../services/eventService';

const eventSchema = yup.object().shape({
  title: yup.string().required('Judul event wajib diisi.'),
  category: yup.string().required('Kategori wajib diisi.'),
  speaker: yup.string().required('Narasumber wajib diisi.'),
  quota: yup.number().typeError('Kuota harus berupa angka.').min(1, 'Minimal kuota 1.').required('Kuota wajib diisi.'),
  location: yup.string().required('Lokasi wajib diisi.'),
  date: yup.date().typeError('Tanggal tidak valid.').required('Tanggal wajib diisi.'),
  time: yup.string().required('Waktu wajib diisi.'),
  desc: yup.string().required('Deskripsi singkat acara wajib diisi.'),
  bannerImage: yup.string().url('URL banner tidak valid.').nullable().transform((value) => value || null),
});

const formatEventDate = (eventDate) => {
  const parsed = new Date(eventDate);
  return Number.isNaN(parsed.getTime())
    ? '-'
    : parsed.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const normalizeEvent = (event) => ({
  ...event,
  date: formatEventDate(event.event_date),
  peserta: event.peserta || event.registered || 0,
  desc: event.description || '',
});

const PanitiaDashboard = () => {
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [speaker, setSpeaker] = useState('');
  const [quota, setQuota] = useState('100');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [desc, setDesc] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    eventService.getManagedEvents()
      .then((response) => {
        if (isMounted) setEvents((response.data || []).map(normalizeEvent));
      })
      .catch((error) => {
        if (isMounted) toast.error(error.response?.data?.message || 'Event gagal dimuat.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => [
    { num: String(events.length), lbl: 'Total Event Dibuat', accent: 'navy' },
    { num: String(events.filter(e => e.status === 'pending_verification').length), lbl: 'Pending Verifikasi', accent: 'amber' },
    { num: String(events.filter(e => e.status === 'published').length), lbl: 'Event Published', accent: 'mint' },
    { num: String(events.filter(e => e.status === 'rejected').length), lbl: 'Event Ditolak', accent: 'coral' },
  ], [events]);

  const resetForm = useCallback(() => {
    setTitle('');
    setCategory('Technology');
    setSpeaker('');
    setQuota('100');
    setLocation('');
    setDate('');
    setTime('');
    setDesc('');
    setBannerImage('');
    setFieldErrors({});
    setEditingEventId(null);
  }, []);

  const closeForm = useCallback(() => {
    setShowCreateModal(false);
    resetForm();
  }, [resetForm]);

  const openCreateModal = useCallback(() => {
    resetForm();
    setShowCreateModal(true);
  }, [resetForm]);

  const handleSubmitEvent = useCallback(async (e) => {
    e.preventDefault();
    setFieldErrors({});

    try {
      await eventSchema.validate(
        { title, category, speaker, quota, location, date, time, desc, bannerImage },
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

    const payload = {
      title: DOMPurify.sanitize(title),
      description: DOMPurify.sanitize(desc),
      location: DOMPurify.sanitize(location),
      event_date: new Date(`${date}T${time}:00`).toISOString(),
      quota: Number(quota),
      category,
      speaker: DOMPurify.sanitize(speaker),
      banner_image: DOMPurify.sanitize(bannerImage),
    };

    try {
      const response = editingEventId
        ? await eventService.updateEvent(editingEventId, payload)
        : await eventService.createEvent(payload);
      const savedEvent = response?.data || response;
      setEvents((previousEvents) => editingEventId
        ? previousEvents.map((event) => event.id === editingEventId ? normalizeEvent({ ...event, ...savedEvent }) : event)
        : [normalizeEvent({ ...savedEvent, peserta: 0, quota: Number(quota) }), ...previousEvents]);
      toast.success(editingEventId ? 'Event berhasil diperbarui.' : 'Draft event berhasil dibuat.');
      closeForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Event gagal disimpan. Coba lagi.');
    }
  }, [title, category, speaker, quota, location, date, time, desc, bannerImage, editingEventId, closeForm]);

  const handleEditEvent = useCallback((event) => {
    setEditingEventId(event.id);
    setTitle(event.title || '');
    setCategory(event.category || 'Technology');
    setSpeaker(event.speaker || '');
    setQuota(String(event.quota || 100));
    setLocation(event.location || '');
    setDesc(event.description || event.desc || '');
    setBannerImage(event.banner_image || '');
    const eventDate = new Date(event.event_date || event.date);
    if (!Number.isNaN(eventDate.getTime())) {
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setTime(eventDate.toTimeString().slice(0, 5));
    }
    setShowCreateModal(true);
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
          <button className="btn btn-primary" onClick={openCreateModal}>
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
                      <button className="btn btn-outline dark btn-sm" onClick={() => handleEditEvent(ev)}>
                        ✏️ Edit
                      </button>
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
        <div className="modal-backdrop" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <button className="modal-close" onClick={closeForm}>✕</button>

            <div className="eyebrow" style={{ color: '#8a7355', marginBottom: '4px' }}>
              {editingEventId ? 'Pengubahan Event' : 'Pembuatan Event Baru'}
            </div>
            <h2>{editingEventId ? 'Edit Detail Event Kampus' : 'Formulir Draft Event Kampus'}</h2>
            <p style={{ fontSize: '13px', color: '#8a7355', marginTop: '-4px', marginBottom: '18px' }}>
              Event yang kamu ajukan akan diajukan ke Admin Platform untuk diverifikasi sebelum diterbitkan.
            </p>

            <form onSubmit={handleSubmitEvent}>
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
                    <label htmlFor="event-date">Tanggal</label>
                  <input
                    id="event-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  {fieldErrors.date && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.date}</div>}
                </div>
                <div className="field">
                  <label htmlFor="event-time">Waktu</label>
                  <input
                    id="event-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                  {fieldErrors.time && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.time}</div>}
                </div>
              </div>

              <div className="field">
                <label htmlFor="event-location">Lokasi Acara</label>
                <input
                  id="event-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="mis. Auditorium Utama"
                  required
                />
                {fieldErrors.location && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.location}</div>}
              </div>

              <div className="field">
                <label htmlFor="event-banner">Banner Image URL</label>
                <input
                  id="event-banner"
                  type="url"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="https://contoh.com/banner-event.jpg"
                />
                {fieldErrors.bannerImage && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.bannerImage}</div>}
              </div>

              <div className="field">
                <label htmlFor="event-description">Deskripsi Singkat Acara</label>
                <textarea
                  id="event-description"
                  rows="3"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Jelaskan secara singkat tujuan dan materi acara..."
                  required
                />
                {fieldErrors.desc && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.desc}</div>}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline dark" onClick={closeForm}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEventId ? 'Simpan Perubahan' : 'Simpan Draft Event'}
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
