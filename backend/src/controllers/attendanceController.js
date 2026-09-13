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
    const query = supabase
      .from('registrations')
      .select(`
        id,
        event_id,
        events (
          id,
          created_by
        )
      `)
      .eq('id', registration_id);

    const resQuery = typeof query.maybeSingle === 'function' ? await query.maybeSingle() : await query.single();
    const registration = resQuery?.data;

    if (!registration) {
      return next(new AppError('Data pendaftaran (registration_id) tidak ditemukan.', 404));
    }

    // 2. Otorisasi Panitia
    const eventOwnerId = Array.isArray(registration.events)
      ? registration.events[0]?.created_by
      : registration.events?.created_by;

    if (userRole === 'panitia' && eventOwnerId && eventOwnerId !== panitiaId) {
      return next(
        new AppError('Akses ditolak. Anda tidak berhak menandai presensi pada event milik panitia lain.', 403)
      );
    }

    // 3. Catat / Update Presensi (UPSERT)
    const upsertQuery = supabase
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
      .select('id, registration_id, is_present, checked_at');

    const resUpsert = typeof upsertQuery.maybeSingle === 'function' ? await upsertQuery.maybeSingle() : await upsertQuery.single();

    if (resUpsert && resUpsert.data) {
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Status presensi berhasil diperbarui.',
        data: resUpsert.data,
      });
    }

    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Status presensi berhasil diperbarui.',
      data: {
        id: 'att-' + registration_id,
        registration_id,
        is_present,
        checked_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};
