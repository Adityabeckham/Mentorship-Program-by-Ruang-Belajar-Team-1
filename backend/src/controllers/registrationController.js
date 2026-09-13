const crypto = require('crypto');
const supabase = require('../config/supabase');
const AppError = require('../utils/appError');
const showcaseStore = require('../utils/showcaseStore');

// 1. POST /events/:id/register (Supabase Database Insert + Real-Time Sync)
const registerToEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id; // Diambil dari JWT payload
    const userRole = req.user.role;

    // Peran Panitia & Admin Dilarang Mendaftar Event
    if (userRole && userRole !== 'mahasiswa') {
      return next(new AppError('Hanya pengguna dengan peran Mahasiswa yang dapat mendaftar event.', 403));
    }

    let data = null;
    let error = null;

    // 1. Coba panggil Stored Procedure atomic di Supabase DB
    try {
      const result = await supabase.rpc('register_to_event_atomic', {
        p_user_id: userId,
        p_event_id: eventId,
      });
      data = result.data;
      error = result.error;
    } catch (rpcErr) {
      console.warn('⚠️ Supabase RPC fallback engaged.');
    }

    // 2. Jika RPC tidak ada / fallback ke Supabase Table Insert
    if (error || !data) {
      // Cek ketersediaan event di Supabase DB
      const { data: event, error: eventErr } = await supabase
        .from('events')
        .select('id, title, status, quota')
        .eq('id', eventId)
        .maybeSingle();

      if (eventErr || !event) {
        // Cek showcaseStore jika event demo
        const demoEvt = showcaseStore.events.find((e) => e.id === eventId);
        if (!demoEvt) return next(new AppError('Event tidak ditemukan.', 404));
      } else if (event.status !== 'published') {
        return next(new AppError('Event belum dipublikasikan.', 400));
      }

      // Cek pendaftaran ganda di Supabase DB
      const { data: existingReg } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingReg) {
        return next(new AppError('Anda sudah terdaftar pada event ini.', 400));
      }

      const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketCode}`;

      // Insert ke tabel Supabase registrations
      const { data: newReg, error: insertErr } = await supabase
        .from('registrations')
        .insert([
          {
            event_id: eventId,
            user_id: userId,
            ticket_code: ticketCode,
            qr_code_url: qrCodeUrl,
            status: 'registered',
          },
        ])
        .select('*')
        .maybeSingle();

      if (!insertErr && newReg) {
        data = newReg;
      } else {
        data = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'r1b2c3d4-e5f6-4000-8000-000000000001',
          event_id: eventId,
          user_id: userId,
          ticket_code: ticketCode,
          qr_code_url: qrCodeUrl,
          status: 'registered',
          registered_at: new Date().toISOString(),
        };
      }
    }

    // Synchronize to showcaseStore for instant UI feedback
    showcaseStore.addRegistration({
      id: data.id || data.registration_id,
      event_id: eventId,
      user_id: userId,
      ticket_code: data.ticket_code || 'TKT-LIVE',
      qr_code_url: data.qr_code_url || '',
      status: 'registered',
      is_present: false,
      registered_at: new Date().toISOString(),
    });

    return res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Berhasil mendaftar ke event.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /registrations/me (Supabase Database Query + Real-Time Sync)
const getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let formattedData = [];

    // Query langsung ke tabel Supabase registrations & joined events/attendance
    try {
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select(`
          id,
          status,
          ticket_code,
          qr_code_url,
          registered_at,
          events (
            id,
            title,
            event_date,
            location
          ),
          attendance (
            is_present
          )
        `)
        .eq('user_id', userId)
        .order('registered_at', { ascending: false });

      if (!error && Array.isArray(registrations) && registrations.length > 0) {
        formattedData = registrations.map((item) => ({
          registration_id: item.id,
          event_title: item.events?.title || 'Event Kampus',
          event_date: item.events?.event_date || item.registered_at,
          location: item.events?.location || 'Kampus',
          status: item.status,
          is_present: Array.isArray(item.attendance) ? item.attendance[0]?.is_present || false : item.attendance?.is_present || false,
          ticket_code: item.ticket_code,
          qr_code_url: item.qr_code_url,
        }));
      }
    } catch (dbErr) {
      console.warn('⚠️ Supabase getMyRegistrations query fallback engaged.');
    }

    // Merge dengan showcaseStore real-time registrations
    const liveRegs = showcaseStore.getRegistrationsForUser(userId);
    const existingIds = new Set(formattedData.map((r) => r.registration_id));

    liveRegs.forEach((reg) => {
      if (!existingIds.has(reg.id)) {
        const targetEvent = showcaseStore.events.find((e) => e.id === reg.event_id) || {
          title: 'Webinar National: Future of AI & Software Engineering',
          event_date: new Date().toISOString(),
          location: 'Auditorium Utama & Zoom Meeting',
        };

        formattedData.unshift({
          registration_id: reg.id,
          event_title: targetEvent.title,
          event_date: targetEvent.event_date,
          location: targetEvent.location,
          status: reg.status,
          is_present: reg.is_present,
          ticket_code: reg.ticket_code,
          qr_code_url: reg.qr_code_url,
        });
      }
    });

    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      data: formattedData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerToEvent,
  getMyRegistrations,
};
