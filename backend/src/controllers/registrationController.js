const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

// 1. POST /events/:id/register (Atomic via Supabase RPC)
const registerToEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id; // Diambil dari JWT payload

    // Panggil Stored Procedure atomic 'register_to_event_atomic' di Supabase
    const { data, error } = await supabase.rpc('register_to_event_atomic', {
      p_user_id: userId,
      p_event_id: eventId,
    });

    if (error) {
      const errorMsg = error.message || '';

      // [DIUBAH]: Menggunakan AppError agar ditangani terpusat oleh errorHandler
      if (errorMsg.includes('EVENT_NOT_FOUND')) {
        return next(new AppError('Event tidak ditemukan.', 404));
      }
      if (errorMsg.includes('EVENT_NOT_PUBLISHED')) {
        return next(new AppError('Event belum dipublikasikan.', 400));
      }
      if (errorMsg.includes('QUOTA_EXCEEDED')) {
        return next(new AppError('Pendaftaran gagal, kuota event sudah habis.', 400));
      }
      if (errorMsg.includes('ALREADY_REGISTERED')) {
        return next(new AppError('Anda sudah terdaftar pada event ini.', 400));
      }

      // Jika ada error database yang tidak terduga
      return next(error);
    }

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

// 2. GET /registrations/me
const getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        id,
        status,
        events (
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

    // [DIUBAH]: Lempar error database ke next(error) jika query gagal
    if (error) return next(error);

    const formattedData = registrations.map((item) => {
      // Ambil is_present dari relasi attendance (jika null/belum presensi, default false)
      const isPresent = Array.isArray(item.attendance)
        ? item.attendance[0]?.is_present || false
        : item.attendance?.is_present || false;

      return {
        registration_id: item.id,
        event_title: item.events?.title || '',
        event_date: item.events?.event_date || null,
        location: item.events?.location || '',
        status: item.status,
        is_present: isPresent,
      };
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