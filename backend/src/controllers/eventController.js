const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

const isColumnError = (err) => err && (err.code === '42703' || (err.message && err.message.includes('does not exist')));

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

    let { data: events, error } = await query;
    if (error && isColumnError(error)) {
      let fallbackQuery = supabase
       .from('events')
       .select('id, title, description, location, event_date, quota, status, created_by, created_at')
       .is('deleted_at', null)
       .order('created_at', { ascending: false });
      if (role === 'panitia') {
        fallbackQuery = fallbackQuery.eq('created_by', userId);
      }
      const res = await fallbackQuery;
      events = res.data;
      error = res.error;
    }

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
      return next(new AppError(`Status tidak valid. Gunakan salah satu dari: ${validStatuses.join(', ')}`, 400));
    }

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', id)
      .is('deleted_at', null)
      .select('id, title, status, updated_at')
      .single();

    if (error || !updatedEvent) {
      return next(new AppError('Event tidak ditemukan.', 404));
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

    const offset = (page - 1) * limit;

    let query = supabase
      .from('events')
      .select('id, title, description, category, speaker, banner_image, location, event_date, quota, status, created_at', { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('event_date', { ascending: true });

    if (search) {
      query = query.or(`title.ilike.%${search}%, category.ilike.%${search}%, location.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    let { data: events, count, error } = await query;
    if (error && isColumnError(error)) {
      let fallbackQuery = supabase
       .from('events')
       .select('id, title, description, location, event_date, quota, status, created_at', { count: 'exact' })
       .eq('status', 'published')
       .is('deleted_at', null)
       .order('event_date', { ascending: true });

      if (search) {
        fallbackQuery = fallbackQuery.or(`title.ilike.%${search}%, location.ilike.%${search}%`);
      }

      fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);
      const res = await fallbackQuery;
      events = res.data;
      count = res.count;
      error = res.error;
    }

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

    let { data: event, error } = await supabase
      .from('events')
      .select('id, title, description, category, speaker, banner_image, location, event_date, quota, status, created_at')
      .eq('id', id)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single();

    if (error && isColumnError(error)) {
      const res = await supabase
        .from('events')
        .select('id, title, description, location, event_date, quota, status, created_at')
        .eq('id', id)
        .eq('status', 'published')
        .is('deleted_at', null)
        .single();
      event = res.data;
      error = res.error;
    }

    if (error || !event) {
      return next(new AppError('Event tidak ditemukan atau belum dipublikasikan.', 404));
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

<<<<<<< Updated upstream
    let { data: newEvent, error } = await supabase
=======
    // 1. CEK BENTROKAN JADWAL (Tempat & Tanggal/Jam yang sama untuk SELURUH Panitia)
    // Event yang di-soft delete (deleted_at IS NOT NULL) diabaikan
    const { data: existingBentrokan, error: checkError } = await supabase
      .from('events')
      .select('id, title, location, event_date')
      .eq('location', location)
      .eq('event_date', event_date)
      .is('deleted_at', null)
      .maybeSingle(); // Menggunakan maybeSingle agar tidak melempar error jika data kosong

    if (checkError) throw checkError;

    // Jika ada event lain di lokasi dan jam/tanggal yang persis sama
    if (existingBentrokan) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: `Gagal membuat event. Jadwal bentrok dengan event "${existingBentrokan.title}" pada lokasi dan waktu yang sama.`,
      });
    }

    // 2. INSERT EVENT BARU
    const { data: newEvent, error } = await supabase
>>>>>>> Stashed changes
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
      // HANYA SELECT PROPERTI YANG DIBUTUHKAN SESUAI KONTRAK RESPONSE
      .select('id, title, status, created_at')
      .single();

    if (error && isColumnError(error)) {
      const res = await supabase
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
      newEvent = res.data;
      error = res.error;
    }

    if (error) throw error;

    // 3. RETURN RESPONSE SESUAI KONTRAK
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Draft event berhasil dibuat', 
      data: {
        id: newEvent.id,
        title: newEvent.title,
        status: newEvent.status,
        created_at: newEvent.created_at,
      },
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
      return next(new AppError('Event tidak ditemukan.', 404));
    }

    if (req.user.role === 'panitia' && existingEvent.created_by !== panitiaId) {
      return next(new AppError('Akses ditolak. Anda tidak memiliki izin untuk mengedit event milik panitia lain.', 403));
    }

    let { data: updatedEvent, error: updateError } = await supabase
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

    if (updateError && isColumnError(updateError)) {
      const res = await supabase
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
      updatedEvent = res.data;
      updateError = res.error;
    }

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
      return next(new AppError('Event tidak ditemukan.', 404));
    }

    if (req.user.role === 'panitia' && event.created_by !== panitiaId) {
      return next(new AppError('Akses ditolak. Anda tidak memiliki izin untuk menghapus event milik panitia lain.', 403));
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
        return next(new AppError('Anda tidak memiliki akses ke event ini.', 403));
      }
    }

    const { data: participants, error } = await supabase
      .from('registrations')
      .select(`
        id,
        status,
        registered_at,
        attendance ( id, is_present, checked_at ),
        users (
          id,
          nama,
          email
        )
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: true });

    if (error) throw error;

    const normalizedParticipants = participants.map((participant) => ({
      registration_id: participant.id,
      student_name: participant.users?.nama || '-',
      student_email: participant.users?.email || '-',
      registered_at: participant.registered_at,
      is_present: Array.isArray(participant.attendance)
        ? participant.attendance[0]?.is_present === true
        : participant.attendance?.is_present === true,
    }));

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: normalizedParticipants.length,
      data: normalizedParticipants,
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
      return next(new AppError('Event tidak ditemukan.', 404));
    }

    if (req.user.role === 'panitia' && event.created_by !== panitiaId) {
      return next(new AppError('Akses ditolak. Anda tidak memiliki izin untuk mengajukan event milik panitia lain.', 403));
    }

    if (event.status !== 'draft' && event.status !== 'rejected') {
      return next(new AppError(`Hanya event berstatus 'draft' yang dapat diajukan. Status saat ini: '${event.status}'.`, 400));
    }

    if (!event.title || !event.description || !event.location || !event.event_date || !event.quota) {
      return next(new AppError('Gagal mengajukan event. Informasi event belum lengkap.', 400));
    }

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        status: 'pending_verification',
        updated_at: new Date(),
      })
      .eq('id', id)
      .select('id, status')
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

// 10. GET /admin/events (Verifikasi Event Admin)
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
      return next(new AppError("Aksi tidak valid. Nilai 'action' harus berupa 'approve' atau 'reject'.", 400));
    }

    const { data: event, error: findError } = await supabase
      .from('events')
      .select('id, title, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (findError || !event) {
      return next(new AppError('Event tidak ditemukan.', 404));
    }

    let newStatus = '';
    let reasonToSave = null;

    if (action === 'approve') {
      newStatus = 'published';
    } else if (action === 'reject') {
      if (!rejection_reason || rejection_reason.trim() === '') {
        return next(new AppError("Alasan penolakan ('rejection_reason') wajib diisi jika menolak event.", 400));
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