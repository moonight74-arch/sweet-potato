import { test, expect } from '@playwright/test'

test.describe('홈페이지', () => {
  test('메인 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/고구마마켓/)
    await expect(page.getByRole('link', { name: /고구마마켓/ })).toBeVisible()
  })

  test('상품 목록이 표시된다', async ({ page }) => {
    await page.goto('/')
    const cards = page.locator('a[href^="/products/"]')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('카테고리 필터 버튼이 표시되고 클릭하면 활성화된다', async ({ page }) => {
    await page.goto('/')
    const categoryBtn = page.getByRole('button', { name: '전자기기' })
    await expect(categoryBtn).toBeVisible({ timeout: 5000 })
    await categoryBtn.click()
    // 클릭 후 버튼이 주황색(활성) 스타일로 변경됨
    await expect(categoryBtn).toHaveClass(/bg-orange-500/)
  })

  test('검색 기능이 동작한다', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.locator('input[type="text"]').first()
    await searchInput.fill('노트북')
    await searchInput.press('Enter')
    await expect(page).toHaveURL(/q=/, { timeout: 5000 })
  })

  test('판매하기 버튼이 있다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('+ 판매하기')).toBeVisible()
  })

  test('로그인 링크가 있다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible()
  })
})
