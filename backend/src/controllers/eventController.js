const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

const isColumnError = (err) =>
  err &&
  (err.code === '42703' ||
    err.code === 'PGRST204' ||
    (err.message &&
      (err.message.includes('does not exist') ||
        err.message.includes('Could not find') ||
        err.message.includes('column of') ||
        err.message.includes('schema cache'))));

// 1. GET /events/manage (Untuk Panitia & Admin)
exports.getManagedEvents = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    let query = supabase
      .from('events')
      .select('id, title, description, category, speaker, banner_image, location, event_date, quota, status, created_by, created_at')
      .order('created_at', { ascending: false });

    if (role === 'panitia') {
      query = query.eq('created_by', userId);
    }
    let { data: events, error } = await query;
    if (error && isColumnError(error)) {
      let fallbackQuery = supabase
        .from('events')
        .select('id, title, description, location, event_date, quota, status, created_by, created_at')
        .order('created_at', { ascending: false });
      if (role === 'panitia') {
        fallbackQuery = fallbackQuery.eq('created_by', userId);
      }
      const resFallback = await fallbackQuery;
      events = resFallback.data;
      error = resFallback.error;
    }

    if (error) throw error;

    // Calculate real-time participant registration counts for managed events
    const eventIds = (events || []).map((e) => e.id);
    let regCounts = {};
    if (eventIds.length > 0) {
      const { data: regData } = await supabase
        .from('registrations')
        .select('event_id');
      if (regData) {
        regData.forEach((r) => {
          if (r.event_id) {
            regCounts[r.event_id] = (regCounts[r.event_id] || 0) + 1;
          }
        });
      }
    }

    const eventsWithCounts = (events || []).map((e) => ({
      ...e,
      peserta: regCounts[e.id] || 0,
      registered: regCounts[e.id] || 0,
    }));

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: eventsWithCounts.length,
      data: eventsWithCounts,
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

    const validStatuses = ['draft', 'pending_verification', 'published', 'completed', 'canceled', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return next(new AppError(`Status tidak valid. Gunakan salah satu dari: ${validStatuses.join(', ')}`, 400));
    }

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', id)
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
      .order('event_date', { ascending: true });

    if (search) {
      query = query.or(`title.ilike.%${search}%, location.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);
    let { data: events, count, error } = await query;

    if (error && isColumnError(error)) {
      let fallbackQuery = supabase
        .from('events')
        .select('id, title, description, location, event_date, quota, status, created_at', { count: 'exact' })
        .eq('status', 'published')
        .order('event_date', { ascending: true });

      if (search) {
        fallbackQuery = fallbackQuery.or(`title.ilike.%${search}%, location.ilike.%${search}%`);
      }

      fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);
      const resFallback = await fallbackQuery;
      events = resFallback.data;
      count = resFallback.count;
      error = resFallback.error;
    }

    if (error) throw error;
    const totalItems = count !== null ? count : (events || []).length;

    // Calculate real-time participant registration counts for public events
    const eventIds = (events || []).map((e) => e.id);
    let regCounts = {};
    if (eventIds.length > 0) {
      const { data: regData } = await supabase
        .from('registrations')
        .select('event_id');
      if (regData) {
        regData.forEach((r) => {
          if (r.event_id) {
            regCounts[r.event_id] = (regCounts[r.event_id] || 0) + 1;
          }
        });
      }
    }

    const eventsWithCounts = (events || []).map((e) => ({
      ...e,
      peserta: regCounts[e.id] || 0,
      registered: regCounts[e.id] || 0,
    }));

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
      data: eventsWithCounts,
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
      .single();

    if (error && isColumnError(error)) {
      const resFallback = await supabase
        .from('events')
        .select('id, title, description, location, event_date, quota, status, created_at')
        .eq('id', id)
        .eq('status', 'published')
        .single();
      event = resFallback.data;
      error = resFallback.error;
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

// 5. POST /events (Buat Event Baru)
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, category, speaker, banner_image, location, event_date, quota } = req.body;
    const panitiaId = req.user.id;

    // 1. Cek bentrokan jadwal lokasi & waktu
    const { data: existingBentrokan } = await supabase
      .from('events')
      .select('id, title, location, event_date')
      .eq('location', location)
      .eq('event_date', event_date)
      .maybeSingle();

    if (existingBentrokan) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: `Gagal membuat event. Jadwal bentrok dengan event "${existingBentrokan.title}" pada lokasi dan waktu yang sama.`,
      });
    }

    // 2. Format payload utama & fallback payload
    const fullPayload = {
      title,
      description,
      location,
      event_date,
      quota: parseInt(quota, 10) || 100,
      status: 'draft',
      created_by: panitiaId,
    };
    if (category) fullPayload.category = category;
    if (speaker) fullPayload.speaker = speaker;
    if (banner_image) fullPayload.banner_image = banner_image;

    let { data: newEvent, error } = await supabase
      .from('events')
      .insert([fullPayload])
      .select('id, title, status, created_at')
      .single();

    if (error && isColumnError(error)) {
      const corePayload = {
        title,
        description,
        location,
        event_date,
        quota: parseInt(quota, 10) || 100,
        status: 'draft',
        created_by: panitiaId,
      };

      const resFallback = await supabase
        .from('events')
        .insert([corePayload])
        .select('id, title, status, created_at')
        .single();
      newEvent = resFallback.data;
      error = resFallback.error;
    }

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Draft event berhasil dibuat',
      data: newEvent,
    });
  } catch (err) {
    next(err);
  }
};

// 6. PUT /events/:id (Update Event)
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, speaker, banner_image, location, event_date, quota } = req.body;
    const panitiaId = req.user.id;

    // Check ownership for panitia
    if (req.user.role === 'panitia') {
      const selectQuery = supabase
        .from('events')
        .select('id, created_by')
        .eq('id', id);

      const resSelect = typeof selectQuery.maybeSingle === 'function' ? await selectQuery.maybeSingle() : await selectQuery.single();
      const existingEvt = resSelect?.data;

      if (existingEvt && existingEvt.created_by !== panitiaId) {
        return next(new AppError('Akses ditolak. Anda tidak memiliki izin untuk merubah event ini.', 403));
      }
    }

    const fullPayload = {
      title,
      description,
      location,
      event_date,
      quota,
      updated_at: new Date(),
    };
    if (category) fullPayload.category = category;
    if (speaker) fullPayload.speaker = speaker;
    if (banner_image) fullPayload.banner_image = banner_image;

    let { data: updatedEvent, error } = await supabase
      .from('events')
      .update(fullPayload)
      .eq('id', id)
      .select('id, title, status, updated_at')
      .single();

    if (error && isColumnError(error)) {
      const corePayload = {
        title,
        description,
        location,
        event_date,
        quota,
        updated_at: new Date(),
      };

      const resFallback = await supabase
        .from('events')
        .update(corePayload)
        .eq('id', id)
        .select('id, title, status, updated_at')
        .single();

      updatedEvent = resFallback.data;
      error = resFallback.error;
    }

    if (error || !updatedEvent) {
      return next(new AppError('Event tidak ditemukan.', 404));
    }

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

// 7. DELETE /events/:id (Hapus Event)
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const panitiaId = req.user.id;

    const { data: event, error: findError } = await supabase
      .from('events')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (findError || !event) {
      return next(new AppError('Event tidak ditemukan.', 404));
    }

    if (req.user.role === 'panitia' && event.created_by !== panitiaId) {
      return next(new AppError('Akses ditolak. Anda tidak memiliki izin untuk menghapus event milik panitia lain.', 403));
    }

    const { data: deletedEvent, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .select('id, title')
      .single();

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Event berhasil dihapus.',
      data: deletedEvent,
    });
  } catch (err) {
    next(err);
  }
};

// 8. GET /events/:id/participants (Untuk Panitia & Admin)
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
        users ( id, nama, email )
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: true });

    if (error) throw error;

    const normalizedParticipants = (participants || []).map((participant) => ({
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

// 9. PATCH /events/:id/submit (Khusus Panitia)
exports.submitEventForVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const panitiaId = req.user.id;

    const { data: event, error: findError } = await supabase
      .from('events')
      .select('id, title, description, location, event_date, quota, status, created_by')
      .eq('id', id)
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
        users:created_by ( id, nama, email, organization_name )
      `)
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
      total: (events || []).length,
      data: events || [],
    });
  } catch (err) {
    next(err);
  }
};

