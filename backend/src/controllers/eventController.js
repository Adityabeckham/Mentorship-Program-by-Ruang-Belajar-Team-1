const supabase = require('../config/supabase');

// 1. GET /events/manage (Untuk Panitia & Admin)
exports.getManagedEvents = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    let query = supabase
      .from('events')
      .select('id, title, description, location, event_date, quota, status, created_by, created_at')
      .is('deleted_at', null) // Filter: Hanya event yang belum di-soft delete
      .order('created_at', { ascending: false });

    if (role === 'panitia') {
      query = query.eq('created_by', userId);
    }

    const { data: events, error } = await query;
    if (error) throw error;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

// 2. PATCH /events/:id/status (Khusus Admin)
exports.updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'published', 'completed', 'canceled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: `Status tidak valid. Gunakan salah satu dari: ${validStatuses.join(', ')}`,
      });
    }

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id, title, status, updated_at')
      .single();

    if (error || !updatedEvent) {
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Event tidak ditemukan.',
      });
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Status event berhasil diperbarui menjadi ${status}.`,
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};

// 3. GET /events (Daftar Event Publik)
exports.getPublicEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('events')
      .select('id, title, description, location, event_date, quota, status, created_at', { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null) // Filter: Hanya event yang aktif
      .order('event_date', { ascending: true });

    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: events, count, error } = await query;
    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / limit);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
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

    const { data: event, error } = await supabase
      .from('events')
      .select('id, title, description, location, event_date, quota, status, created_at')
      .eq('id', id)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single();

    if (error || !event) {
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Event tidak ditemukan atau belum dipublikasikan.',
      });
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

// 5. POST /panitia/events (Buat Event)
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, location, event_date, quota } = req.body;
    const panitiaId = req.user.id;

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert([
        {
          title,
          description,
          location,
          event_date,
          quota,
          status: 'draft',
          created_by: panitiaId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Draft event berhasil dibuat.',
      data: newEvent,
    });
  } catch (err) {
    next(err);
  }
};

// 6. PUT /panitia/events/:id (Update Event)
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const panitiaId = req.user.id;
    const { title, description, location, event_date, quota, status } = req.body;

    // Cek keberadaan event & hak akses
    const { data: existingEvent, error: findError } = await supabase
      .from('events')
      .select('id, status')
      .eq('id', id)
      .eq('created_by', panitiaId)
      .is('deleted_at', null)
      .single();

    if (findError || !existingEvent) {
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Event tidak ditemukan atau Anda tidak memiliki akses.',
      });
    }

    // Eksekusi Update
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        ...(title && { title }),
        ...(description && { description }),
        ...(location && { location }),
        ...(event_date && { event_date }),
        ...(quota && { quota }),
        ...(status && { status }),
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Event berhasil diperbarui.',
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};

// 7. DELETE /panitia/events/:id (Soft Delete Event)
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const panitiaId = req.user.id;

    const { data: deletedEvent, error } = await supabase
      .from('events')
      .update({ deleted_at: new Date() })
      .eq('id', id)
      .eq('created_by', panitiaId)
      .is('deleted_at', null)
      .select('id, title, deleted_at')
      .single();

    if (error || !deletedEvent) {
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Event tidak ditemukan atau gagal dihapus.',
      });
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Event berhasil dihapus (soft delete).',
      data: deletedEvent,
    });
  } catch (err) {
    next(err);
  }
};