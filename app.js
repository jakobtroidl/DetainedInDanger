const express = require('express')
const puppeteer = require('puppeteer');
const csv_loader = require('csv-load-sync');
const csv_writer = require('objects-to-csv');
const CronJob = require('cron').CronJob;

const app = express();
const port = 5000;

app.use(express.static("public"));
app.use(express.static("data"));
app.set("view engine", "ejs");

let data = csv_loader('data/dailydetentioncases.csv');

app.get('/', function (req, res)
{
    let keys = Object.keys(data[0]);
    let latestUpdate = new Date(keys[keys.length - 1]);
    const day = latestUpdate.getDate();
    const month = latestUpdate.toLocaleString('default', { month: 'long' });
    const year = latestUpdate.getFullYear();
    let out = month + " " + day + " " + year;

    res.render("index", {latestUpdate: out});
});

async function scrapeICEPage()
{
    const array = [];
    const url = "https://www.ice.gov/coronavirus";
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    let i = 1;
    let terminate = false;
    while(!terminate) {
        try {
            const [el] = await page.$x('//*[@id="node-page-56400"]/div/div/div[2]/table[1]/tbody/tr/td[2]/ul/li[' + i + ']');
            const text = await el.getProperty('textContent');
            const name = await text.jsonValue();

            // extracting data
            const list = name.split(/\s+/);
            const cases = list[0];

            // find end of jail name
            let idx;
            for (let j = 0; j < list.length; j++){
                if (list[j].includes("(")){
                    idx = j;
                }
            }
            const jail = list.slice(3, idx).join(" ");

            const entry = {infections: cases, jail: jail};
            array.push(entry);
            i++;
        }
        catch (e) {
            terminate = true;
        }
    }

    // scrape number of tests
    const [el_tests] = await page.$x('//*[@id="node-page-56400"]/div/div/div[2]/table[1]/tbody/tr/td[1]/div[4]');
    const text_tests = await el_tests.getProperty('textContent');
    const name_tests = await text_tests.jsonValue();

    let number_tests = name_tests.replace(",", "");

    // scrape number of people detained
    const [el_detained] = await page.$x('//*[@id="node-page-56400"]/div/div/div[2]/p[2]');
    const text_detained = await el_detained.getProperty('textContent');
    const name_detained = await text_detained.jsonValue();

    let number_detained = name_detained.split(":")[1].replace(",", "").replace(".", "").split(/\s+/)[1];

    browser.close();

    let th = [];
    th.push(["num_detained", parseInt(number_detained)]);
    th.push(["num_tested", parseInt(number_tests)]);

    //console.log(th);
    const meta_csv = new csv_writer(th);
    await meta_csv.toDisk('data/meta_data.csv', false);

    let timeHistory = [];

    data.forEach(function (row) {
        let infections_today;
        let result = array.find(obj => obj.jail === row.Name);
        if (result !== undefined){
            infections_today = result.infections;
        }
        else {
            infections_today = "";
        }
        let today = new Date();
        const day = today.getDate();
        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        let key = day + "-" + month + "-" + year;
        row[key] = infections_today;

        timeHistory.push(row);
    })

    //console.log(timeHistory);
    const csv = new csv_writer(timeHistory);
    await csv.toDisk('data/dailydetentioncases.csv', false);
}

scrapeICEPage();


 // const job = new CronJob({
 //     // Run at 15:05 EDT time, every day
 //     cronTime: '00 00 06 * * *',
 //     onTick: function() {
 //         // Run ICE scrape
 //         scrapeICEPage().then(r => console.log("Updated dailydetentioncases.csv"));
 //     },
 //     start: true,
 //     timeZone: 'America/New_York'
 // });

//app.listen(process.env.PORT, process.env.IP);
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))