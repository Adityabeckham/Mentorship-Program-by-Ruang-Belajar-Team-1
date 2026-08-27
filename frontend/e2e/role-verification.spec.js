import { expect, test } from '@playwright/test';

const users = {
  admin: { id: 'admin-1', nama: 'Admin Platform', email: 'admin@kampus.ac.id', role: 'admin' },
  panitia: { id: 'panitia-1', nama: 'Panitia BEM', email: 'panitia@kampus.ac.id', role: 'panitia' },
  mahasiswa: { id: 'student-1', nama: 'Mahasiswa', email: 'student@student.kampus.ac.id', role: 'mahasiswa' },
};

const pendingEvent = {
  id: 'event-1',
  title: 'Workshop React Kampus',
  description: 'Workshop frontend untuk mahasiswa.',
  event_date: '2026-09-15T09:00:00.000Z',
  location: 'Lab Komputer 3',
  speaker: 'Dosen Tamu',
  quota: 50,
  status: 'pending_verification',
  users: { nama: 'Panitia BEM', organization_name: 'BEM Kampus' },
};

async function authenticateAs(page, role) {
  await page.addInitScript(({ user }) => {
    localStorage.setItem('token', 'e2e-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, { user: users[role] });
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'success', data: users[role] }),
  }));
}

async function mockAdminEvents(page) {
  await page.route('**/api/v1/admin/events*', (route) => {
    const status = new URL(route.request().url()).searchParams.get('status');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: status === 'pending_verification' ? [pendingEvent] : [],
      }),
    });
  });
}

test.describe('role-based routing', () => {
  test('admin is redirected to the admin dashboard', async ({ page }) => {
    await authenticateAs(page, 'admin');
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
  });

  test('panitia is redirected to the panitia dashboard', async ({ page }) => {
    await authenticateAs(page, 'panitia');
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/panitia\/dashboard$/);
  });

  test('mahasiswa cannot open the admin verification page', async ({ page }) => {
    await authenticateAs(page, 'mahasiswa');
    await page.goto('/admin/verify');
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe('admin verification workflow', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page, 'admin');
    await mockAdminEvents(page);
  });

  test('opens the review modal and approves a pending event', async ({ page }) => {
    let requestBody;
    await page.route('**/api/v1/admin/events/event-1/verify', async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          message: 'Event berhasil dipublikasikan.',
          data: { id: 'event-1', status: 'published' },
        }),
      });
    });

    await page.goto('/admin/verify');
    await page.getByRole('button', { name: /Tinjau/ }).click();
    await expect(page.getByText('Tinjauan Pengajuan Event')).toBeVisible();
    await page.getByRole('button', { name: /Setujui & Publikasikan Event/ }).click();

    await expect.poll(() => requestBody).toEqual({ action: 'approve' });
    await expect(page.getByText('✅ DISERTAI / PUBLISHED')).toBeVisible();
  });

  test('requires a rejection reason and submits it from the modal', async ({ page }) => {
    let requestBody;
    await page.route('**/api/v1/admin/events/event-1/verify', async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          message: 'Event telah ditolak.',
          data: { id: 'event-1', status: 'rejected', rejection_reason: requestBody.rejection_reason },
        }),
      });
    });

    await page.goto('/admin/verify');
    await page.getByRole('button', { name: /Tinjau/ }).click();
    await page.getByRole('button', { name: /Tolak Pengajuan Event/ }).click();
    const submitButton = page.getByRole('button', { name: 'Tolak Event' });
    await expect(submitButton).toBeDisabled();
    await page.locator('.modal-content textarea').fill('Tanggal bentrok dengan agenda kampus.');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect.poll(() => requestBody).toEqual({
      action: 'reject',
      rejection_reason: 'Tanggal bentrok dengan agenda kampus.',
    });
    await expect(page.getByText('Alasan Penolakan:')).toBeVisible();
  });
});
