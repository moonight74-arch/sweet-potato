import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'user1@test.com'
const TEST_PASSWORD = 'Test1234!'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(TEST_EMAIL)
  await page.locator('input[name="password"]').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: '로그인' }).click()
  await page.waitForURL('/')
}

test.describe('마이페이지', () => {
  test('비로그인 시 마이페이지 접근하면 로그인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/mypage')
    await page.waitForURL('/login', { timeout: 10000 })
  })

  test('로그인 후 마이페이지가 표시된다', async ({ page }) => {
    await login(page)
    await page.goto('/mypage')
    // 닉네임 텍스트 (프로필 카드 내 p 태그)
    await expect(page.locator('p.text-lg').filter({ hasText: '김고구마' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: '내 판매 상품' })).toBeVisible()
    await expect(page.getByRole('button', { name: '찜한 상품' })).toBeVisible()
  })

  test('마이페이지에서 등록 상품 수가 표시된다', async ({ page }) => {
    await login(page)
    await page.goto('/mypage')
    await expect(page.getByText('등록 상품')).toBeVisible({ timeout: 10000 })
  })

  test('찜한 상품 탭으로 전환된다', async ({ page }) => {
    await login(page)
    await page.goto('/mypage')
    await page.getByRole('button', { name: '찜한 상품' }).click()
    await expect(page.getByRole('button', { name: '찜한 상품' })).toHaveClass(/bg-orange-500/)
  })

  test('로그아웃 버튼이 있다', async ({ page }) => {
    await login(page)
    await page.goto('/mypage')
    await expect(page.getByRole('button', { name: '로그아웃' })).toBeVisible({ timeout: 10000 })
  })

  test('로그아웃 후 홈으로 이동한다', async ({ page }) => {
    await login(page)
    await page.goto('/mypage')
    await page.getByRole('button', { name: '로그아웃' }).click()
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible()
  })

  test('헤더에서 프로필 클릭하면 마이페이지로 이동한다', async ({ page }) => {
    await login(page)
    await page.getByText('김고구마').click()
    await expect(page).toHaveURL('/mypage')
  })
})
