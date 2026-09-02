const supabase = require('../config/supabase');
const AppError = require('../utils/appError');

// GET /panitia/dashboard/stats
exports.getPanitiaDashboardStats = async (req, res, next) => {
  try {
    const panitiaId = req.user.id;

    // 1. Ambil seluruh event milik panitia ini
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, status')
      .eq('created_by', panitiaId)
      .is('deleted_at', null);

    if (eventsError) {
      return next(new AppError(`Gagal mengambil statistik event: ${eventsError.message}`, 400));
    }

    const statsByStatus = {
      draft: 0,
      pending_verification: 0,
      published: 0,
      completed: 0,
      canceled: 0
    };

    if (!events || events.length === 0) {
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
          total_events: 0,
          total_participants: 0,
          stats_by_status: statsByStatus
        }
      });
    }

    const eventIds = events.map(event => event.id);

    events.forEach(event => {
      if (statsByStatus[event.status] !== undefined) {
        statsByStatus[event.status]++;
      }
    });

    // 2. Hitung total peserta terdaftar
    const { count: totalParticipants, error: regError } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .in('event_id', eventIds);

    if (regError) {
      return next(new AppError(`Gagal mengambil statistik peserta: ${regError.message}`, 400));
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
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
    const statuses = ['draft', 'pending_verification', 'published', 'completed', 'canceled'];

    // MENJALANKAN SELURUH QUERY SECARA PARALEL DENGAN PROMISE.ALL
    const [
      { count: totalUsers, error: userErr },
      { count: totalMahasiswa },
      { count: totalPanitia },
      { count: totalEvents, error: eventErr },
      { count: totalRegistrations, error: regErr },
      ...statusCounts // Hasil count per status event
    ] = await Promise.all([
      // 1. Query Users
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'mahasiswa'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'panitia'),
      
      // 2. Query Total Events
      supabase.from('events').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      
      // 3. Query Total Registrations
      supabase.from('registrations').select('id', { count: 'exact', head: true }),
      
      // 4. Query Events Per Status (Paralel untuk 5 status)
      ...statuses.map(status =>
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('status', status)
          .is('deleted_at', null)
      )
    ]);

    // Handle Error dari query utama jika ada
    if (userErr) return next(new AppError(`Gagal mengambil data user: ${userErr.message}`, 400));
    if (eventErr) return next(new AppError(`Gagal mengambil data event: ${eventErr.message}`, 400));
    if (regErr) return next(new AppError(`Gagal mengambil data registrasi: ${regErr.message}`, 400));

    // Menyusun objek eventsByStatus dari hasil Promise.all
    const eventsByStatus = {};
    statuses.forEach((status, index) => {
      eventsByStatus[status] = statusCounts[index].count || 0;
    });

    res.status(200).json({
      status: 'success',
      statusCode: 200,
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