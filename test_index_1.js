const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background: black;">
      <iframe width="100%" height="100vh" src="https://www.youtube.com/embed/videoseries?list=PLZG0CvngYU9ihzPO2JTRe17DQDUI0Z6vC" frameborder="0" allowfullscreen></iframe>
    </body>
    </html>
  `;
  await page.setContent(html);
  await page.waitForTimeout(3000); // give it time to load
  await page.screenshot({ path: `yt_index_none.png` });
  console.log(`Screenshot saved for index none`);

  await browser.close();
})();
