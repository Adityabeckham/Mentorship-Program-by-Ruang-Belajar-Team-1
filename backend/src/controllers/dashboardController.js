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

    if (eventsError) throw eventsError;

    const statsByStatus = {
      draft: 0,
      pending_verification: 0,
      published: 0,
      completed: 0,
      canceled: 0,
    };

    if (!events || events.length === 0) {
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: {
          total_events: 0,
          total_participants: 0,
          stats_by_status: statsByStatus,
        },
      });
    }

    events.forEach((event) => {
      if (statsByStatus[event.status] !== undefined) {
        statsByStatus[event.status]++;
      }
    });

    const eventIds = events.map((event) => event.id);

    // 2. Hitung total peserta terdaftar
    const { count: totalParticipants, error: regError } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .in('event_id', eventIds);

    if (regError) throw regError;

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      data: {
        total_events: events.length,
        total_participants: totalParticipants || 0,
        stats_by_status: statsByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /admin/dashboard/stats
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const statuses = ['draft', 'pending_verification', 'published', 'completed', 'canceled'];

    const [
      { count: totalUsers, error: uErr },
      { count: totalMahasiswa, error: mErr },
      { count: totalPanitia, error: pErr },
      { count: totalEvents, error: eErr },
      { count: totalRegistrations, error: rErr },
      ...statusCounts
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'mahasiswa'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'panitia'),
      supabase.from('events').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('registrations').select('id', { count: 'exact', head: true }),
      ...statuses.map((status) =>
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('status', status)
          .is('deleted_at', null)
      ),
    ]);

    if (uErr) throw uErr;
    if (eErr) throw eErr;
    if (rErr) throw rErr;

    const eventsByStatus = {};
    statuses.forEach((status, idx) => {
      eventsByStatus[status] = statusCounts[idx]?.count || 0;
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
        events_by_status: eventsByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};
