import React, { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import DOMPurify from 'dompurify';
import userService from '../../services/userService';

const panitiaSchema = yup.object().shape({
  formName: yup.string().required('Nama organisasi panitia wajib diisi.'),
  formEmail: yup
    .string()
    .email('Format email tidak valid.')
    .required('Email resmi organisasi wajib diisi.'),
  formPassword: yup
    .string()
    .min(6, 'Password minimal 6 karakter.')
    .required('Password wajib diisi.'),
  formPic: yup.string().required('Nama penanggung jawab (PIC) wajib diisi.'),
});

const AdminPanitia = () => {
  const [panitiaList, setPanitiaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('UKM');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('Panitia123!');
  const [formPic, setFormPic] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchPanitiaList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getPanitiaList();
      const list = (res.data || []).map((p) => ({
        id: p.id,
        name: p.organization_name || p.nama,
        type: p.organization_name ? (p.organization_name.includes('BEM') ? 'BEM' : p.organization_name.includes('Himpunan') ? 'Himpunan' : 'UKM') : 'UKM',
        email: p.email,
        pic: p.nama,
        totalEvents: 0,
        status: 'active',
      }));
      setPanitiaList(list);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengambil daftar panitia.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPanitiaList();
  }, [fetchPanitiaList]);

  const filteredList = useMemo(() => {
    return panitiaList.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.pic.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [panitiaList, search]);

  const handleDeletePanitia = useCallback(async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun panitia '${name}'?`)) return;
    try {
      await userService.deletePanitia(id);
      toast.success(`Akun panitia '${name}' berhasil dihapus dari database.`);
      fetchPanitiaList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus akun panitia.');
    }
  }, [fetchPanitiaList]);

  const handleAddPanitia = useCallback(
    async (e) => {
      e.preventDefault();
      setFieldErrors({});

      try {
        await panitiaSchema.validate(
          { formName, formEmail, formPassword, formPic },
          { abortEarly: false }
        );
      } catch (err) {
        if (err.inner) {
          const errors = {};
          err.inner.forEach((e) => {
            errors[e.path] = e.message;
          });
          setFieldErrors(errors);
          toast.error('Periksa kembali isian formulir Anda.');
          return;
        }
      }

      setSubmitting(true);
      try {
        await userService.createPanitia({
          nama: DOMPurify.sanitize(formPic),
          email: formEmail.trim().toLowerCase(),
          password: formPassword,
          organization_name: DOMPurify.sanitize(formName),
        });

        toast.success(`Akun panitia baru '${formName}' berhasil dibuat!`);
        setShowAddModal(false);
        setFormName('');
        setFormEmail('');
        setFormPic('');
        setFormPassword('Panitia123!');
        fetchPanitiaList();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Gagal membuat akun panitia baru.');
      } finally {
        setSubmitting(false);
      }
    },
    [formName, formEmail, formPassword, formPic, fetchPanitiaList]
  );

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
          <div className="num">{panitiaList.filter((p) => p.status === 'active').length}</div>
          <div className="lbl">Akun Aktif</div>
        </div>
        <div className="stat-card amber">
          <div className="num">{panitiaList.filter((p) => p.status === 'inactive').length}</div>
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
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Memuat daftar panitia...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#8a7355' }}>
                    Belum ada akun panitia terdaftar di database.
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
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeletePanitia(p.id, p.name)}
                      >
                        Hapus Akun
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
                {fieldErrors.formName && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.formName}</div>}
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
                {fieldErrors.formEmail && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.formEmail}</div>}
              </div>

              <div className="field">
                <label>Password Akun</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                />
                {fieldErrors.formPassword && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.formPassword}</div>}
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
                {fieldErrors.formPic && <div style={{ color: '#b5342a', fontSize: '12px', marginTop: '4px' }}>❌ {fieldErrors.formPic}</div>}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline dark" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-navy" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan & Buat Akun'}
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
