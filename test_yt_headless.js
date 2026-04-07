const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Test loading index 0 directly
  await page.setContent(`
    <iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PLZG0CvngYU9ihzPO2JTRe17DQDUI0Z6vC&index=0" frameborder="0" allowfullscreen></iframe>
  `);

  await page.waitForTimeout(5000); // Wait for embed to load
  await page.screenshot({ path: 'yt_index_0.png' });

  // Test loading index 5 directly
  await page.setContent(`
    <iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PLZG0CvngYU9ihzPO2JTRe17DQDUI0Z6vC&index=5" frameborder="0" allowfullscreen></iframe>
  `);

  await page.waitForTimeout(5000); // Wait for embed to load
  await page.screenshot({ path: 'yt_index_5.png' });

  await browser.close();
})();
