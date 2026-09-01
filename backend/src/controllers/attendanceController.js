const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

// POST /panitia/attendance
exports.markAttendance = async (req, res, next) => {
  try {
    const { registration_id, is_present } = req.body;
    const panitiaId = req.user.id;
    const userRole = req.user.role;

    if (!registration_id || typeof is_present !== 'boolean') {
      return next(
        new AppError('registration_id dan status is_present (boolean) wajib diisi.', 400)
      );
    }

    // 1. Cek pendaftaran dan data event terkait
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        event_id,
        events!inner (
          id,
          created_by
        )
      `)
      .eq('id', registration_id)
      .single();

    if (regError || !registration) {
      return next(new AppError('Data pendaftaran (registration_id) tidak ditemukan.', 404));
    }

    // 2. Otorisasi Panitia
    const eventOwnerId = registration.events.created_by;
    if (userRole === 'panitia' && eventOwnerId !== panitiaId) {
      return next(
        new AppError('Akses ditolak. Anda tidak berhak menandai presensi pada event milik panitia lain.', 403)
      );
    }

    // 3. Catat / Update Presensi (UPSERT)
    const { data: attendance, error: attError } = await supabase
      .from('attendance')
      .upsert(
        {
          registration_id,
          is_present,
          checked_by: panitiaId,
          checked_at: new Date(),
        },
        { onConflict: 'registration_id' }
      )
      .select('id, registration_id, is_present, checked_at')
      .single();

    if (attError) return next(attError);

    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Status presensi berhasil diperbarui.',
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};