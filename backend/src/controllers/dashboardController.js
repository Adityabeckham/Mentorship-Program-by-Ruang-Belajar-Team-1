const supabase = require('../config/supabase');

// GET /panitia/dashboard/stats
exports.getPanitiaDashboardStats = async (req, res, next) => {
  try {
    const panitiaId = req.user.id; // Ambil ID Panitia dari JWT

    // 1. Ambil seluruh event yang dibuat oleh panitia ini
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, status')
      .eq('created_by', panitiaId);

    if (eventsError) throw eventsError;

    // Jika panitia belum pernah membuat event sama sekali
    if (!events || events.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          total_events: 0,
          total_participants: 0,
          stats_by_status: {
            draft: 0,
            published: 0,
            completed: 0,
            canceled: 0
          }
        }
      });
    }

    // 2. Hitung statistik event per status
    const eventIds = events.map(event => event.id);
    const statsByStatus = {
      draft: 0,
      published: 0,
      completed: 0,
      canceled: 0
    };

    events.forEach(event => {
      if (statsByStatus[event.status] !== undefined) {
        statsByStatus[event.status]++;
      }
    });

    // 3. Hitung total peserta terdaftar pada event-event milik panitia ini
    const { count: totalParticipants, error: regError } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .in('event_id', eventIds);

    if (regError) throw regError;

    // 4. Return respons statistik
    res.status(200).json({
      status: 'success',
      data: {
        total_events: events.length,
        total_participants: totalParticipants || 0,
        stats_by_status: statsByStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /admin/dashboard/stats
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    // 1. Hitung total user & rincian per role
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    const { count: totalMahasiswa } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'mahasiswa');

    const { count: totalPanitia } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'panitia');

    // 2. Hitung total event & per status
    const { count: totalEvents } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true });

    const statuses = ['draft', 'published', 'completed', 'canceled'];
    const eventsByStatus = {};

    for (const status of statuses) {
      const { count } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('status', status);
      eventsByStatus[status] = count || 0;
    }

    // 3. Hitung total registrasi
    const { count: totalRegistrations } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true });

    // 4. Return respons agregat
    res.status(200).json({
      status: 'success',
      data: {
        total_users: totalUsers || 0,
        total_mahasiswa: totalMahasiswa || 0,
        total_panitia: totalPanitia || 0,
        total_events: totalEvents || 0,
        total_registrations: totalRegistrations || 0,
        events_by_status: eventsByStatus
      }
    });
  } catch (err) {
    next(err);
  }
};