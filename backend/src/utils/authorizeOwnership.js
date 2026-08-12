const supabase = require('../config/supabase');

/**
 * Memastikan event ada, belum di-soft delete, dan dimiliki oleh panitia yang sedang login.
 * Jika req.user.role === 'admin', pengecekan kepemilikan dilewati (Full Access).
 */
const verifyEventOwnership = async (eventId, userId, userRole) => {
  const query = supabase
    .from('events')
    .select('id, created_by, status')
    .eq('id', eventId)
    .is('deleted_at', null);

  // Jika role adalah panitia, wajib filter berdasarkan created_by
  if (userRole === 'panitia') {
    query.eq('created_by', userId);
  }

  const { data: event, error } = await query.single();

  if (error || !event) {
    return { isOwner: false, event: null };
  }

  return { isOwner: true, event };
};

module.exports = { verifyEventOwnership };