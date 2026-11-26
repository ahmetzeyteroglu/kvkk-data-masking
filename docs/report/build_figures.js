// Şekil HTML dosyalarını PNG'ye çevirir: node docs/report/build_figures.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const dir = path.join(__dirname, 'figures');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1150, height: 800 }, deviceScaleFactor: 2 });
  for (const f of fs.readdirSync(dir).filter(f => f.startsWith('sekil') && f.endsWith('.html'))) {
    await page.goto('file://' + path.join(dir, f));
    await page.waitForTimeout(150);
    const body = await page.$('body');
    await body.screenshot({ path: path.join(dir, f.replace('.html', '.png')) });
    console.log('ok', f);
  }
  await browser.close();
})();
