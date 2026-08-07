const supabase = require('../config/supabase');

// 1. POST /events/:id/register
exports.registerToEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id; // Diambil dari payload JWT via authMiddleware

    // Cek apakah event ada dan statusnya published
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, quota, status')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ message: 'Event tidak ditemukan.' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Event belum dipublikasikan.' });
    }

    // VALIDASI: Cegah pendaftaran ganda pada event yang sama
    const { data: existingRegistration } = await supabase
      .from('registrations')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'Anda sudah terdaftar pada event ini.' 
      });
    }

    // Simpan pendaftaran baru ke database
    const { data: newRegistration, error: registerError } = await supabase
      .from('registrations')
      .insert([
        {
          user_id: userId,
          event_id: eventId,
          status: 'registered'
        }
      ])
      .select('id, user_id, event_id, status, registered_at')
      .single();

    if (registerError) throw registerError;

    res.status(201).json({
      status: 'success',
      message: 'Berhasil mendaftar ke event.',
      data: newRegistration
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET /registrations/me
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Ambil riwayat pendaftaran milik user aktif beserta detail event (JOIN)
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

    res.status(200).json({
      status: 'success',
      data: registrations
    });
  } catch (err) {
    next(err);
  }
};