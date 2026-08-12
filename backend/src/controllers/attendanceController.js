const supabase = require('../config/supabase');

// POST /panitia/attendance (Marking Presensi Peserta)
exports.markAttendance = async (req, res, next) => {
  try {
    const { registration_id, is_present } = req.body;
    const panitiaId = req.user.id;
    const userRole = req.user.role;

    if (!registration_id || is_present === undefined) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: 'registration_id dan status is_present wajib diisi.',
      });
    }

    // 1. Cek pendaftaran dan JOIN ke tabel events
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
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Data pendaftaran (registration_id) tidak ditemukan.',
      });
    }

    // 2. OTORISASI PRESENSI: Jika panitia mencoba tandai presensi event milik panitia lain -> 403 Forbidden
    const eventOwnerId = registration.events.created_by;
    if (userRole === 'panitia' && eventOwnerId !== panitiaId) {
      return res.status(403).json({
        status: 'fail',
        statusCode: 403,
        message: 'Akses ditolak. Anda tidak berhak menandai presensi pada event milik panitia lain.',
      });
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

    if (attError) throw attError;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Status presensi berhasil diperbarui.',
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};