const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Try different indexes
  const indexes = [0, 1, 10, 100, 325, 326];
  for (const idx of indexes) {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; background: black;">
        <iframe width="100%" height="100vh" src="https://www.youtube.com/embed/videoseries?list=PLZG0CvngYU9ihzPO2JTRe17DQDUI0Z6vC&index=${idx}" frameborder="0" allowfullscreen></iframe>
      </body>
      </html>
    `;
    await page.setContent(html);
    await page.waitForTimeout(3000); // give it time to load
    await page.screenshot({ path: `yt_index_test_${idx}.png` });
    console.log(`Screenshot saved for index ${idx}`);
  }

  await browser.close();
})();
