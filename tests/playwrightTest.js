// tests/playwrightTest.js
const { chromium } = require('playwright');

(async () => {
  // Launch a new browser instance
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to your application URL
  await page.goto('http://0.0.0.0:5000'); // Use 0.0.0.0 to bind correctly

  // Perform actions like clicking a button or filling a form
  await page.click('text=Some Button');
  const result = await page.textContent('.result-class');

  console.log('Result:', result);

  // Close the browser
  await browser.close();
})();
