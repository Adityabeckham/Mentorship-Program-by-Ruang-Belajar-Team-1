-- ==============================================================================
-- DATABASE INDEXES FOR PERFORMANCE & QUERY SCALABILITY
-- ==============================================================================

-- Index untuk pencarian & filtering event publik berstatus 'published' berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events (status, event_date);

-- Index untuk pencarian event buatan panitia
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events (created_by);

-- Index untuk pencarian riwayat pendaftaran event milik mahasiswa
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations (user_id);

-- Index untuk pencarian daftar peserta per event
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations (event_id);

-- Index untuk pencarian data presensi berdasarkan pendaftaran
CREATE INDEX IF NOT EXISTS idx_attendance_registration_id ON public.attendance (registration_id);
