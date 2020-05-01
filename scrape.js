const puppeteer = require('puppeteer');

async function scrapeWebpage(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const [el] = await page.$x('//*[@id="node-page-56400"]/div/div/div[2]/table[1]/tbody/tr/td[2]/ul/li[1]');
    const text = await el.getProperty('textContent');
    const name = await text.jsonValue();

    console.log({name});

    browser.close();
}

//scrapeWebpage("https://www.ice.gov/coronavirus")