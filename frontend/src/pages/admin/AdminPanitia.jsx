import React, { useState } from 'react';
import toast from 'react-hot-toast';

const INITIAL_PANITIA = [
  { id: 'p-1', name: 'BEM Fakultas Ilmu Komputer', type: 'BEM', email: 'bem.fasilkom@kampus.ac.id', pic: 'Aditya Beckham', totalEvents: 4, status: 'active' },
  { id: 'p-2', name: 'Himpunan Mahasiswa Kesehatan', type: 'Himpunan', email: 'hmk@kampus.ac.id', pic: 'Siti Rahmawati', totalEvents: 2, status: 'active' },
  { id: 'p-3', name: 'UKM Robotika Kampus', type: 'UKM', email: 'ukm.robotika@kampus.ac.id', pic: 'Fajar Nugraha', totalEvents: 3, status: 'active' },
  { id: 'p-4', name: 'UKM Seni & Seni Suara', type: 'UKM', email: 'ukm.seni@kampus.ac.id', pic: 'Maya Indah', totalEvents: 1, status: 'active' },
  { id: 'p-5', name: 'Himpunan Mahasiswa Elektro', type: 'Himpunan', email: 'hme@kampus.ac.id', pic: 'Rian Hidayat', totalEvents: 0, status: 'inactive' },
];

const AdminPanitia = () => {
  const [panitiaList, setPanitiaList] = useState(INITIAL_PANITIA);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new panitia
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('UKM');
  const [formEmail, setFormEmail] = useState('');
  const [formPic, setFormPic] = useState('');

  const filteredList = panitiaList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.pic.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setPanitiaList(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'inactive' : 'active';
        toast.success(`Akun ${p.name} kini ${nextStatus === 'active' ? 'AKTIF' : 'NONAKTIF'}`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleAddPanitia = (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPic) {
      toast.error('Semua kolom wajib diisi!');
      return;
    }
    const newEntry = {
      id: `p-${Date.now()}`,
      name: formName,
      type: formType,
      email: formEmail,
      pic: formPic,
      totalEvents: 0,
      status: 'active',
    };
    setPanitiaList([newEntry, ...panitiaList]);
    toast.success(`Akun panitia baru '${formName}' berhasil dibuat!`);
    setShowAddModal(false);
    setFormName('');
    setFormEmail('');
    setFormPic('');
  };

  return (
    <div className="page-fade">
      {/* Title */}
      <div className="section-title">
        <span className="eyebrow">Manajemen Akun Penyelenggara</span>
        <h2 style={{ color: '#fff' }}>Kelola Akun Panitia Organisasi</h2>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card purple">
          <div className="num">{panitiaList.length}</div>
          <div className="lbl">Total Akun Panitia</div>
        </div>
        <div className="stat-card mint">
          <div className="num">{panitiaList.filter(p => p.status === 'active').length}</div>
          <div className="lbl">Akun Aktif</div>
        </div>
        <div className="stat-card amber">
          <div className="num">{panitiaList.filter(p => p.status === 'inactive').length}</div>
          <div className="lbl">Akun Nonaktif</div>
        </div>
        <div className="stat-card navy">
          <div className="num">
            {panitiaList.reduce((acc, p) => acc + p.totalEvents, 0)}
          </div>
          <div className="lbl">Total Event Dibuat</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="toolbar">
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Cari nama organisasi, penanggung jawab, atau email panitia..."
              style={{ borderRadius: '30px', padding: '10px 18px' }}
            />
          </div>
          <button className="btn btn-navy" onClick={() => setShowAddModal(true)}>
            + Tambah Akun Panitia Baru
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama Organisasi Kampus</th>
                <th>Kategori</th>
                <th>Email Resmi</th>
                <th>Penanggung Jawab (PIC)</th>
                <th>Total Event</th>
                <th>Status Akun</th>
                <th style={{ textAlign: 'right' }}>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Tidak ada akun panitia yang cocok dengan kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>
                      <span className="cat-badge" style={{ margin: 0 }}>{p.type}</span>
                    </td>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>{p.email}</td>
                    <td style={{ fontSize: '13px' }}>👤 {p.pic}</td>
                    <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>{p.totalEvents} Event</td>
                    <td>
                      <span className={`badge ${p.status === 'active' ? 'active' : 'inactive'}`}>
                        {p.status === 'active' ? '🟢 Aktif' : '🔴 Nonaktif'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn btn-sm ${p.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleStatus(p.id)}
                      >
                        {p.status === 'active' ? 'Nonaktifkan' : 'Aktifkan Akun'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Panitia Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>

            <div className="eyebrow" style={{ color: '#8a7355', marginBottom: '4px' }}>Registrasi Akun Baru</div>
            <h2>Buat Akun Panitia Organisasi</h2>
            <p style={{ fontSize: '13px', color: '#8a7355', marginTop: '-4px', marginBottom: '18px' }}>
              Akun ini akan diberikan ke pengurus BEM, Himpunan, atau UKM resmi kampus untuk mengajukan event.
            </p>

            <form onSubmit={handleAddPanitia}>
              <div className="field">
                <label>Nama Organisasi Kampus</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="mis. UKM Paduan Suara Kampus"
                  required
                />
              </div>

              <div className="field">
                <label>Jenis Organisasi</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                  <option value="UKM">UKM (Unit Kegiatan Mahasiswa)</option>
                  <option value="Himpunan">Himpunan Mahasiswa Jurusan (HMJ)</option>
                  <option value="BEM">BEM (Badan Eksekutif Mahasiswa)</option>
                </select>
              </div>

              <div className="field">
                <label>Email Resmi Organisasi</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ukm.paduansuara@kampus.ac.id"
                  required
                />
              </div>

              <div className="field">
                <label>Nama Penanggung Jawab (PIC)</label>
                <input
                  type="text"
                  value={formPic}
                  onChange={(e) => setFormPic(e.target.value)}
                  placeholder="Budi Raharjo (Ketua Panitia)"
                  required
                />
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline dark" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-navy">
                  Simpan &amp; Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanitia;
