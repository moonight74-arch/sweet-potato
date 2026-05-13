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

test.describe('상품', () => {
  test('상품 카드를 클릭하면 상세 페이지로 이동한다', async ({ page }) => {
    await page.goto('/')
    const firstCard = page.locator('a[href^="/products/"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10000 })
    await firstCard.click()
    await expect(page).toHaveURL(/\/products\/[a-z0-9-]+/)
  })

  test('상품 상세 페이지에 필수 정보가 표시된다', async ({ page }) => {
    await page.goto('/')
    const firstCard = page.locator('a[href^="/products/"]').first()
    await firstCard.click()
    // 로딩 완료 대기
    await expect(page.getByText('불러오는 중...')).not.toBeVisible({ timeout: 10000 })
    // 가격 표시 확인
    await expect(page.getByText('₩').first()).toBeVisible({ timeout: 10000 })
    // 찜하기 버튼
    await expect(page.locator('button', { hasText: '찜하기' })).toBeVisible()
    // 뒤로가기 버튼
    await expect(page.getByText('뒤로가기')).toBeVisible()
  })

  test('비로그인 상태에서 상품 등록 폼이 표시된다 (submit 시 로그인 요구)', async ({ page }) => {
    await page.goto('/products/new')
    // 폼은 누구나 볼 수 있음 (인증은 submit 시 확인)
    await expect(page.getByText('상품 등록')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[name="title"]')).toBeVisible()
  })

  test('로그인 후 상품 등록 페이지가 표시된다', async ({ page }) => {
    await login(page)
    await page.goto('/products/new')
    await expect(page.getByText('상품 등록')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('input[name="price"]')).toBeVisible()
  })

  test('상품 등록 시 필수 항목 미입력 시 알림이 뜬다', async ({ page }) => {
    await login(page)
    await page.goto('/products/new')
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('필수 항목')
      await dialog.accept()
    })
    await page.getByRole('button', { name: '등록하기' }).click()
  })

  test('상품 상세 페이지 버튼이 표시된다', async ({ page }) => {
    await login(page)
    await page.goto('/')
    const firstCard = page.locator('a[href^="/products/"]').first()
    await firstCard.click()
    // 로딩 완료 대기
    await expect(page.getByText('불러오는 중...')).not.toBeVisible({ timeout: 10000 })
    // 찜하기 버튼 항상 존재
    await expect(page.locator('button', { hasText: '찜하기' })).toBeVisible({ timeout: 5000 })
    // 본인 상품이면 수정/삭제, 남의 상품이면 채팅+구매 버튼
    const hasEditBtn = await page.getByRole('link', { name: '수정' }).isVisible()
    const hasChatBtn = await page.getByRole('button', { name: /채팅/ }).isVisible()
    const hasBuyBtn = await page.getByRole('link', { name: '바로 구매' }).isVisible()
    expect(hasEditBtn || hasChatBtn || hasBuyBtn).toBeTruthy()
  })
})
