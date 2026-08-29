import { expect, test } from '@playwright/test';

const users = {
  admin: { id: 'admin-1', nama: 'Admin Platform', email: 'admin@kampus.ac.id', role: 'admin' },
  panitia: { id: 'panitia-1', nama: 'Panitia BEM', email: 'panitia@kampus.ac.id', role: 'panitia', organization_name: 'BEM Kampus' },
  mahasiswa: { id: 'student-1', nama: 'Mahasiswa Test', email: 'student@student.kampus.ac.id', role: 'mahasiswa' },
};

const mockEvent = {
  id: 'event-int-1',
  title: 'Integration Test Event',
  category: 'Technology',
  event_date: '2026-10-10T09:00:00.000Z',
  location: 'Auditorium Utama',
  speaker: 'Pakar Integrasi',
  quota: 100,
  description: 'Event testing flow mahasiswa panitia admin.',
  status: 'pending_verification',
  peserta: 0,
  users: { nama: 'Panitia BEM', organization_name: 'BEM Kampus' },
};

async function authenticateAs(page, role) {
  await page.addInitScript(({ user }) => {
    localStorage.setItem('token', 'e2e-token-integration');
    localStorage.setItem('user', JSON.stringify(user));
  }, { user: users[role] });
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'success', data: users[role] }),
  }));
}

test.describe('End-to-End Integration Flow', () => {
  test('Flow: Panitia Create -> Admin Verify -> Mahasiswa Daftar -> Panitia Absensi', async ({ page }) => {
    // ---------------------------------------------------------
    // 1. Panitia buat event -> Submit
    // ---------------------------------------------------------
    await authenticateAs(page, 'panitia');
    
    // Mock the GET managed events
    await page.route('**/api/v1/events/manage', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: [] }), // Empty initially
    }));

    let createEventPayload;
    await page.route('**/api/v1/panitia/events', async (route) => {
      createEventPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          message: 'Draft event berhasil diajukan.',
          data: mockEvent,
        }),
      });
    });

    await page.goto('/panitia/dashboard');
    await page.getByRole('button', { name: '+ Buat Draft Event Baru' }).click();
    
    await page.getByPlaceholder('mis. Seminar Nasional Generative AI 2026').fill('Integration Test Event');
    await page.getByPlaceholder('100').fill('100');
    await page.getByRole('textbox', { name: /Lokasi/ }).fill('Auditorium Utama');
    await page.locator('input[type="date"]').fill('2026-10-10');
    await page.locator('input[type="time"]').fill('09:00');
    await page.locator('textarea').fill('Event testing flow mahasiswa panitia admin.');
    await page.getByPlaceholder('mis. Budi Rahardjo (AI Expert)').fill('Pakar Integrasi');
    
    await page.getByRole('button', { name: 'Simpan Draft Event' }).click();

    // Assert Payload API Mismatch / Integration Validation
    await expect.poll(() => createEventPayload).toBeTruthy();
    expect(createEventPayload.title).toBe('Integration Test Event');
    expect(typeof createEventPayload.quota).toBe('number'); // Ensure type mismatch doesn't occur (number, not string)
    expect(createEventPayload.quota).toBe(100);
    expect(createEventPayload.event_date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/); // Valid ISO Date

    await expect(page.getByText('Integration Test Event')).toBeVisible();

    // ---------------------------------------------------------
    // 2. Admin Verify
    // ---------------------------------------------------------
    await authenticateAs(page, 'admin');
    
    await page.route('**/api/v1/admin/events*', (route) => {
      const status = new URL(route.request().url()).searchParams.get('status');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: status === 'pending_verification' ? [mockEvent] : [],
        }),
      });
    });

    let verifyPayload;
    await page.route('**/api/v1/admin/events/event-int-1/verify', async (route) => {
      verifyPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: { ...mockEvent, status: 'published' },
        }),
      });
    });

    await page.goto('/admin/verify');
    await page.getByRole('button', { name: /Tinjau/ }).click();
    await page.getByRole('button', { name: /Setujui & Publikasikan Event/ }).click();

    // Assert Payload API Mismatch
    await expect.poll(() => verifyPayload).toBeTruthy();
    expect(verifyPayload.action).toBe('approve');

    // ---------------------------------------------------------
    // 3. Mahasiswa Daftar
    // ---------------------------------------------------------
    await authenticateAs(page, 'mahasiswa');
    
    await page.route('**/api/v1/events*', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [{ ...mockEvent, status: 'published' }],
      }),
    }));

    let registrationPayload;
    await page.route('**/api/v1/events/*/register', async (route) => {
      // The frontend sends POST request without body for registration, relying on URL param
      registrationPayload = route.request().postDataJSON() || {};
      registrationPayload.url = route.request().url();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Registrasi berhasil' }),
      });
    });

    await page.goto('/');
    
    // Tunggu sampai event hasil fetch muncul, fallback timeout dinaikkan
    await page.getByText('Integration Test Event').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByText('Integration Test Event').click();
    await page.getByRole('button', { name: '🎟️ Daftar Event Sekarang' }).click();

    // Verify registration API was hit with the new endpoint
    await expect.poll(() => registrationPayload).toBeTruthy();
    expect(registrationPayload.url).toContain('/events/event-int-1/register');

    await expect(page.getByText(/Berhasil mendaftar event/)).toBeVisible({ timeout: 5000 });

    // ---------------------------------------------------------
    // 4. Panitia Mark Attendance
    // ---------------------------------------------------------
    await authenticateAs(page, 'panitia');
    
    await page.route('**/api/v1/events/manage', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: [{ ...mockEvent, status: 'published' }] }),
    }));

    await page.route('**/api/v1/events/event-int-1/participants', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [{ registration_id: 'reg-1', student_name: 'Mahasiswa Test', student_email: 'student@student.kampus.ac.id', is_present: false }]
      }),
    }));

    let attendancePayload;
    await page.route('**/api/v1/attendance/reg-1', async (route) => {
      attendancePayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: { id: 'att-1', is_present: attendancePayload.is_present }
        }),
      });
    });

    await page.goto('/panitia/dashboard');
    await page.getByRole('button', { name: '👥 Absensi' }).click();
    await page.getByText('Tandai Hadir').click();

    // Assert Payload API Mismatch
    await expect.poll(() => attendancePayload).toBeTruthy();
    expect(typeof attendancePayload.is_present).toBe('boolean'); // Ensure boolean mismatch doesn't occur
    expect(attendancePayload.is_present).toBe(true);
    await expect(page.getByText('Batalkan')).toBeVisible(); // Button changed to Batalkan meaning present
  });
});
