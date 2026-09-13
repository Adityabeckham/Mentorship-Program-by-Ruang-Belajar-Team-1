import React, { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';

const AdminVerify = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectingEventId, setRejectingEventId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        ['pending_verification', 'published', 'rejected'].map((status) =>
          eventService.getAdminEvents(status)
        )
      );
      const serverEvents = responses
        .flatMap((response) => response.data || [])
        .map((event) => ({
          ...event,
          org: event.users?.organization_name || event.users?.nama || 'Panitia Kampus',
          date: event.event_date
            ? new Date(event.event_date).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '-',
          desc: event.description || '',
          speaker: event.speaker || '-',
          location: event.location || '-',
          quota: event.quota || 0,
          rejectionReason: event.rejection_reason,
          benefits: event.benefits || [],
        }));
      setEvents(serverEvents);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Data pengajuan event gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    if (filter === 'ALL') return events;
    return events.filter((e) => e.status === filter);
  }, [events, filter]);

  const handleApprove = useCallback(
    async (id) => {
      setSubmitting(true);
      try {
        await eventService.verifyEvent(id, { status: 'published' });
        toast.success('Event berhasil disetujui & dipublikasikan!');
        if (selectedEvent && selectedEvent.id === id) {
          setSelectedEvent((prev) => ({ ...prev, status: 'published' }));
        }
        loadEvents();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menyetujui event.');
      } finally {
        setSubmitting(false);
      }
    },
    [selectedEvent, loadEvents]
  );

  const initiateReject = useCallback((id) => {
    setRejectingEventId(id);
    setRejectReason('');
  }, []);

  const submitReject = useCallback(async () => {
    if (!rejectReason.trim()) {
      toast.error('Alasan penolakan wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      await eventService.verifyEvent(rejectingEventId, {
        status: 'rejected',
        rejection_reason: rejectReason.trim(),
      });
      toast.error('Pengajuan event ditolak.');
      setRejectingEventId(null);
      setRejectReason('');
      if (selectedEvent && selectedEvent.id === rejectingEventId) {
        setSelectedEvent((prev) => ({
          ...prev,
          status: 'rejected',
          rejectionReason: rejectReason.trim(),
        }));
      }
      loadEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menolak event.');
    } finally {
      setSubmitting(false);
    }
  }, [rejectingEventId, rejectReason, selectedEvent, loadEvents]);

  return (
    <div className="page-fade">
      {/* Header */}
      <div className="section-title">
        <span className="eyebrow">Modul Verifikasi Admin</span>
        <h2 style={{ color: '#fff' }}>Verifikasi &amp; Persetujuan Event Kampus</h2>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="toolbar" style={{ borderBottom: '1px solid var(--paper-border)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${filter === 'ALL' ? 'btn-navy' : 'btn-outline dark'}`}
              onClick={() => setFilter('ALL')}
            >
              Semua Pengajuan ({events.length})
            </button>
            <button
              className={`btn btn-sm ${filter === 'pending_verification' ? 'btn-navy' : 'btn-outline dark'}`}
              onClick={() => setFilter('pending_verification')}
            >
              ⏳ Menunggu ({events.filter((e) => e.status === 'pending_verification').length})
            </button>
            <button
              className={`btn btn-sm ${filter === 'published' ? 'btn-navy' : 'btn-outline dark'}`}
              onClick={() => setFilter('published')}
            >
              ✅ Published ({events.filter((e) => e.status === 'published').length})
            </button>
            <button
              className={`btn btn-sm ${filter === 'rejected' ? 'btn-navy' : 'btn-outline dark'}`}
              onClick={() => setFilter('rejected')}
            >
              ❌ Ditolak ({events.filter((e) => e.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8a7355' }}>
            Memuat daftar verifikasi event...
          </div>
        ) : (
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
                  filteredEvents.map((ev) => (
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
                          {ev.status === 'published'
                            ? '✅ Published'
                            : ev.status === 'pending_verification'
                            ? '⏳ Pending'
                            : '❌ Rejected'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline dark btn-sm" onClick={() => setSelectedEvent(ev)}>
                            🔍 Tinjau
                          </button>
                          {ev.status === 'pending_verification' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleApprove(ev.id)} disabled={submitting}>
                                ✅ Approve
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => initiateReject(ev.id)} disabled={submitting}>
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
        )}
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
                {selectedEvent.benefits && selectedEvent.benefits.length > 0 && (
                  <div className="perks-box">
                    <h4>Benefit &amp; Fasilitas Event:</h4>
                    {selectedEvent.benefits.map((b, i) => (
                      <div key={i} className="perk-item">{b}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ticket">
                <div>
                  <h4>Status Verifikasi</h4>
                  <div style={{ textAlign: 'center', margin: '14px 0' }}>
                    <span className={`badge ${selectedEvent.status}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
                      {selectedEvent.status === 'published'
                        ? '✅ DISERTAI / PUBLISHED'
                        : selectedEvent.status === 'pending_verification'
                        ? '⏳ MENUNGGU VERIFIKASI'
                        : '❌ DITOLAK'}
                    </span>
                  </div>

                  {selectedEvent.status === 'rejected' && selectedEvent.rejectionReason && (
                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fdecea', border: '1px solid #c9bda2', borderRadius: '8px' }}>
                      <strong style={{ color: '#b5342a', display: 'block', marginBottom: '4px' }}>Alasan Penolakan:</strong>
                      <div style={{ color: '#87231c', fontSize: '14px' }}>{selectedEvent.rejectionReason}</div>
                    </div>
                  )}

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
                      <button className="btn btn-success" style={{ width: '100%' }} disabled={submitting} onClick={() => handleApprove(selectedEvent.id)}>
                        ✅ Setujui &amp; Publikasikan Event
                      </button>
                      <button className="btn btn-danger" style={{ width: '100%' }} disabled={submitting} onClick={() => initiateReject(selectedEvent.id)}>
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

      {/* Rejection Reason Modal */}
      {rejectingEventId && (
        <div className="modal-backdrop" onClick={() => setRejectingEventId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="modal-close" onClick={() => setRejectingEventId(null)}>✕</button>
            <h3 style={{ marginBottom: '12px' }}>Konfirmasi Penolakan</h3>
            <div className="field">
              <label>Alasan Penolakan</label>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Tulis alasan mengapa event ini ditolak..."
                required
              />
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline dark" onClick={() => setRejectingEventId(null)}>Batal</button>
              <button className="btn btn-danger" disabled={submitting || !rejectReason.trim()} onClick={submitReject}>Tolak Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerify;
