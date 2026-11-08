const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.resolve(__dirname, '../x/REFERENCIAS/playwright-audit');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('🚀 Iniciando Auditoría Visual con Playwright...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  
  // 1. DESKTOP (1440 x 900)
  console.log('📱 1. Auditing Desktop (1440x900)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();

  // Admin Table View
  await desktopPage.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle' });
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '01-admin-desktop-table.png'), fullPage: false });
  console.log('✅ Screenshot: 01-admin-desktop-table.png');

  // Admin Cards View
  await desktopPage.click('button:has-text("Modo Tarjetas")');
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '02-admin-desktop-cards.png'), fullPage: false });
  console.log('✅ Screenshot: 02-admin-desktop-cards.png');

  // Open Module Drawer
  await desktopPage.click('button:has-text("Modo Tabla")');
  await desktopPage.waitForTimeout(300);
  await desktopPage.click('button:has-text("Módulos")');
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '03-admin-desktop-module-drawer.png'), fullPage: false });
  console.log('✅ Screenshot: 03-admin-desktop-module-drawer.png');

  // Client Dashboard (Ecuaplac)
  await desktopPage.goto('http://127.0.0.1:5173/app/ecuaplac', { waitUntil: 'networkidle' });
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '04-client-desktop-dashboard.png'), fullPage: false });
  console.log('✅ Screenshot: 04-client-desktop-dashboard.png');

  // Client Gallery Manager
  await desktopPage.goto('http://127.0.0.1:5173/app/ecuaplac/galerias', { waitUntil: 'networkidle' });
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '05-client-desktop-gallery.png'), fullPage: false });
  console.log('✅ Screenshot: 05-client-desktop-gallery.png');

  // Open Upload Photo Modal
  await desktopPage.click('button:has-text("Subir Nueva Fotografía")');
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '06-client-desktop-gallery-modal.png'), fullPage: false });
  console.log('✅ Screenshot: 06-client-desktop-gallery-modal.png');

  await desktopContext.close();

  // 2. TABLET (768 x 1024 - iPad Vertical)
  console.log('📱 2. Auditing Tablet (768x1024)...');
  const tabletContext = await browser.newContext({
    viewport: { width: 768, height: 1024 },
  });
  const tabletPage = await tabletContext.newPage();

  await tabletPage.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle' });
  await tabletPage.screenshot({ path: path.join(OUTPUT_DIR, '07-admin-tablet.png'), fullPage: false });
  console.log('✅ Screenshot: 07-admin-tablet.png');

  await tabletPage.goto('http://127.0.0.1:5173/app/ecuaplac', { waitUntil: 'networkidle' });
  await tabletPage.screenshot({ path: path.join(OUTPUT_DIR, '08-client-tablet-dashboard.png'), fullPage: false });
  console.log('✅ Screenshot: 08-client-tablet-dashboard.png');

  await tabletPage.goto('http://127.0.0.1:5173/app/ecuaplac/galerias', { waitUntil: 'networkidle' });
  await tabletPage.screenshot({ path: path.join(OUTPUT_DIR, '09-client-tablet-gallery.png'), fullPage: false });
  console.log('✅ Screenshot: 09-client-tablet-gallery.png');

  await tabletContext.close();

  // 3. MOBILE (390 x 844 - iPhone)
  console.log('📱 3. Auditing Mobile (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Admin Mobile
  await mobilePage.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '10-admin-mobile-table.png'), fullPage: false });
  console.log('✅ Screenshot: 10-admin-mobile-table.png');

  await mobilePage.click('button:has-text("Modo Tarjetas")');
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '11-admin-mobile-cards.png'), fullPage: false });
  console.log('✅ Screenshot: 11-admin-mobile-cards.png');

  // Client Dashboard Mobile
  await mobilePage.goto('http://127.0.0.1:5173/app/ecuaplac', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '12-client-mobile-dashboard.png'), fullPage: false });
  console.log('✅ Screenshot: 12-client-mobile-dashboard.png');

  // Client Gallery Mobile
  await mobilePage.goto('http://127.0.0.1:5173/app/ecuaplac/galerias', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '13-client-mobile-gallery.png'), fullPage: false });
  console.log('✅ Screenshot: 13-client-mobile-gallery.png');

  await mobileContext.close();
  await browser.close();

  console.log('🎉 Auditoría Playwright finalizada con éxito. 13 capturas generadas.');
}

runAudit().catch((err) => {
  console.error('❌ Error en auditoría:', err);
  process.exit(1);
});
