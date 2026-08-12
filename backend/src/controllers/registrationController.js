const supabase = require('../config/supabase');

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

      if (errorMsg.includes('EVENT_NOT_FOUND')) {
        return res.status(404).json({ message: 'Event tidak ditemukan.' });
      }
      if (errorMsg.includes('EVENT_NOT_PUBLISHED')) {
        return res.status(400).json({ message: 'Event belum dipublikasikan.' });
      }
      if (errorMsg.includes('QUOTA_EXCEEDED')) {
        return res.status(400).json({ message: 'Pendaftaran gagal, kuota event sudah habis.' });
      }
      if (errorMsg.includes('ALREADY_REGISTERED')) {
        return res.status(400).json({ message: 'Anda sudah terdaftar pada event ini.' });
      }

      throw error;
    }

    return res.status(201).json({
      status: 'success',
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
        registered_at,
        events (
          id,
          title,
          description,
          location,
          event_date
        )
      `)
      .eq('user_id', userId)
      .order('registered_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data: registrations,
    });
  } catch (err) {
    next(err);
  }
};

// 3. PATCH /attendance/:registration_id
const updateAttendance = async (req, res, next) => {
  try {
    const { registration_id } = req.params;
    const { status } = req.body;
    const { id: userId, role } = req.user;

    const validStatuses = ['attended', 'absent'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        statusCode: 400,
        message: `Status kehadiran tidak valid. Gunakan: ${validStatuses.join(', ')}`,
      });
    }

    // Ambil registration untuk mengecek event_id (lalu cek kepemilikan event jika bukan admin)
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('id, event_id')
      .eq('id', registration_id)
      .single();

    if (regError || !registration) {
      return res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Registrasi tidak ditemukan.',
      });
    }

    // Cek kepemilikan event jika panitia
    if (role !== 'admin') {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('created_by')
        .eq('id', registration.event_id)
        .single();
        
      if (eventError || !event || event.created_by !== userId) {
        return res.status(403).json({
          status: 'fail',
          statusCode: 403,
          message: 'Anda tidak memiliki akses untuk mengubah kehadiran pada event ini.',
        });
      }
    }

    // Update status kehadiran
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', registration_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Status kehadiran berhasil diubah menjadi ${status}.`,
      data: updatedRegistration,
    });
  } catch (err) {
    next(err);
  }
};

// Pastikan di-export secara eksplisit seperti ini
module.exports = {
  registerToEvent,
  getMyRegistrations,
  updateAttendance,
};