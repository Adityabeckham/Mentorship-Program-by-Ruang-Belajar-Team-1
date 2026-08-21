const supabase = require('../config/supabase');

// 1. GET /events/manage (Untuk Panitia & Admin)
exports.getManagedEvents = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    let query = supabase
      .from('events')
      .select('id, title, description, category, speaker, banner_image, location, event_date, quota, status, created_by, created_at')
      .is('deleted_at', null)
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

    const validStatuses = ['draft', 'pending_verification', 'published', 'completed', 'rejected', 'canceled'];
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
      .select('id, title, description, category, speaker, banner_image, location, event_date, quota, status, created_at', { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null)
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
      .select('id, title, description, category, speaker, banner_image, location, event_date, quota, status, created_at')
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
    const { title, description, category, speaker, banner_image, location, event_date, quota } = req.body;
    const panitiaId = req.user.id;

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert([
        {
          title,
          description,
          category,
          speaker,
          banner_image,
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
    const { title, description, category, speaker, banner_image, location, event_date, quota, status } = req.body;

    const { data: existingEvent, error: findError } = await supabase
      .from('events')
      .select('id, created_by, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (findError || !existingEvent) {
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Event tidak ditemukan.',
      });
    }

    if (req.user.role === 'panitia' && existingEvent.created_by !== panitiaId) {
      return res.status(403).json({
        status: 'fail',
        statusCode: 403,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk mengedit event milik panitia lain.',
      });
    }

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(speaker && { speaker }),
        ...(banner_image !== undefined && { banner_image }),
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

    const { data: event, error: findError } = await supabase
      .from('events')
      .select('id, created_by')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (findError || !event) {
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Event tidak ditemukan.',
      });
    }

    if (req.user.role === 'panitia' && event.created_by !== panitiaId) {
      return res.status(403).json({
        status: 'fail',
        statusCode: 403,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk menghapus event milik panitia lain.',
      });
    }

    const { data: deletedEvent, error } = await supabase
      .from('events')
      .update({ deleted_at: new Date() })
      .eq('id', id)
      .select('id, title, deleted_at')
      .single();

    if (error) throw error;

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

// 8. GET /events/:id/participants (Untuk Panitia)
exports.getEventParticipants = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { id: userId, role } = req.user;

    if (role !== 'admin') {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, created_by')
        .eq('id', eventId)
        .single();
        
      if (eventError || !event || event.created_by !== userId) {
        return res.status(403).json({
          status: 'fail',
          statusCode: 403,
          message: 'Anda tidak memiliki akses ke event ini.',
        });
      }
    }

    const { data: participants, error } = await supabase
      .from('registrations')
      .select(`
        id,
        status,
        registered_at,
        users (
          id,
          nama,
          email
        )
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: participants.length,
      data: participants,
    });
  } catch (err) {
    next(err);
  }
};

// 9. PATCH /panitia/events/:id/submit
exports.submitEventForVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const panitiaId = req.user.id;

    const { data: event, error: findError } = await supabase
      .from('events')
      .select('id, title, description, location, event_date, quota, status, created_by')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (findError || !event) {
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Event tidak ditemukan.',
      });
    }

    if (req.user.role === 'panitia' && event.created_by !== panitiaId) {
      return res.status(403).json({
        status: 'fail',
        statusCode: 403,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk mengajukan event milik panitia lain.',
      });
    }

    if (event.status !== 'draft' && event.status !== 'rejected') {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: `Hanya event berstatus 'draft' yang dapat diajukan. Status saat ini: '${event.status}'.`,
      });
    }

    if (!event.title || !event.description || !event.location || !event.event_date || !event.quota) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: 'Gagal mengajukan event. Informasi event belum lengkap.',
      });
    }

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        status: 'pending_verification',
        updated_at: new Date(),
      })
      .eq('id', id)
      .select('id, title, status, updated_at')
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Event berhasil diajukan untuk diverifikasi oleh admin.',
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};

// 10. GET /admin/events (Daftar event yang memerlukan verifikasi / status 'pending_verification')
exports.getPendingEventsForAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        location,
        event_date,
        quota,
        status,
        rejection_reason,
        created_at,
        created_by,
        users:created_by (
          id,
          nama,
          email,
          organization_name
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.eq('status', 'pending_verification');
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

// 11. PATCH /admin/events/:id/verify (Approve / Reject Event)
exports.verifyEventByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: "Aksi tidak valid. Nilai 'action' harus berupa 'approve' atau 'reject'.",
      });
    }

    const { data: event, error: findError } = await supabase
      .from('events')
      .select('id, title, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (findError || !event) {
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Event tidak ditemukan.',
      });
    }

    let newStatus = '';
    let reasonToSave = null;

    if (action === 'approve') {
      newStatus = 'published';
    } else if (action === 'reject') {
      if (!rejection_reason || rejection_reason.trim() === '') {
        return res.status(400).json({
          status: 'fail',
          statusCode: 400,
          message: "Alasan penolakan ('rejection_reason') wajib diisi jika menolak event.",
        });
      }
      newStatus = 'rejected';
      reasonToSave = rejection_reason;
    }

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        status: newStatus,
        rejection_reason: reasonToSave,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select('id, title, status, rejection_reason, updated_at')
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Event berhasil di-${action === 'approve' ? 'setujui dan dipublikasikan' : 'tolak'}.`,
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};