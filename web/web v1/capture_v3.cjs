const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  const outDir = path.resolve(__dirname, '../../x/REFERENCIAS/playwright-audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Capture Inicio Mobile
  await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-inicio-v3.png') });
  console.log('Captured ecuaplac-mobile-inicio-v3.png');

  // 1b. Scroll down on Inicio to capture Facturas (Escondiditas / Plegadas)
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-inicio-facturas-collapsed.png') });
  console.log('Captured ecuaplac-mobile-inicio-facturas-collapsed.png');

  // 1c. Click "Abrir Facturas" to expand the panel downwards
  const openFacturasBtn = page.locator('button:has-text("Abrir Facturas")');
  if (await openFacturasBtn.isVisible()) {
    await openFacturasBtn.click();
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 680));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-inicio-facturas-expanded.png') });
    console.log('Captured ecuaplac-mobile-inicio-facturas-expanded.png');
  }

  // 1d. Open Real Invoice Preview Modal (Click the eye)
  const viewInvoiceBtn = page.locator('button[title="Ver factura completa"]').first();
  if (await viewInvoiceBtn.isVisible()) {
    await viewInvoiceBtn.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-invoice-real-preview.png') });
    console.log('Captured ecuaplac-mobile-invoice-real-preview.png');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // 2. Open Leads Modal from KPI 3 compact button
  const leadsBtn = page.locator('button:has-text("Ver Bandeja")');
  if (await leadsBtn.isVisible()) {
    await leadsBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-leads-modal-v3.png') });
    console.log('Captured ecuaplac-mobile-leads-modal-v3.png');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // 3. Switch to Galería 1
  const galeria1Btn = page.locator('nav button:has-text("Galería 1")');
  if (await galeria1Btn.isVisible()) {
    await galeria1Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-galeria1-v3.png') });
    console.log('Captured ecuaplac-mobile-galeria1-v3.png');
  }

  // 3b. Switch to Galería 2
  const galeria2Btn = page.locator('nav button:has-text("Galería 2")');
  if (await galeria2Btn.isVisible()) {
    await galeria2Btn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-galeria2-v3.png') });
    console.log('Captured ecuaplac-mobile-galeria2-v3.png');
  }

  // 4. Switch to Ajustes
  const ajustesBtn = page.locator('nav button:has-text("Ajustes")');
  if (await ajustesBtn.isVisible()) {
    await ajustesBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-ajustes-v3.png') });
    console.log('Captured ecuaplac-mobile-ajustes-v3.png');

    // Scroll down in Ajustes to verify Sistema & Dispositivo and Next Tools isotype
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-ajustes-bottom-v3.png') });
    console.log('Captured ecuaplac-mobile-ajustes-bottom-v3.png');

    // Click on Actualizaciones to expand it
    const updatesBtn = page.locator('button:has-text("Actualizaciones")');
    if (await updatesBtn.isVisible()) {
      await updatesBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-ajustes-updates-expanded.png') });
      console.log('Captured ecuaplac-mobile-ajustes-updates-expanded.png');

      // Click Buscar actualizaciones
      const checkBtn = page.locator('button:has-text("Buscar actualizaciones")');
      if (await checkBtn.isVisible()) {
        await checkBtn.click();
        await page.waitForTimeout(1400); // Wait for simulated check to finish
        await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-ajustes-updates-checked.png') });
        console.log('Captured ecuaplac-mobile-ajustes-updates-checked.png');

        // Click Simular nueva v001
        const simulateBtn = page.locator('button:has-text("Simular nueva v001")');
        if (await simulateBtn.isVisible()) {
          await simulateBtn.click();
          await page.waitForTimeout(400);
          await page.screenshot({ path: path.join(outDir, 'ecuaplac-mobile-ajustes-updates-available.png') });
          console.log('Captured ecuaplac-mobile-ajustes-updates-available.png');
        }
      }
    }
  }

  // 5. Desktop screenshot (1280x800)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({ path: path.join(outDir, 'ecuaplac-desktop-inicio-v3.png') });
  console.log('Captured ecuaplac-desktop-inicio-v3.png');

  await browser.close();
  console.log('Done capturing all screenshots!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
