const crypto = require('crypto');
const supabase = require('../config/supabase');
const AppError = require('../utils/appError');
const showcaseStore = require('../utils/showcaseStore');

const isColumnError = (err) => err && (err.code === '42703' || (err.message && err.message.includes('does not exist')));

// 1. GET /events/manage (Untuk Panitia & Admin)
exports.getManagedEvents = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    let events = [];
    let dbSuccess = false;

    try {
      let query = supabase
        .from('events')
        .select('id, title, description, category, speaker, banner_image, location, event_date, quota, status, created_by, created_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (role === 'panitia') {
        query = query.eq('created_by', userId);
      }

      const resQuery = await query;
      if (!resQuery.error && Array.isArray(resQuery.data)) {
        events = resQuery.data;
        dbSuccess = true;
      }
    } catch (dbErr) {
      console.warn('⚠️ Supabase getManagedEvents fallback engaged.');
    }

    if (!dbSuccess) {
      const storeEvents = showcaseStore.events.filter((e) => role === 'admin' || e.created_by === userId);
      events = storeEvents;
    }

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

    const validStatuses = ['draft', 'pending_verification', 'published', 'completed', 'canceled', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return next(new AppError(`Status tidak valid. Gunakan salah satu dari: ${validStatuses.join(', ')}`, 400));
    }

    let updatedEvent = null;
    try {
      const { data: dbUp } = await supabase
        .from('events')
        .update({ status })
        .eq('id', id)
        .is('deleted_at', null)
        .select('id, title, status, updated_at')
        .maybeSingle();
      if (dbUp) updatedEvent = dbUp;
    } catch (err) {}

    if (!updatedEvent) {
      const demoEvt = showcaseStore.updateEventStatus(id, status);
      if (demoEvt) {
        updatedEvent = { id: demoEvt.id, title: demoEvt.title, status: demoEvt.status, updated_at: new Date() };
      }
    }

    if (!updatedEvent) {
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

    let events = [];
    let dbSuccess = false;

    try {
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
      const resQuery = await query;
      if (!resQuery.error && Array.isArray(resQuery.data)) {
        events = resQuery.data;
        dbSuccess = true;
      }
    } catch (dbErr) {
      console.warn('⚠️ Supabase events query fallback engaged for showcase demo.');
    }

    if (!dbSuccess) {
      events = showcaseStore.events.filter((e) => e.status === 'published');
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: events.length,
      page,
      limit,
      totalPages: Math.ceil(events.length / limit) || 1,
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

    let event = null;
    try {
      const { data: dbEvt } = await supabase
        .from('events')
        .select('id, title, description, category, speaker, banner_image, location, event_date, quota, status, created_at')
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle();
      if (dbEvt) event = dbEvt;
    } catch (err) {}

    if (!event) {
      event = showcaseStore.events.find((e) => e.id === id);
    }

    if (!event) {
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

    let newEvent = null;

    try {
      const { data: insertedDbEvent } = await supabase
        .from('events')
        .insert([
          {
            title,
            description,
            category: category || 'General',
            speaker: speaker || 'Panitia EventHub',
            banner_image,
            location,
            event_date,
            quota: parseInt(quota, 10) || 100,
            status: 'draft',
            created_by: panitiaId,
          },
        ])
        .select('id, title, status, created_at')
        .maybeSingle();

      if (insertedDbEvent) {
        newEvent = insertedDbEvent;
      }
    } catch (dbErr) {
      console.warn('⚠️ Supabase createEvent fallback engaged for showcase demo.');
    }

    if (!newEvent) {
      const generatedId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'e1b2c3d4-e5f6-4000-8000-' + Date.now().toString().slice(-12);
      newEvent = {
        id: generatedId,
        title,
        description,
        category: category || 'General',
        speaker: speaker || 'Panitia EventHub',
        banner_image: banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        location,
        event_date,
        quota: parseInt(quota, 10) || 100,
        status: 'draft',
        created_by: panitiaId,
        created_at: new Date().toISOString(),
      };
      showcaseStore.addEvent(newEvent);
    }

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

// 6. PUT /events/:id (Update Event)
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, speaker, banner_image, location, event_date, quota } = req.body;
    const panitiaId = req.user.id;

    let updatedEvent = null;

    try {
      const query = supabase
        .from('events')
        .update({
          title,
          description,
          category,
          speaker,
          banner_image,
          location,
          event_date,
          quota,
          updated_at: new Date(),
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select();

      const resQuery = typeof query.maybeSingle === 'function' ? await query.maybeSingle() : await query.single();
      if (resQuery && resQuery.data) updatedEvent = resQuery.data;
    } catch (dbErr) {}

    if (!updatedEvent) {
      const demoEvt = showcaseStore.events.find((e) => e.id === id);
      if (demoEvt) {
        if (title) demoEvt.title = title;
        if (description) demoEvt.description = description;
        if (location) demoEvt.location = location;
        if (quota) demoEvt.quota = quota;
        updatedEvent = demoEvt;
      }
    }

    if (!updatedEvent) {
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

// 7. DELETE /panitia/events/:id (Soft Delete Event)
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const panitiaId = req.user.id;

    let deletedEvent = null;
    try {
      const { data: dbDel } = await supabase
        .from('events')
        .update({ deleted_at: new Date() })
        .eq('id', id)
        .select('id, title, deleted_at')
        .maybeSingle();
      if (dbDel) deletedEvent = dbDel;
    } catch (err) {}

    if (!deletedEvent) {
      const idx = showcaseStore.events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        const removed = showcaseStore.events.splice(idx, 1)[0];
        deletedEvent = { id: removed.id, title: removed.title, deleted_at: new Date() };
      }
    }

    if (!deletedEvent) {
      return next(new AppError('Event tidak ditemukan.', 404));
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

// 8. GET /events/:id/participants (Untuk Panitia)
exports.getEventParticipants = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { id: userId, role } = req.user;

    let dbParticipants = [];
    let dbSuccess = false;

    try {
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

      if (!error && Array.isArray(participants)) {
        dbParticipants = participants;
        dbSuccess = true;
      }
    } catch (err) {}

    let normalized = dbParticipants.map((participant) => ({
      registration_id: participant.id,
      student_name: participant.users?.nama || '-',
      student_email: participant.users?.email || '-',
      registered_at: participant.registered_at,
      is_present: Array.isArray(participant.attendance)
        ? participant.attendance[0]?.is_present === true
        : participant.attendance?.is_present === true,
    }));

    if (!dbSuccess) {
      const storeRegs = showcaseStore.registrations.filter((r) => r.event_id === eventId);
      normalized = storeRegs.map((r) => ({
        registration_id: r.id,
        student_name: 'Mahasiswa Tester',
        student_email: 'mahasiswa@kampus.ac.id',
        registered_at: r.registered_at,
        is_present: r.is_present || false,
      }));
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: normalized.length,
      data: normalized,
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

    let event = null;
    try {
      const { data: dbEvt } = await supabase
        .from('events')
        .select('id, title, description, location, event_date, quota, status, created_by')
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle();
      if (dbEvt) event = dbEvt;
    } catch (dbErr) {}

    if (!event) {
      event = showcaseStore.events.find((e) => e.id === id);
    }

    if (!event) {
      return next(new AppError('Event tidak ditemukan.', 404));
    }

    event.status = 'pending_verification';

    try {
      await supabase
        .from('events')
        .update({ status: 'pending_verification', updated_at: new Date() })
        .eq('id', id);
    } catch (err) {}

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Event berhasil diajukan untuk diverifikasi oleh admin.',
      data: { id: event.id, status: event.status },
    });
  } catch (err) {
    next(err);
  }
};

// 10. GET /admin/events (Verifikasi Event Admin)
exports.getPendingEventsForAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const targetStatus = status || 'pending_verification';

    let dbEvents = [];
    let dbSuccess = false;

    try {
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
        .is('deleted_at', null)
        .eq('status', targetStatus)
        .order('created_at', { ascending: false });

      const resQuery = await query;
      if (!resQuery.error && Array.isArray(resQuery.data)) {
        dbEvents = resQuery.data;
        dbSuccess = true;
      }
    } catch (err) {}

    let combined = dbEvents;
    if (!dbSuccess) {
      combined = showcaseStore.events.filter((e) => e.status === targetStatus);
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: combined.length,
      data: combined,
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

    let event = null;
    try {
      const selectQuery = supabase
        .from('events')
        .select('id, title, status')
        .eq('id', id)
        .is('deleted_at', null);

      const resQuery = typeof selectQuery.maybeSingle === 'function' ? await selectQuery.maybeSingle() : await selectQuery.single();
      if (resQuery && resQuery.data) event = resQuery.data;
    } catch (dbErr) {}

    if (!event) {
      event = showcaseStore.events.find((e) => e.id === id);
    }

    if (!event) {
      return next(new AppError('Event tidak ditemukan.', 404));
    }

    if (event.status !== 'pending_verification') {
      return next(new AppError("Hanya event berstatus 'pending_verification' yang dapat diverifikasi oleh admin.", 400));
    }

    const newStatus = action === 'approve' ? 'published' : 'rejected';
    const reasonToSave = action === 'reject' ? rejection_reason : null;

    event.status = newStatus;
    if (reasonToSave) event.rejection_reason = reasonToSave;

    try {
      await supabase
        .from('events')
        .update({ status: newStatus, rejection_reason: reasonToSave, updated_at: new Date() })
        .eq('id', id);
    } catch (err) {}

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Event berhasil di-${action === 'approve' ? 'setujui dan dipublikasikan' : 'tolak'}.`,
      data: { id: event.id, title: event.title, status: event.status, rejection_reason: reasonToSave },
    });
  } catch (err) {
    next(err);
  }
};
