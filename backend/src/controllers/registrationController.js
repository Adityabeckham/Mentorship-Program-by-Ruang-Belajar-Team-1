const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

// 1. POST /events/:id/register
const registerToEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Peran Panitia & Admin Dilarang Mendaftar Event
    if (userRole && userRole !== 'mahasiswa') {
      return next(new AppError('Hanya pengguna dengan peran Mahasiswa yang dapat mendaftar event.', 403));
    }

    // 1. Cek ketersediaan event di Supabase DB
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('id, title, status, quota')
      .eq('id', eventId)
      .is('deleted_at', null)
      .maybeSingle();

    if (eventErr || !event) {
      return next(new AppError('Event tidak ditemukan.', 404));
    }

    if (event.status !== 'published') {
      return next(new AppError('Event belum dipublikasikan.', 400));
    }

    // 2. Cek pendaftaran ganda di Supabase DB
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

    // 3. Insert ke tabel Supabase registrations
    const query = supabase
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
      .select('*');

    const resQuery = typeof query.maybeSingle === 'function' ? await query.maybeSingle() : await query.single();

    if (!resQuery || resQuery.error || !resQuery.data) {
      return next(new AppError('Gagal mendaftar ke event.', 500));
    }

    return res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Berhasil mendaftar ke event.',
      data: resQuery.data,
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /registrations/me
const getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id;

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

    if (error) throw error;

    const formattedData = (registrations || []).map((item) => ({
      registration_id: item.id,
      event_title: item.events?.title || '-',
      event_date: item.events?.event_date || item.registered_at,
      location: item.events?.location || '-',
      status: item.status,
      is_present: Array.isArray(item.attendance) ? item.attendance[0]?.is_present || false : item.attendance?.is_present || false,
      ticket_code: item.ticket_code,
      qr_code_url: item.qr_code_url,
    }));

    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      total: formattedData.length,
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
