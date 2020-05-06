const express = require('express')
const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');
const CronJob = require('cron').CronJob;

const app = express()
const port = 3000

app.use(express.static("public"));
app.use(express.static("data"));
app.set("view engine", "ejs");

app.get('/', function (req, res)
{
    res.render("icecovid");
});

async function scrapeICEPage()
{
    const array = [];
    const url = "https://www.ice.gov/coronavirus";
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    let i = 1;
    while(true) {
        try {
            const [el] = await page.$x('//*[@id="node-page-56400"]/div/div/div[2]/table[1]/tbody/tr/td[2]/ul/li[' + i + ']');
            const text = await el.getProperty('textContent');
            const name = await text.jsonValue();

            // extracting data
            const list = name.split(/\s+/);
            const num_detained = list[0];
            const state = list[list.length - 1].replace(")", "");
            const city = list[list.length - 2]
                .replace("(", "")
                .replace(",", "");

            const jail = list.slice(3, list.length - 2)
                .join(" ");

            const entry = {num_detained: num_detained, jail: jail, city: city, state: state};
            array.push(entry);
            i++;
        }
        catch (e) {
            break;
        }
    }

    browser.close();

    const csv = new ObjectsToCsv(array);
    await csv.toDisk('data/ice.csv', false);
}

const job = new CronJob({
    // Run at 07:44 EDT time, every day
    cronTime: '00 44 7 * * *',
    onTick: function() {
        // Run ICE scrape
        scrapeICEPage().then(r => console.log("Updated ICE data"));
    },
    start: true,
    timeZone: 'America/New_York'
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))