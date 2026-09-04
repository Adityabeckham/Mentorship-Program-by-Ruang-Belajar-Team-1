const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');
const supabase = require('../src/config/supabase');

// Mock Data Storage for End-to-End Simulation State Machine
const dbState = {
  users: [
    { id: 'uuid-admin-1', nama: 'Admin Platform', email: 'admin@kampus.ac.id', role: 'admin' },
    { id: 'uuid-panitia-1', nama: 'Panitia BEM Fasilkom', email: 'bem@kampus.ac.id', role: 'panitia', organization_name: 'BEM Fasilkom' },
    { id: 'uuid-mahasiswa-1', nama: 'Budi Santoso', email: 'budi@student.ac.id', role: 'mahasiswa' },
  ],
  events: [],
  registrations: [],
  attendance: [],
};

// Mock RPC Stored Procedure for Atomic Registration
supabase.rpc = async function (fnName, params) {
  if (fnName === 'register_to_event_atomic') {
    const event = dbState.events.find((e) => e.id === params.p_event_id);
    if (!event) return { data: null, error: { message: 'EVENT_NOT_FOUND' } };
    if (event.status !== 'published') return { data: null, error: { message: 'EVENT_NOT_PUBLISHED' } };

    const newReg = {
      id: 'uuid-registration-' + Math.random().toString(36).substring(7),
      event_id: params.p_event_id,
      user_id: params.p_user_id,
      status: 'registered',
      registered_at: new Date().toISOString(),
      events: event,
    };
    dbState.registrations.push(newReg);
    return { data: newReg, error: null };
  }
  return { data: null, error: null };
};

// Isolated Mock Supabase query builder
supabase.from = function (table) {
  const instance = {
    _filter: {},
    _updates: null,
    select: function (columns) {
      this._columns = columns;
      return this;
    },
    insert: function (records) {
      const inserted = records.map((rec) => ({
        id: 'uuid-' + table + '-' + Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
        status: table === 'events' ? 'draft' : (table === 'registrations' ? 'registered' : undefined),
        deleted_at: null,
        ...rec,
      }));
      dbState[table].push(...inserted);
      this._insertedItem = inserted[0];
      return this;
    },
    update: function (updates) {
      this._updates = updates;
      return this;
    },
    upsert: function (record, options) {
      const existing = dbState.attendance.find((a) => a.registration_id === record.registration_id);
      if (existing) {
        Object.assign(existing, record);
        this._upsertedItem = existing;
      } else {
        const newAtt = { id: 'uuid-attendance-' + Math.random().toString(36).substring(7), ...record };
        dbState.attendance.push(newAtt);
        this._upsertedItem = newAtt;
      }
      return this;
    },
    delete: function () {
      return this;
    },
    eq: function (field, value) {
      this._filter[field] = value;
      return this;
    },
    is: function (field, value) {
      this._filter[field] = value;
      return this;
    },
    order: function () { return this; },
    limit: function () { return this; },
    range: function () { return this; },
    maybeSingle: async function () {
      const items = dbState[table] || [];
      const match = items.find((item) => {
        return Object.keys(this._filter).every((k) => {
          if (this._filter[k] === null) return item[k] === null || item[k] === undefined;
          return item[k] === this._filter[k];
        });
      });
      return { data: match || null, error: null };
    },
    single: async function () {
      if (this._insertedItem) {
        const item = this._insertedItem;
        this._insertedItem = null;
        return { data: item, error: null };
      }
      if (this._upsertedItem) {
        const item = this._upsertedItem;
        this._upsertedItem = null;
        return { data: item, error: null };
      }
      if (this._updates && this._filter && this._filter.id) {
        const item = dbState[table].find((x) => x.id === this._filter.id);
        if (item) {
          Object.assign(item, this._updates);
          return { data: item, error: null };
        }
      }
      const items = dbState[table] || [];
      const match = items.find((item) => {
        return Object.keys(this._filter).every((k) => {
          if (this._filter[k] === null) return item[k] === null || item[k] === undefined;
          return item[k] === this._filter[k];
        });
      });
      return { data: match || null, error: null };
    },
    then: function (resolve) {
      let items = (dbState[table] || []).slice();
      if (this._filter) {
        items = items.filter((item) => {
          return Object.keys(this._filter).every((k) => {
            if (this._filter[k] === null) return item[k] === null || item[k] === undefined;
            return item[k] === this._filter[k];
          });
        });
      }

      if (this._updates) {
        items.forEach((item) => Object.assign(item, this._updates));
      }

      resolve({ data: items, count: items.length, error: null });
    },
  };
  return instance;
};

