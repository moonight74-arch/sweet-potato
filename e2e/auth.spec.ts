import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'user1@test.com'
const TEST_PASSWORD = 'Test1234!'

test.describe('인증', () => {
  test('로그인 페이지가 로드된다', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: '고구마마켓' })).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()
  })

  test('회원가입 링크가 있다', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: '회원가입' })).toBeVisible()
    await page.getByRole('link', { name: '회원가입' }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('잘못된 비밀번호로 로그인 시 에러가 표시된다', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[name="email"]').fill(TEST_EMAIL)
    await page.locator('input[name="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible()
  })

  test('올바른 계정으로 로그인에 성공한다', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[name="email"]').fill(TEST_EMAIL)
    await page.locator('input[name="password"]').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page).toHaveURL('/', { timeout: 10000 })
    await expect(page.getByText('김고구마')).toBeVisible()
  })

  test('회원가입 페이지가 로드된다', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input[name="nickname"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="passwordConfirm"]')).toBeVisible()
    await expect(page.getByRole('button', { name: '회원가입' })).toBeVisible()
  })

  test('유효성 검사: 닉네임이 짧으면 에러가 표시된다', async ({ page }) => {
    await page.goto('/signup')
    await page.locator('input[name="nickname"]').fill('a')
    await page.locator('input[name="email"]').fill('test@test.com')
    await page.locator('input[name="password"]').fill('Test1234!')
    await page.locator('input[name="passwordConfirm"]').fill('Test1234!')
    await page.getByRole('button', { name: '회원가입' }).click()
    await expect(page.getByText('닉네임은 2자 이상')).toBeVisible()
  })

  test('유효성 검사: 비밀번호가 일치하지 않으면 에러가 표시된다', async ({ page }) => {
    await page.goto('/signup')
    await page.locator('input[name="nickname"]').fill('테스터')
    await page.locator('input[name="email"]').fill('test@test.com')
    await page.locator('input[name="password"]').fill('Test1234!')
    await page.locator('input[name="passwordConfirm"]').fill('다른비밀번호')
    await page.getByRole('button', { name: '회원가입' }).click()
    await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible()
  })
})