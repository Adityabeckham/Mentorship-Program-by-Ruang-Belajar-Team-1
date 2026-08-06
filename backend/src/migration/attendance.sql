CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID NOT NULL UNIQUE,
    is_present BOOLEAN NOT NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    checked_by UUID NOT NULL,
    
    CONSTRAINT fk_attendance_registration FOREIGN KEY (registration_id) 
        REFERENCES registrations(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_checked_by FOREIGN KEY (checked_by) 
        REFERENCES users(id) ON DELETE CASCADE
);