// 11. PATCH /admin/events/:id/verify (Approve / Reject Event)
exports.verifyEventByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason, status } = req.body;

    const targetStatus = status || (action === 'approve' ? 'published' : action === 'reject' ? 'rejected' : null);

    if (!targetStatus || !['published', 'rejected'].includes(targetStatus)) {
      return next(new AppError("Aksi/status tidak valid. Nilai harus berupa 'approve'/'published' atau 'reject'/'rejected'.", 400));
    }

    const selectQuery = supabase
      .from('events')
      .select('id, title, status')
      .eq('id', id);

    const resQuery = typeof selectQuery.maybeSingle === 'function' ? await selectQuery.maybeSingle() : await selectQuery.single();

    if (!resQuery || resQuery.error || !resQuery.data) {
      return next(new AppError('Event tidak ditemukan.', 404));
    }

    const event = resQuery.data;

    if (event.status !== 'pending_verification') {
      return next(new AppError("Hanya event berstatus 'pending_verification' yang dapat diverifikasi oleh admin.", 400));
    }

    const reasonToSave = targetStatus === 'rejected' ? rejection_reason : null;

    if (targetStatus === 'rejected' && (!rejection_reason || rejection_reason.trim() === '')) {
      return next(new AppError("Alasan penolakan ('rejection_reason') wajib diisi jika menolak event.", 400));
    }

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        status: targetStatus,
        rejection_reason: reasonToSave,
        updated_at: new Date(),
      })
      .eq('id', id)
      .eq('status', 'pending_verification')
      .select('id, title, status, rejection_reason, updated_at')
      .single();

    if (updateError || !updatedEvent) {
      return next(new AppError("Gagal memverifikasi event. Event mungkin sudah diverifikasi oleh admin lain atau statusnya telah berubah.", 400));
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Event berhasil di-${targetStatus === 'published' ? 'setujui dan dipublikasikan' : 'tolak'}.`,
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};
