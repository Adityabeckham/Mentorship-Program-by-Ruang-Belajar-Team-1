const crypto = require('crypto');

// Centralized In-Memory Real-Time State Store for Live Showcase Demo
const events = [
  {
    id: 'e1b2c3d4-e5f6-4000-8000-000000000001',
    title: 'Webinar National: Future of AI & Software Engineering',
    description: 'Pelajari tren terbaru kecerdasan buatan dan pengembangan perangkat lunak modern bersama praktisi industri.',
    category: 'Webinar',
    speaker: 'Dr. Tech Enthusiast',
    banner_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    location: 'Auditorium Utama & Zoom Meeting',
    event_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    quota: 250,
    status: 'published',
    created_by: 'a1b2c3d4-e5f6-4000-8000-000000000002',
    created_at: new Date().toISOString(),
  },
  {
    id: 'e1b2c3d4-e5f6-4000-8000-000000000002',
    title: 'Workshop Fullstack: Building Scale Apps with React & Node.js',
    description: 'Hands-on coding workshop membangun aplikasi fullstack modern dengan performa tinggi.',
    category: 'Workshop',
    speaker: 'Ruang Belajar Mentors',
    banner_image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    location: 'Lab Komputer 3, Gedung Filkom',
    event_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    quota: 100,
    status: 'published',
    created_by: 'a1b2c3d4-e5f6-4000-8000-000000000002',
    created_at: new Date().toISOString(),
  },
  {
    id: 'e1b2c3d4-e5f6-4000-8000-000000000003',
    title: 'National Hackathon & Coding Competition 2026',
    description: 'Kompetisi pemrograman tingkat nasional untuk mahasiswa seluruh Indonesia dengan total hadiah 20 Juta Rupiah.',
    category: 'Lomba',
    speaker: 'Tim Juri Tech Kampus',
    banner_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    location: 'Aula Kemahasiswaan',
    event_date: new Date(Date.now() + 86400000 * 10).toISOString(),
    quota: 50,
    status: 'pending_verification',
    created_by: 'a1b2c3d4-e5f6-4000-8000-000000000002',
    created_at: new Date().toISOString(),
  },
  {
    id: 'e1b2c3d4-e5f6-4000-8000-000000000004',
    title: 'Seminar Karir & Networking Night 2026',
    description: 'Persiapkan karir impianmu di bidang teknologi melalui sesi sharing resume dan networking.',
    category: 'Seminar',
    speaker: 'HR Lead Career Kampus',
    banner_image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    location: 'Gedung Rektorat Lt. 4',
    event_date: new Date(Date.now() + 86400000 * 14).toISOString(),
    quota: 150,
    status: 'published',
    created_by: 'a1b2c3d4-e5f6-4000-8000-000000000002',
    created_at: new Date().toISOString(),
  },
];

const registrations = [
  {
    id: 'r1b2c3d4-e5f6-4000-8000-000000000001',
    event_id: 'e1b2c3d4-e5f6-4000-8000-000000000001',
    user_id: 'a1b2c3d4-e5f6-4000-8000-000000000003',
    ticket_code: 'TKT-AI-2026',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TKT-AI-2026',
    status: 'registered',
    is_present: false,
    registered_at: new Date().toISOString(),
  },
];

const addRegistration = (reg) => {
  registrations.unshift(reg);
};

const getRegistrationsForUser = (userId) => {
  return registrations.filter((r) => r.user_id === userId || !userId);
};

const addEvent = (evt) => {
  events.unshift(evt);
};

const getEvents = () => events;

const updateEventStatus = (id, status) => {
  const evt = events.find((e) => e.id === id);
  if (evt) evt.status = status;
  return evt;
};

module.exports = {
  events,
  registrations,
  addRegistration,
  getRegistrationsForUser,
  addEvent,
  getEvents,
  updateEventStatus,
};
