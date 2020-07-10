const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false /*slowMo: 250*/ });
  const page = await browser.newPage();
  await page.goto('https://www.builtinboston.com/salaries', {
    waitUntil: 'networkidle2',
  });

  const submitBtn = await page.$('.submit-link');
  try {
    const categoryJobObject = {};
    const categoriesHandles = await page.$$('.facet-category .item');
    // console.log(categoriesHandles);
    function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const categories = await page.$$eval(
      '.facet-category .item',
      (categories) => {
        return categories.map((categoryHandle) => {
          category = categoryHandle.innerText;
          if (category.includes(' + '))
            return category.toLowerCase().split(' + ').join('-');
          else return category.toLowerCase().split(' ').join('-');
        });
      }
    );

    for (let i = 0; i < categoriesHandles.length; i++) {
      await page.click('.facet-category');
      await categoriesHandles[i].click();
      const jobs = await page.$$eval(
        '.facet-job_title .enabled .list-items .item',
        (jobTitles) => {
          return jobTitles.map((jobHandle) => {
            let job = jobHandle.innerText;
            if (job.includes('(')) {
              const beginning = job.slice(0, 4);
              const midpoint = job.indexOf('(') + 1;
              const end = job.slice(midpoint, -1);
              job = beginning + end;
            }
            return job.toLowerCase().split(' ').join('-');
          });
        }
      );
      jobs.forEach((job) => {
        if (categoryJobObject[categories[i]])
          categoryJobObject[categories[i]].push(job);
        else categoryJobObject[categories[i]] = [job];
      });
    }
    console.log(categoryJobObject);

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      console.log('scraping', category, 'category');
      for (let j = 0; j < categoryJobObject[category].length; j++) {
        const job = categoryJobObject[category][j];
        console.log('on', job, 'page');
        await page.goto(
          `https://www.builtinboston.com/salaries/${category}/${job}/boston`
        );
        // const avgBaseSalary = await page.$eval('.total', (element) =>
        //   parseInt(element.innerText.slice(1).split(',').join(''))
        // );
        // console.log('avgBaseSalary:', avgBaseSalary);
        // const minSalary = await page.$eval('.min', (element) =>
        //   parseInt(element.innerText.slice(6, -1) + '000')
        // );
        // console.log('minSalary:', minSalary);
        const medianSalary = await page.$eval('.median', (element) =>
          parseInt(element.innerText.slice(9, -1) + '000')
        );
        console.log('medianSalary:', medianSalary);
        const maxSalary = await page.$eval('.max', (element) =>
          parseInt(element.innerText.slice(6, -1) + '000')
        );
        console.log('maxSalary:', maxSalary);
        // const compensation = await page.$$eval('.value', (elements) => {
        //   const values = elements.map((element) =>
        //     parseInt(element.innerText.slice(1).split(',').join(''))
        //   );
        //   return values;
        // });
        // const cashCompensation = compensation[0];
        // const totalCompensation = compensation[1];
        // console.log('cashCompensation:', cashCompensation);
        // console.log('totalCompensation:', totalCompensation);
        // await page.waitFor(2000);
      }
    }
    await browser.close();
  } catch (error) {
    console.error(error.message);
    browser.close();
  }
})();
