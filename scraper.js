const puppeteer = require('puppeteer');
const csv_writer = require('objects-to-csv');
const csv_loader = require('csv-load-sync');

async function scrapeICEPage()
{

    console.log("scrape started");

    let data = csv_loader('data/dailydetentioncases.csv');

    const array = [];
    const url = "https://www.ice.gov/coronavirus";
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(url);

    let i = 2;
    let term_counter = 0;
    let terminate = false;
    while(!terminate) {
        try {
            const [cases] = await page.$x('//*[@id="node-page-56400"]/div/div/div[3]/table[2]/tbody/tr[' + i + ']/td[4]');
            const [jail] = await page.$x('//*[@id="node-page-56400"]/div/div/div[3]/table[2]/tbody/tr[' + i + ']/td[1]/text()[1]');

            let text = await cases.getProperty('textContent');
            const num_cases = await text.jsonValue();

            text = await jail.getProperty('textContent');
            const jail_name = await text.jsonValue();

            term_counter = 0;

            console.log(num_cases + " in " + jail_name);

            if(jail_name == "TOTAL"){
                console.log("breaking");
                break;
            }

            const entry = {infections: num_cases, jail: jail_name};
            array.push(entry);

        }
        catch (e) {
            // do nothing
        }
        finally {
            i++;
        }
    }

    // scrape number of tests
    const [el_tests] = await page.$x('//*[@id="node-page-56400"]/div/div/div[3]/table[1]/tbody/tr/td[3]/div[2]');

    const text_tests = await el_tests.getProperty('textContent');
    const name_tests = await text_tests.jsonValue();

    let number_tests = name_tests.replace(",", "");

    // scrape number of people detained
    const [el_detained] = await page.$x('//*[@id="node-page-56400"]/div/div/div[3]/table[1]/tbody/tr/td[1]/div[2]');
    const text_detained = await el_detained.getProperty('textContent');
    const name_detained = await text_detained.jsonValue();

    let number_detained = name_detained.replace(",", "");

    //let number_detained = name_detained.split(":")[1].replace(",", "").replace(".", "").split(/\s+/)[1];

    console.log(number_tests + ", " + number_detained);

    browser.close();

    let th = [];
    th.push(["num_detained", parseInt(number_detained)]);
    th.push(["num_tested", parseInt(number_tests)]);

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
        let key = day + " " + month + " " + year;
        row[key] = infections_today;

        timeHistory.push(row);
    })

    const csv = new csv_writer(timeHistory);
    await csv.toDisk('data/dailydetentioncases.csv', false);

    console.log("Scrape done");
}

scrapeICEPage();



