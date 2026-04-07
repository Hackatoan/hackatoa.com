const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');

  // Wait for the iframe to load
  await page.waitForSelector('#hero-yt-embed');
  const iframeSrc = await page.$eval('#hero-yt-embed', el => el.src);
  console.log('Iframe src:', iframeSrc);

  // Give it a couple of seconds to load the YouTube content
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'yt_screenshot.png' });
  await browser.close();
})();
