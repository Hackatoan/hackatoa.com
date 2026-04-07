const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(`
    <iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PLZG0CvngYU9ihzPO2JTRe17DQDUI0Z6vC" frameborder="0" allowfullscreen></iframe>
  `);

  await page.waitForTimeout(5000); // Wait for embed to load
  await page.screenshot({ path: 'yt_original.png' });

  await browser.close();
})();
