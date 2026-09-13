import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import DOMPurify from 'dompurify';
import eventService from '../../services/eventService';
import attendanceService from '../../services/attendanceService';

const eventSchema = yup.object().shape({
  title: yup.string().required('Judul event wajib diisi.'),
  category: yup.string().required('Kategori wajib diisi.'),
  speaker: yup.string().required('Narasumber wajib diisi.'),
  quota: yup
    .number()
    .typeError('Kuota harus berupa angka.')
    .min(1, 'Minimal kuota 1.')
    .required('Kuota wajib diisi.'),
  location: yup.string().required('Lokasi wajib diisi.'),
  date: yup.date().typeError('Tanggal tidak valid.').required('Tanggal wajib diisi.'),
  time: yup.string().required('Waktu wajib diisi.'),
  desc: yup.string().required('Deskripsi singkat acara wajib diisi.'),
});

const formatEventDate = (eventDate) => {
  const parsed = new Date(eventDate);
  return Number.isNaN(parsed.getTime())
    ? '-'
    : parsed.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

const normalizeEvent = (event) => ({
  ...event,
  date: formatEventDate(event.event_date),
  peserta: event.peserta || event.registered || 0,
  desc: event.description || '',
});

const PanitiaDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittingForm, setSubmittingForm] = useState(false);

  // Attendance & Participants States
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [updatingAttendanceId, setUpdatingAttendanceId] = useState(null);
  const participantRequestRef = useRef(0);

  const fetchManagedEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const response = await eventService.getManagedEvents();
      setEvents((response.data || []).map(normalizeEvent));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Event gagal dimuat.');
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchManagedEvents();
  }, [fetchManagedEvents]);

  const stats = useMemo(
    () => [
      { num: String(events.length), lbl: 'Total Event Dibuat', accent: 'navy' },
      {
        num: String(events.filter((e) => e.status === 'draft').length),
        lbl: 'Draft (Belum Diajukan)',
        accent: 'purple',
      },
      {
        num: String(events.filter((e) => e.status === 'pending_verification').length),
        lbl: 'Pending Verifikasi',
        accent: 'amber',
      },
      {
        num: String(events.filter((e) => e.status === 'published').length),
        lbl: 'Event Published',
        accent: 'mint',
      },
      {
        num: String(events.filter((e) => e.status === 'rejected').length),
        lbl: 'Event Ditolak',
        accent: 'coral',
      },
    ],
    [events]
  );

  const resetForm = useCallback(() => {
    setTitle('');
    setCategory('Technology');
    setSpeaker('');
    setQuota('100');
    setLocation('');
    setDate('');
    setTime('');
    setDesc('');
    setFieldErrors({});
    setEditingEventId(null);
  }, []);

  const closeForm = useCallback(() => {
    resetForm();
    setShowCreateModal(false);
  }, [resetForm]);

  const handleSubmitEvent = useCallback(
    async (e) => {
      e.preventDefault();
      setFieldErrors({});

      try {
        await eventSchema.validate(
          { title, category, speaker, quota, location, date, time, desc },
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
      };

      setSubmittingForm(true);
      try {
        if (editingEventId) {
          await eventService.updateEvent(editingEventId, payload);
          toast.success('Event berhasil diperbarui.');
        } else {
          await eventService.createEvent(payload);
          toast.success('Draft event berhasil dibuat! Klik "Ajukan Verifikasi" agar ditinjau Admin.');
        }
        closeForm();
        fetchManagedEvents();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Event gagal disimpan. Coba lagi.');
      } finally {
        setSubmittingForm(false);
      }
    },
    [title, category, speaker, quota, location, date, time, desc, editingEventId, closeForm, fetchManagedEvents]
  );

  const handleSubmitForVerification = useCallback(
    async (id, eventTitle) => {
      if (!window.confirm(`Apakah Anda yakin ingin mengajukan event '${eventTitle}' ke Admin Platform untuk diverifikasi?`)) {
        return;
      }
      try {
        await eventService.submitEventForVerification(id);
        toast.success(`Event '${eventTitle}' berhasil diajukan untuk verifikasi Admin!`);
        fetchManagedEvents();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal mengajukan verifikasi event.');
      }
    },
    [fetchManagedEvents]
  );

  const handleDeleteEvent = useCallback(
    async (id, eventTitle) => {
      if (!window.confirm(`Apakah Anda yakin ingin menghapus event '${eventTitle}'?`)) return;
      try {
        await eventService.deleteEvent(id);
        toast.success(`Event '${eventTitle}' berhasil dihapus.`);
        fetchManagedEvents();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal menghapus event.');
      }
    },
    [fetchManagedEvents]
  );

  const handleEditEvent = useCallback((event) => {
    setEditingEventId(event.id);
    setTitle(event.title || '');
    setCategory(event.category || 'Technology');
    setSpeaker(event.speaker || '');
    setQuota(String(event.quota || 100));
    setLocation(event.location || '');
    setDesc(event.description || event.desc || '');
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

  const handleViewParticipants = useCallback(async (eventId) => {
    const requestId = participantRequestRef.current + 1;
    participantRequestRef.current = requestId;
    setSelectedEventId(eventId);
    setParticipants([]);
    setLoadingParticipants(true);
    try {
      const response = await eventService.getEventParticipants(eventId);
      if (participantRequestRef.current === requestId) setParticipants(response.data || []);
    } catch (error) {
      if (participantRequestRef.current === requestId) {
        toast.error(error.response?.data?.message || 'Peserta gagal dimuat.');
        setParticipants([]);
      }
    } finally {
      if (participantRequestRef.current === requestId) setLoadingParticipants(false);
    }
  }, []);

  const handleAttendanceToggle = useCallback(async (participant) => {
    const isPresent = !participant.is_present;
    setUpdatingAttendanceId(participant.registration_id);
    try {
      const response = await attendanceService.markAttendance(participant.registration_id, isPresent);
      setParticipants((current) =>
        current.map((item) =>
          item.registration_id === participant.registration_id
            ? { ...item, is_present: response.data.is_present }
            : item
        )
      );
      toast.success(isPresent ? 'Peserta ditandai hadir.' : 'Status kehadiran dibatalkan.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status kehadiran gagal diperbarui.');
    } finally {
      setUpdatingAttendanceId(null);
    }
  }, []);

  const visibleParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const isPresent = participant.is_present === true;
      if (attendanceFilter === 'present') return isPresent;
      if (attendanceFilter === 'absent') return !isPresent;
      return true;
    });
  }, [participants, attendanceFilter]);

  const selectedEvent = useMemo(
    () => events.find((item) => item.id === selectedEventId),
    [events, selectedEventId]
  );

  return (
    <div className="page-fade">
      {/* Title */}
      <div className="section-title">
        <span className="eyebrow">Dashboard Organisasi Kampus</span>
        <h2 style={{ color: '#fff' }}>Manajemen Event &amp; Pengajuan Verifikasi</h2>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
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
            <h3 style={{ fontSize: '19px', margin: 0 }}>Kelola Event Organisasi Saya</h3>
            <p style={{ fontSize: '12.5px', color: '#8a7355', margin: '2px 0 0' }}>
              Buat draft event, ajukan ke Admin Kampus, dan pantau status persetujuan.
            </p>
          </div>
          <button
            className="btn btn-navy"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            + Buat Event Baru
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
                <th>Peserta / Kuota</th>
                <th style={{ textAlign: 'right' }}>Aksi Panitia</th>
              </tr>
            </thead>
            <tbody>
              {loadingEvents ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Memuat daftar event milik panitia...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Anda belum membuat event apapun. Klik tombol "+ Buat Event Baru" di atas.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <strong>{ev.title}</strong>
                      {ev.status === 'rejected' && ev.rejection_reason && (
                        <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>
                          ⚠️ <strong>Alasan Penolakan:</strong> {ev.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="cat-badge" style={{ margin: 0 }}>{ev.category}</span>
                    </td>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11.5px' }}>{ev.date}</td>
                    <td>
                      <span className={`badge ${ev.status}`}>
                        {ev.status === 'published'
                          ? '✅ Published'
                          : ev.status === 'pending_verification'
                          ? '⏳ Menunggu Review'
                          : ev.status === 'draft'
                          ? '📝 Draft'
                          : '❌ Ditolak'}
                      </span>
                    </td>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '12.5px' }}>
                      {ev.peserta} / {ev.quota} Peserta
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {(ev.status === 'draft' || ev.status === 'rejected') && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSubmitForVerification(ev.id, ev.title)}
                            title="Ajukan event ini ke Admin Platform untuk diverifikasi"
                          >
                            🚀 Ajukan Verifikasi
                          </button>
                        )}
                        {ev.status === 'published' && (
                          <button
                            className="btn btn-navy btn-sm"
                            onClick={() => handleViewParticipants(ev.id)}
                          >
                            👥 Absensi
                          </button>
                        )}
                        <button
                          className="btn btn-outline dark btn-sm"
                          onClick={() => handleEditEvent(ev)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participants Attendance Card */}
      {selectedEventId && (
        <div className="card attendance-card">
          <div className="toolbar">
            <div>
              <span className="eyebrow" style={{ color: '#8a7355' }}>Daftar Kehadiran Peserta</span>
              <h3>{selectedEvent?.title || 'Peserta Event'}</h3>
              <p style={{ fontSize: '12.5px', color: '#8a7355', margin: 0 }}>
                Tandai presensi mahasiswa yang hadir di lokasi event.
              </p>
            </div>
            <label className="attendance-filter">
              <span>Filter status: </span>
              <select value={attendanceFilter} onChange={(e) => setAttendanceFilter(e.target.value)}>
                <option value="all">Semua peserta</option>
                <option value="present">Hadir</option>
                <option value="absent">Belum Hadir</option>
              </select>
            </label>
          </div>

          {loadingParticipants ? (
            <p style={{ padding: '20px', color: '#8a7355' }}>Memuat daftar peserta...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nama Mahasiswa</th>
                    <th>Email Kampus</th>
                    <th>Status Presensi</th>
                    <th style={{ textAlign: 'right' }}>Aksi Presensi</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleParticipants.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#8a7355' }}>
                        Belum ada peserta terdaftar pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    visibleParticipants.map((participant) => {
                      const isPresent = participant.is_present === true;
                      return (
                        <tr key={participant.registration_id}>
                          <td><strong>{participant.student_name || '-'}</strong></td>
                          <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>
                            {participant.student_email || '-'}
                          </td>
                          <td>
                            <span className={`badge ${isPresent ? 'active' : 'pending_verification'}`}>
                              {isPresent ? '🟢 Hadir' : '⏳ Belum Hadir'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className={`btn btn-sm ${isPresent ? 'btn-outline dark' : 'btn-success'}`}
                              onClick={() => handleAttendanceToggle(participant)}
                              disabled={updatingAttendanceId === participant.registration_id}
                            >
                              {updatingAttendanceId === participant.registration_id
                                ? 'Menyimpan...'
                                : isPresent
                                ? 'Batalkan'
                                : 'Tandai Hadir'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <button className="modal-close" onClick={closeForm}>✕</button>

            <div className="eyebrow" style={{ color: '#8a7355', marginBottom: '4px' }}>
              {editingEventId ? 'Edit Event Organisasi' : 'Formulir Pengajuan Event Kampus'}
            </div>
            <h2>{editingEventId ? 'Perbarui Data Event' : 'Buat Event Baru (Draft)'}</h2>
            <p style={{ fontSize: '13px', color: '#8a7355', marginTop: '-4px', marginBottom: '18px' }}>
              Setelah disimpan sebagai draft, jangan lupa klik tombol <strong>"🚀 Ajukan Verifikasi"</strong> agar event ditinjau oleh Admin Kampus.
            </p>

            <form onSubmit={handleSubmitEvent}>
              <div className="field">
                <label htmlFor="event-title">Judul Event Resmi</label>
                <input
                  id="event-title"
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
                  <label htmlFor="event-category">Kategori Event</label>
                  <select
                    id="event-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Technology">Technology &amp; AI</option>
                    <option value="Career">Business &amp; Career</option>
                    <option value="Health">Health &amp; Social</option>
                    <option value="Art">Art &amp; Culture</option>
                  </select>
                  {fieldErrors.category && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.category}</div>}
                </div>

                <div className="field">
                  <label htmlFor="event-speaker">Narasumber / Keynote Speaker</label>
                  <input
                    id="event-speaker"
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="mis. Dr. Ir. Budi Rahardjo"
                    required
                  />
                  {fieldErrors.speaker && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.speaker}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="field">
                  <label htmlFor="event-quota">Kuota Peserta</label>
                  <input
                    id="event-quota"
                    type="number"
                    min="1"
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    required
                  />
                  {fieldErrors.quota && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.quota}</div>}
                </div>

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
                  <label htmlFor="event-time">Waktu Sesi</label>
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
                  placeholder="mis. Auditorium Utama &amp; Zoom Hybrid"
                  required
                />
                {fieldErrors.location && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.location}</div>}
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
                <button type="submit" className="btn btn-navy" disabled={submittingForm}>
                  {submittingForm ? 'Menyimpan...' : editingEventId ? 'Simpan Perubahan' : 'Simpan Draft Event'}
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