const app = require('../server');

async function runRehearsalDemo() {
  console.log('\n================================================================');
  console.log('🎭 STARTING TASK #66 REHEARSAL DEMO SIMULATION (3-ROLE WORKFLOW)');
  console.log('================================================================');

  const jwtSecret = env.JWT_SECRET || 'supersecretjwtkey123';

  // Generate Tokens for 3 Roles
  const adminToken = jwt.sign({ id: 'uuid-admin-1', role: 'admin', type: 'access' }, jwtSecret, { expiresIn: '1d' });
  const panitiaToken = jwt.sign({ id: 'uuid-panitia-1', role: 'panitia', type: 'access' }, jwtSecret, { expiresIn: '1d' });
  const mahasiswaToken = jwt.sign({ id: 'uuid-mahasiswa-1', role: 'mahasiswa', type: 'access' }, jwtSecret, { expiresIn: '1d' });

  // PHASE 1: PANITIA WORKFLOW
  console.log('\n🚩 [PHASE 1: PANITIA WORKFLOW]');
  console.log('1.1 Panitia creating new event (POST /api/v1/events)...');
  const createRes = await supertest(app)
    .post('/api/v1/events')
    .set('Authorization', 'Bearer ' + panitiaToken)
    .send({
      title: 'Grand Rehearsal Seminar AI & Robotics 2026',
      description: 'Simulasi event akbar BEM Fasilkom.',
      category: 'Teknologi',
      speaker: 'Prof. Dr. Ir. Agentic AI',
      location: 'Auditorium Utama Kampus',
      event_date: '2026-10-25T09:00:00.000Z',
      quota: 150,
    });

  console.log('   - Response Status:', createRes.status);
  console.log('   - Event ID:', createRes.body.data?.id);
  console.log('   - Event Status:', createRes.body.data?.status);
  if (createRes.status !== 201 || createRes.body.data?.status !== 'draft') {
    console.error('Validation Error Details:', createRes.body);
    throw new Error('Phase 1.1 Failed: Event creation status must be draft');
  }
  const createdEventId = createRes.body.data.id;
  console.log('   🟢 Phase 1.1 PASSED: Draft Event Created.');

  console.log('\n1.2 Panitia submitting event for Admin verification (PATCH /api/v1/events/' + createdEventId + '/submit)...');
  const submitRes = await supertest(app)
    .patch('/api/v1/events/' + createdEventId + '/submit')
    .set('Authorization', 'Bearer ' + panitiaToken)
    .send({});

  console.log('   - Response Status:', submitRes.status);
  console.log('   - Updated Status:', submitRes.body.data?.status);
  if (submitRes.status !== 200 || submitRes.body.data?.status !== 'pending_verification') {
    console.error('Submit Error Details:', submitRes.body);
    throw new Error('Phase 1.2 Failed: Event status must transition to pending_verification');
  }
  console.log('   🟢 Phase 1.2 PASSED: Event Submitted for Admin Verification.');

  // PHASE 2: ADMIN WORKFLOW
  console.log('\n🛡️ [PHASE 2: ADMIN WORKFLOW]');
  console.log('2.1 Admin reviewing pending verifications (GET /api/v1/admin/events)...');
  const adminListRes = await supertest(app)
    .get('/api/v1/admin/events')
    .set('Authorization', 'Bearer ' + adminToken);

  console.log('   - Response Status:', adminListRes.status);
  console.log('   - Pending Count:', adminListRes.body.total || adminListRes.body.data?.length);
  if (adminListRes.status !== 200) {
    throw new Error('Phase 2.1 Failed: Unable to fetch admin pending list');
  }
  console.log('   🟢 Phase 2.1 PASSED: Pending Events Retrieved.');

  console.log('\n2.2 Admin approving event (PATCH /api/v1/admin/events/' + createdEventId + '/verify)...');
  const verifyRes = await supertest(app)
    .patch('/api/v1/admin/events/' + createdEventId + '/verify')
    .set('Authorization', 'Bearer ' + adminToken)
    .send({ action: 'approve' });

  console.log('   - Response Status:', verifyRes.status);
  console.log('   - Verified Status:', verifyRes.body.data?.status);
  if (verifyRes.status !== 200 || verifyRes.body.data?.status !== 'published') {
    console.error('Verify Error Details:', verifyRes.body);
    throw new Error('Phase 2.2 Failed: Event status must transition to published');
  }
  console.log('   🟢 Phase 2.2 PASSED: Event Approved & Published.');

  // PHASE 3: MAHASISWA WORKFLOW
  console.log('\n🎓 [PHASE 3: MAHASISWA WORKFLOW]');
  console.log('3.1 Mahasiswa browsing public catalog (GET /api/v1/events)...');
  const catalogRes = await supertest(app).get('/api/v1/events');

  console.log('   - Response Status:', catalogRes.status);
  console.log('   - Total Published Events:', catalogRes.body.total || catalogRes.body.data?.length);
  if (catalogRes.status !== 200) {
    throw new Error('Phase 3.1 Failed: Catalog fetch failed');
  }
  console.log('   🟢 Phase 3.1 PASSED: Public Catalog Retrieved.');

  console.log('\n3.2 Mahasiswa registering for event (POST /api/v1/events/' + createdEventId + '/register)...');
  const registerRes = await supertest(app)
    .post('/api/v1/events/' + createdEventId + '/register')
    .set('Authorization', 'Bearer ' + mahasiswaToken)
    .send({});

  console.log('   - Response Status:', registerRes.status);
  console.log('   - Registration ID:', registerRes.body.data?.id);
  console.log('   - Registration Status:', registerRes.body.data?.status);
  if (registerRes.status !== 201 || registerRes.body.data?.status !== 'registered') {
    console.error('Registration Error Details:', registerRes.body);
    throw new Error('Phase 3.2 Failed: Registration failed');
  }
  const registrationId = registerRes.body.data.id;
  console.log('   🟢 Phase 3.2 PASSED: Mahasiswa Event Registration Success.');

  console.log('\n3.3 Mahasiswa viewing tickets (GET /api/v1/registrations/me)...');
  const myTicketsRes = await supertest(app)
    .get('/api/v1/registrations/me')
    .set('Authorization', 'Bearer ' + mahasiswaToken);

  console.log('   - Response Status:', myTicketsRes.status);
  console.log('   - Total Tickets:', myTicketsRes.body.data?.length);
  if (myTicketsRes.status !== 200) {
    throw new Error('Phase 3.3 Failed: Ticket retrieval failed');
  }
  console.log('   🟢 Phase 3.3 PASSED: Digital Ticket Verified.');

  // PHASE 4: PANITIA ATTENDANCE WORKFLOW
  console.log('\n📝 [PHASE 4: ATTENDANCE WORKFLOW]');
  console.log('4.1 Panitia marking attendance for registration ' + registrationId + ' (PATCH /api/v1/attendance/' + registrationId + ')...');
  const attendanceRes = await supertest(app)
    .patch('/api/v1/attendance/' + registrationId)
    .set('Authorization', 'Bearer ' + panitiaToken)
    .send({ is_present: true });

  console.log('   - Response Status:', attendanceRes.status);
  console.log('   - Attendance ID:', attendanceRes.body.data?.id);
  console.log('   - Attendance is_present:', attendanceRes.body.data?.is_present);
  if (attendanceRes.status !== 200 || attendanceRes.body.data?.is_present !== true) {
    console.error('Attendance Error Details:', attendanceRes.body);
    throw new Error('Phase 4.1 Failed: Attendance marking failed');
  }
  console.log('   🟢 Phase 4.1 PASSED: Presensi Kehadiran Verified.');

  console.log('\n================================================================');
  console.log('🎉 REHEARSAL DEMO SIMULATION COMPLETED WITH 100% SUCCESS!');
  console.log('================================================================\n');

  process.exit(0);
}

runRehearsalDemo().catch((err) => {
  console.error('Rehearsal Demo Error:', err);
  process.exit(1);
});
