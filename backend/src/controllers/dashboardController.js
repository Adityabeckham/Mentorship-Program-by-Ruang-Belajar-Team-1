const supabase = require('../config/supabase');
const AppError = require('../utils/appError');
const showcaseStore = require('../utils/showcaseStore');

// GET /panitia/dashboard/stats
exports.getPanitiaDashboardStats = async (req, res, next) => {
  try {
    const panitiaId = req.user.id;

    let dbEvents = [];
    let dbSuccess = false;

    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, status, created_by')
        .eq('created_by', panitiaId)
        .is('deleted_at', null);

      if (!error && Array.isArray(events)) {
        dbEvents = events;
        dbSuccess = true;
      }
    } catch (err) {}

    // If DB query succeeded, use exact DB events. Only combine fallback if DB failed completely.
    let combinedEvents = dbEvents;
    if (!dbSuccess) {
      const storeEvents = showcaseStore.events.filter((e) => e.created_by === panitiaId || panitiaId === 'a1b2c3d4-e5f6-4000-8000-000000000002');
      combinedEvents = [...dbEvents, ...storeEvents.filter((se) => !dbEvents.some((e) => e.id === se.id))];
    }

    const statsByStatus = {
      draft: 0,
      pending_verification: 0,
      published: 0,
      completed: 0,
      canceled: 0,
    };

    combinedEvents.forEach((event) => {
      if (statsByStatus[event.status] !== undefined) {
        statsByStatus[event.status]++;
      }
    });

    let totalParticipants = 0;
    const combinedEventIds = combinedEvents.map((e) => e.id);

    try {
      if (combinedEventIds.length > 0) {
        const { count } = await supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .in('event_id', combinedEventIds);
        if (count !== null && count !== undefined) totalParticipants = count;
      }
    } catch (err) {}

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      data: {
        total_events: combinedEvents.length,
        total_participants: totalParticipants,
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

    let totalUsers = 0;
    let totalMahasiswa = 0;
    let totalPanitia = 0;
    let totalEvents = 0;
    let totalRegistrations = 0;
    const eventsByStatus = {
      draft: 0,
      pending_verification: 0,
      published: 0,
      completed: 0,
      canceled: 0,
    };

    let dbSuccess = false;

    try {
      const [
        uRes, mRes, pRes, eRes, rRes, ...statusCounts
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

      if (!uRes.error && uRes.count !== null) {
        totalUsers = uRes.count;
        totalMahasiswa = mRes.count || 0;
        totalPanitia = pRes.count || 0;
        totalEvents = eRes.count || 0;
        totalRegistrations = rRes.count || 0;

        statuses.forEach((status, idx) => {
          eventsByStatus[status] = statusCounts[idx]?.count || 0;
        });

        dbSuccess = true;
      }
    } catch (err) {}

    // Only engage showcase store fallback if DB connection failed completely
    if (!dbSuccess) {
      const allStoreEvents = showcaseStore.events;
      totalEvents = allStoreEvents.length;
      statuses.forEach((status) => {
        eventsByStatus[status] = allStoreEvents.filter((e) => e.status === status).length;
      });
      totalRegistrations = showcaseStore.registrations.length;
      totalUsers = 12;
      totalMahasiswa = 7;
      totalPanitia = 3;
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      data: {
        total_users: totalUsers,
        total_mahasiswa: totalMahasiswa,
        total_panitia: totalPanitia,
        total_events: totalEvents,
        total_registrations: totalRegistrations,
        events_by_status: eventsByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};
