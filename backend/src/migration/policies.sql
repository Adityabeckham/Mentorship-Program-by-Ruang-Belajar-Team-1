-- ==============================================================================
-- 1. HELPER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ==============================================================================
-- 2. AKTIFKAN ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- 3. POLICIES: TABEL USERS
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin full access on users" ON public.users;
CREATE POLICY "Admin full access on users" 
ON public.users FOR ALL 
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');


-- ==============================================================================
-- 4. POLICIES: TABEL EVENTS
-- ==============================================================================
DROP POLICY IF EXISTS "Public/Mahasiswa can view published events" ON public.events;
CREATE POLICY "Public/Mahasiswa can view published events" 
ON public.events FOR SELECT 
USING (status::text = 'published' OR public.get_my_role() IN ('panitia', 'admin'));

DROP POLICY IF EXISTS "Panitia can create events" ON public.events;
CREATE POLICY "Panitia can create events" 
ON public.events FOR INSERT 
WITH CHECK (public.get_my_role() = 'panitia' AND auth.uid() = created_by);

DROP POLICY IF EXISTS "Panitia can manage own events" ON public.events;
CREATE POLICY "Panitia can manage own events" 
ON public.events FOR ALL 
USING (public.get_my_role() = 'panitia' AND auth.uid() = created_by)
WITH CHECK (public.get_my_role() = 'panitia' AND auth.uid() = created_by);

DROP POLICY IF EXISTS "Admin full access on events" ON public.events;
CREATE POLICY "Admin full access on events" 
ON public.events FOR ALL 
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');


-- ==============================================================================
-- 5. POLICIES: TABEL REGISTRATIONS
-- ==============================================================================
DROP POLICY IF EXISTS "Mahasiswa can register event" ON public.registrations;
CREATE POLICY "Mahasiswa can register event" 
ON public.registrations FOR INSERT 
WITH CHECK (public.get_my_role() = 'mahasiswa' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Mahasiswa can view own registrations" ON public.registrations;
CREATE POLICY "Mahasiswa can view own registrations" 
ON public.registrations FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Panitia can view registrations on their events" ON public.registrations;
CREATE POLICY "Panitia can view registrations on their events" 
ON public.registrations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = registrations.event_id 
    AND events.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admin full access on registrations" ON public.registrations;
CREATE POLICY "Admin full access on registrations" 
ON public.registrations FOR ALL 
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');


-- ==============================================================================
-- 6. POLICIES: TABEL ATTENDANCE
-- ==============================================================================
-- Mahasiswa melihat presensi miliknya lewat JOIN ke registrations
DROP POLICY IF EXISTS "Mahasiswa can view own attendance" ON public.attendance;
CREATE POLICY "Mahasiswa can view own attendance" 
ON public.attendance FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.registrations 
    WHERE registrations.id = attendance.registration_id 
    AND registrations.user_id = auth.uid()
  )
);

-- Panitia mengelola presensi peserta di event miliknya
DROP POLICY IF EXISTS "Panitia can manage attendance for their events" ON public.attendance;
CREATE POLICY "Panitia can manage attendance for their events" 
ON public.attendance FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.registrations r
    JOIN public.events e ON e.id = r.event_id
    WHERE r.id = attendance.registration_id 
    AND e.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.registrations r
    JOIN public.events e ON e.id = r.event_id
    WHERE r.id = attendance.registration_id 
    AND e.created_by = auth.uid()
  )
);

-- Admin Full Access
DROP POLICY IF EXISTS "Admin full access on attendance" ON public.attendance;
CREATE POLICY "Admin full access on attendance" 
ON public.attendance FOR ALL 
USING (public.get_my_role() = 'admin')
WITH CHECK (public.get_my_role() = 'admin');