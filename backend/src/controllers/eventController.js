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