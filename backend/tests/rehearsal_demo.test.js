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

describe('Task #66: Rehearsal Demo Simulation (Multi-Role Workflow)', () => {
  const jwtSecret = env.JWT_SECRET || 'supersecretjwtkey123';

  const adminToken = jwt.sign({ id: 'uuid-admin-1', role: 'admin', type: 'access' }, jwtSecret, { expiresIn: '1d' });
  const panitiaToken = jwt.sign({ id: 'uuid-panitia-1', role: 'panitia', type: 'access' }, jwtSecret, { expiresIn: '1d' });
  const mahasiswaToken = jwt.sign({ id: 'uuid-mahasiswa-1', role: 'mahasiswa', type: 'access' }, jwtSecret, { expiresIn: '1d' });

  let createdEventId;
  let registrationId;

  test('Phase 1.1: Panitia creates a new draft event', async () => {
    const res = await supertest(app)
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

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('draft');
    expect(res.body.data.title).toBe('Grand Rehearsal Seminar AI & Robotics 2026');

    createdEventId = res.body.data.id;
  });

  test('Phase 1.2: Panitia submits event for Admin verification', async () => {
    const res = await supertest(app)
      .patch('/api/v1/events/' + createdEventId + '/submit')
      .set('Authorization', 'Bearer ' + panitiaToken)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('pending_verification');
  });

  test('Phase 2.1: Admin reviews pending verifications and finds the submitted event', async () => {
    const res = await supertest(app)
      .get('/api/v1/admin/events')
      .set('Authorization', 'Bearer ' + adminToken);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);

    const pendingItem = res.body.data.find((e) => e.id === createdEventId);
    expect(pendingItem).toBeDefined();
    expect(pendingItem.status).toBe('pending_verification');
  });

  test('Phase 2.2: Admin approves the event transition to published', async () => {
    const res = await supertest(app)
      .patch('/api/v1/admin/events/' + createdEventId + '/verify')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ action: 'approve' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('published');
  });

  test('Phase 3.1: Mahasiswa views public catalog and verifies event presence', async () => {
    const res = await supertest(app).get('/api/v1/events');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);

    const publishedItem = res.body.data.find((e) => e.id === createdEventId);
    expect(publishedItem).toBeDefined();
    expect(publishedItem.status).toBe('published');
  });

  test('Phase 3.2: Mahasiswa registers for the published event', async () => {
    const res = await supertest(app)
      .post('/api/v1/events/' + createdEventId + '/register')
      .set('Authorization', 'Bearer ' + mahasiswaToken)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('registered');
    expect(res.body.data.event_id).toBe(createdEventId);

    registrationId = res.body.data.id;
  });

  test('Phase 3.3: Mahasiswa views digital tickets and asserts ticket presence', async () => {
    const res = await supertest(app)
      .get('/api/v1/registrations/me')
      .set('Authorization', 'Bearer ' + mahasiswaToken);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);

    const ticket = res.body.data.find((t) => t.registration_id === registrationId);
    expect(ticket).toBeDefined();
    expect(ticket.status).toBe('registered');
  });

  test('Phase 4.1: Panitia marks attendance for the registered Mahasiswa', async () => {
    const res = await supertest(app)
      .patch('/api/v1/attendance/' + registrationId)
      .set('Authorization', 'Bearer ' + panitiaToken)
      .send({ is_present: true });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.registration_id).toBe(registrationId);
    expect(res.body.data.is_present).toBe(true);
  });
});
