/**
 * Kiểm tra nhanh bằng trình duyệt thật: đăng nhập, mở hết các trang, bắt lỗi JS.
 * Chạy: npm run smoke   (cần server đang chạy ở http://127.0.0.1:8000)
 */
import { chromium } from 'playwright'

const BASE = process.env.CMS_URL || 'http://127.0.0.1:8000'
const EMAIL = process.env.CMS_EMAIL || 'admin@showbiz.local'
const PASSWORD = process.env.CMS_PASSWORD || 'showbiz2026'

const PAGES = [
  ['/', 'Tổng quan'], ['/videos', 'Video'], ['/publishing', 'Đăng bài'],
  ['/accounts', 'Kênh TikTok'], ['/engines', 'Engine tạo video'],
  ['/logs', 'Nhật ký'], ['/settings', 'Cài đặt'], ['/profile', 'Tài khoản của tôi'],
]

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } })
const errors = []
page.on('pageerror', (e) => errors.push(`${page.url()} → ${e.message}`))

await page.goto(`${BASE}/login`)
await page.fill('#email', EMAIL)
await page.fill('#pw', PASSWORD)
await page.click('button:has-text("Đăng nhập")')

// Bật 2FA thì dừng ở bước nhập mã — coi như đạt, không tự vượt qua được.
if (await page.locator('#code').count()) {
  console.log('⚠ Tài khoản đang bật 2FA, dừng ở bước nhập mã (đúng như mong đợi).')
  await browser.close()
  process.exit(0)
}

await page.waitForURL(`${BASE}/`, { timeout: 15000 })

for (const [path, title] of PAGES) {
  await page.goto(BASE + path)
  await page.waitForTimeout(700)
  const heading = await page.locator('h1').first().textContent()
  const ok = heading?.trim() === title
  console.log(`${ok ? '✓' : '✗'} ${path.padEnd(14)} ${heading?.trim()}`)
  if (!ok) errors.push(`${path}: tiêu đề là "${heading?.trim()}", mong đợi "${title}"`)
}

await browser.close()
if (errors.length) {
  console.error('\nLỗi:\n' + errors.map((e) => '  · ' + e).join('\n'))
  process.exit(1)
}
console.log('\n✓ Tất cả các trang tải được, không có lỗi JS.')
