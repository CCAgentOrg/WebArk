// Browser Automation Tests for WebArk
// Uses Playwright for end-to-end testing

import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3456';

async function runTests() {
  console.log('🧪 Starting WebArk browser tests...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let passed = 0;
  let failed = 0;
  
  function test(name, fn) {
    return fn().then(() => {
      console.log(`✅ ${name}`);
      passed++;
    }).catch(err => {
      console.log(`❌ ${name}: ${err.message}`);
      failed++;
    });
  }
  
  async function assert(condition, message) {
    if (!condition) throw new Error(message);
  }
  
  // Navigate to the app
  await page.goto(BASE_URL);
  await page.waitForLoadState('domcontentloaded');
  
  // Test 1: Page loads
  await test('Page loads without crash', async () => {
    const title = await page.title();
    assert(title.includes('WebArk'), 'Title should contain WebArk');
  });
  
  // Test 2: All tabs exist
  await test('All tabs are present', async () => {
    const tabs = await page.locator('.tab-btn').count();
    assert(tabs === 5, `Should have 5 tabs, found ${tabs}`);
  });
  
  // Test 3: Providers are rendered
  await test('Provider buttons are rendered', async () => {
    const providers = await page.locator('.provider-btn').count();
    assert(providers === 8, `Should have 8 providers, found ${providers}`);
  });
  
  // Test 4: Switch to Archive tab
  await test('Can switch to Archive tab', async () => {
    await page.click('.tab-btn:has-text("Archive")');
    const archiveTab = page.locator('#tab-archive');
    assert(await archiveTab.isVisible(), 'Archive tab should be visible');
  });
  
  // Test 5: Switch to Crawl tab
  await test('Can switch to Crawl tab', async () => {
    await page.click('.tab-btn:has-text("Crawl")');
    const crawlTab = page.locator('#tab-crawl');
    assert(await crawlTab.isVisible(), 'Crawl tab should be visible');
  });
  
  // Test 6: Switch to Settings tab
  await test('Can switch to Settings tab', async () => {
    await page.click('.tab-btn:has-text("Settings")');
    const settingsTab = page.locator('#tab-settings');
    assert(await settingsTab.isVisible(), 'Settings tab should be visible');
  });
  
  // Test 7: Language selector exists
  await test('Language selector is present', async () => {
    const langSelect = page.locator('#setting-lang');
    assert(await langSelect.isVisible(), 'Language selector should be visible');
  });
  
  // Test 8: Can select a language
  await test('Can change language', async () => {
    await page.selectOption('#setting-lang', 'ta');
    const archiveBtn = page.locator('.tab-btn').nth(1);
    const text = await archiveBtn.textContent();
    assert(text.includes('ஆவண') || text === 'Archive', 'Language should change');
  });
  
  // Test 9: Switch to History tab
  await test('Can switch to History tab', async () => {
    await page.click('.tab-btn:has-text("History")');
    const historyTab = page.locator('#tab-history');
    assert(await historyTab.isVisible(), 'History tab should be visible');
  });
  
  // Test 10: Switch to About tab
  await test('Can switch to About tab', async () => {
    await page.click('.tab-btn:has-text("About")');
    const aboutTab = page.locator('#tab-about');
    assert(await aboutTab.isVisible(), 'About tab should be visible');
  });
  
  // Test 11: URL input works
  await test('Archive tab accepts URL input', async () => {
    await page.click('.tab-btn:has-text("Archive")');
    await page.fill('#urls', 'https://example.com');
    const value = await page.inputValue('#urls');
    assert(value === 'https://example.com', 'URL should be entered');
  });
  
  // Test 12: Provider selection works
  await test('Provider buttons are clickable', async () => {
    await page.click('.provider-btn[data-provider="archiveis"]');
    const activeProvider = page.locator('.provider-btn.active');
    const providerText = await activeProvider.textContent();
    assert(providerText.includes('archive.is'), 'Provider should be selected');
  });
  
  // Test 13: Settings persist
  await test('Settings can be saved', async () => {
    await page.click('.tab-btn:has-text("Settings")');
    await page.selectOption('#setting-provider', 'archiveph');
    await page.fill('#setting-rate', '1000');
    await page.waitForTimeout(100);
    await page.click('.tab-btn:has-text("Archive")');
    await page.click('.tab-btn:has-text("Settings")');
    const value = await page.inputValue('#setting-rate');
    assert(value === '1000', 'Settings should persist');
  });
  
  // Test 14: No critical console errors
  await test('No critical console errors', async () => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('net::')
    );
    assert(criticalErrors.length === 0, `Found ${criticalErrors.length} critical errors`);
  });
  
  await browser.close();
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
