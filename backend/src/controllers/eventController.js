const supabase = require('../config/supabase');

// 1. GET /events/managed (Untuk Panitia & Admin)
exports.getManagedEvents = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    let query = supabase
      .from('events')
      .select('id, title, description, location, event_date, quota, status, created_by, created_at')
      .order('created_at', { ascending: false });

    // Jika Panitia, filter hanya event miliknya.
    // Jika Admin, ambil seluruh event dari semua panitia.
    if (role === 'panitia') {
      query = query.eq('created_by', userId);
    }

    const { data: events, error } = await query;
    if (error) throw error;

    res.status(200).json({
      status: 'success',
      total: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

// 2. PATCH /events/:id/status (Khusus Admin untuk persetujuan/perubahan status)
exports.updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi enum status sesuai skema DB: draft, published, completed, canceled
    const validStatuses = ['draft', 'published', 'completed', 'canceled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Gunakan salah satu dari: ${validStatuses.join(', ')}`,
      });
    }

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', id)
      .select('id, title, status, updated_at')
      .single();

    if (error || !updatedEvent) {
      return res.status(404).json({ message: 'Event tidak ditemukan.' });
    }

    res.status(200).json({
      status: 'success',
      message: `Status event berhasil diperbarui menjadi ${status}.`,
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};

// 3. GET /events (Daftar Event Publik berstatus 'published' dengan Pagination & Filtering)
exports.getPublicEvents = async (req, res, next) => {
  try {
    // Ambil query parameter
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';

    // Hitung offset pagination
    const offset = (page - 1) * limit;

    // Inisialisasi query Supabase: HANYA event berstatus 'published'
    let query = supabase
      .from('events')
      .select('id, title, description, location, event_date, quota, status, created_at', { count: 'exact' })
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    // Filter pencarian berdasarkan judul/lokasi jika diberikan
    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Filter kategori jika diberikan
    if (category) {
      query = query.eq('category', category);
    }

    // Terapkan Range/Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: events, count, error } = await query;
    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / limit);

    res.status(200).json({
      status: 'success',
      pagination: {
        total_data: count || 0,
        total_pages: totalPages,
        current_page: page,
        limit,
      },
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

// 4. GET /events/:id (Detail Event Publik)
exports.getPublicEventDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ambil event berdasarkan ID, PASTIKAN statusnya 'published'
    const { data: event, error } = await supabase
      .from('events')
      .select('id, title, description, location, event_date, quota, status, created_at')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    // Jika event tidak ditemukan atau statusnya BUKAN published 
    if (error || !event) {
      return next(new AppError('Event tidak ditemukan atau belum dipublikasikan.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: event,
    });
  } catch (err) {
    next(err);
  }
};