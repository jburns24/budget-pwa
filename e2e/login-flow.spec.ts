import { test, expect } from '@playwright/test'

// These tests run against the dev server (npm run dev) which has VITE_USE_FAKE_AUTH=true.
// Real Google OAuth E2E is deferred until a Supabase cloud project is configured.

test('boots into the protected home with fake auth', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Budget' })).toBeVisible()
  await expect(page.getByText(/Dev User/)).toBeVisible()
})

test('sign out redirects to the login page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible()
})

test('sign in from login page navigates home', async ({ page }) => {
  // Start at login (force sign out state by navigating directly with cleared storage)
  await page.goto('/login')
  // On the fake auth provider, visiting /login while authed triggers a redirect —
  // wait for it to settle, then sign out to reach the real login state
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login/)

  await page.getByRole('button', { name: 'Sign in with Google' }).click()
  await expect(page.getByRole('heading', { name: 'Budget' })).toBeVisible()
  await expect(page.getByText(/Dev User/)).toBeVisible()
})
