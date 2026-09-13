import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import dashboardService from '../../services/dashboardService';
import eventService from '../../services/eventService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_mahasiswa: 0,
    total_panitia: 0,
    total_events: 0,
    events_by_status: {
      draft: 0,
      pending_verification: 0,
      published: 0,
      rejected: 0,
    },
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.allSettled([
        dashboardService.getAdminStats(),
        eventService.getAdminEvents(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
        const mapped = (eventsRes.value.data || []).map((ev) => ({
          ...ev,
          org: ev.users?.organization_name || ev.users?.nama || 'Panitia Kampus',
          date: ev.event_date
            ? new Date(ev.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-',
          category: ev.category || 'General',
        }));
        setEvents(mapped);
      }
    } catch (error) {
      toast.error('Gagal memuat data statistik admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const activeCount = useMemo(
    () => stats.events_by_status?.published || 0,
    [stats.events_by_status]
  );
  const pendingCount = useMemo(
    () => stats.events_by_status?.pending_verification || 0,
    [stats.events_by_status]
  );

  const summaryCards = useMemo(
    () => [
      {
        id: 'mahasiswa',
        num: String(stats.total_mahasiswa || 0),
        lbl: 'Total Mahasiswa',
        sub: 'Terdaftar Aktif',
        accent: 'mint',
        icon: '🎓',
      },
      {
        id: 'panitia',
        num: String(stats.total_panitia || 0),
        lbl: 'Total Panitia',
        sub: 'BEM, Himpunan & UKM',
        accent: 'purple',
        icon: '👥',
      },
      {
        id: 'active',
        num: String(activeCount),
        lbl: 'Event Active',
        sub: 'Published di Papan Event',
        accent: 'navy',
        icon: '🌟',
      },
      {
        id: 'pending',
        num: String(pendingCount),
        lbl: 'Pending Approval',
        sub: 'Perlu Verifikasi Admin',
        accent: 'amber',
        icon: '⏳',
      },
    ],
    [stats.total_mahasiswa, stats.total_panitia, activeCount, pendingCount]
  );

  const handleApprove = useCallback(
    async (id) => {
      try {
        await eventService.verifyEvent(id, { status: 'published' });
        toast.success('Event berhasil disetujui & dipublikasikan!');
        loadDashboardData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal menyetujui event.');
      }
    },
    [loadDashboardData]
  );

  const handleReject = useCallback(
    async (id) => {
      try {
        await eventService.verifyEvent(id, { status: 'rejected', rejection_reason: 'Ditolak oleh Admin' });
        toast.error('Event telah ditolak.');
        loadDashboardData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal menolak event.');
      }
    },
    [loadDashboardData]
  );

  return (
    <div className="page-fade">
      {/* Header Title */}
      <div className="section-title">
        <span className="eyebrow">Statistik Global Platform</span>
        <h2 style={{ color: '#fff' }}>Dashboard Admin Platform</h2>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid">
        {summaryCards.map((s) => (
          <div key={s.id} className={`stat-card ${s.accent}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="num">{s.num}</div>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
            </div>
            <div className="lbl">{s.lbl}</div>
            <div style={{ fontSize: '11px', color: '#8a7355', marginTop: '4px', fontFamily: "'Space Mono', monospace" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow" style={{ color: '#8a7355' }}>Fitur Utama Admin</div>
            <h3 style={{ fontSize: '20px', margin: '4px 0 8px' }}>🔍 Modul Verifikasi Event</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
              Tinjau dokumen pengajuan, narasumber, dan kuota dari panitia sebelum ditayangkan resmi.
            </p>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge pending_verification">
              {pendingCount} Event Menunggu
            </span>
            <button className="btn btn-navy btn-sm" onClick={() => navigate('/admin/verify')}>
              Buka Verifikasi →
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow" style={{ color: '#8a7355' }}>Manajemen Pengguna</div>
            <h3 style={{ fontSize: '20px', margin: '4px 0 8px' }}>👥 Modul Kelola Panitia</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
              Kelola status aktivasi akun BEM, Himpunan Mahasiswa, &amp; UKM penyelenggara event kampus.
            </p>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge active">
              {stats.total_panitia || 0} Panitia Terdaftar
            </span>
            <button className="btn btn-outline dark btn-sm" onClick={() => navigate('/admin/panitia')}>
              Kelola Panitia →
            </button>
          </div>
        </div>
      </div>

      {/* Activity Summary Table */}
      <div className="card">
        <div className="toolbar">
          <div>
            <h3 style={{ fontSize: '19px', margin: 0 }}>📋 Ringkasan Aktivitas Pengajuan Event Terbaru</h3>
            <p style={{ fontSize: '12.5px', color: '#8a7355', margin: '2px 0 0' }}>
              Daftar pengajuan event terkini dari seluruh organisasi kampus
            </p>
          </div>
          <Link to="/admin/verify" className="btn btn-navy btn-sm">
            Lihat Semua Event Verifikasi
          </Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Organisasi Penyelenggara</th>
                <th>Judul Event</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Status Review</th>
                <th style={{ textAlign: 'right' }}>Aksi Cepat</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Memuat data event...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Belum ada pengajuan event di database.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700 }}>
                      {ev.org}
                    </td>
                    <td><strong>{ev.title}</strong></td>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{ev.date}</td>
                    <td>
                      <span className="cat-badge" style={{ margin: 0 }}>{ev.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${ev.status}`}>
                        {ev.status === 'published' ? '✅ Approved' : ev.status === 'pending_verification' ? '⏳ Pending' : '❌ Rejected'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {ev.status === 'pending_verification' ? (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleApprove(ev.id)}>
                            ✅ Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(ev.id)}>
                            ❌ Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#8a7355', fontFamily: "'Space Mono', monospace" }}>
                          Selesai Ditinjau
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
