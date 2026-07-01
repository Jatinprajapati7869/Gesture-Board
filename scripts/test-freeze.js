import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  console.log('Navigating to http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });

  console.log('Setting localStorage...');
  await page.evaluate(() => {
    localStorage.setItem('gestureboard-settings', JSON.stringify({
      "state":{
        "mirrorCamera":false,
        "gestureSensitivity":"high",
        "showConfidence":false,
        "presentationCooldownMs":1500
      },
      "version":0
    }));
  });

  console.log('Reloading page...');
  try {
    await page.reload({ waitUntil: 'networkidle0', timeout: 5000 });
    console.log('Reload successful, no freeze detected.');
  } catch (err) {
    console.error('Reload failed or timed out! Freeze confirmed.', err);
    // Let's capture a profile or just stack trace
  }

  await browser.close();
})();
