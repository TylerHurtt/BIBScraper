const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 25 });
  const page = await browser.newPage();
  await page.goto('https://www.builtinboston.com/salaries', {
    waitUntil: 'networkidle2',
  });

  await browser.close();
})();
