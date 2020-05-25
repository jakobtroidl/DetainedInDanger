const express = require('express')

const csv_loader = require('csv-load-sync');
const csv_writer = require('objects-to-csv');

const app = express();
const port = 5000;

app.use(express.static("public"));
app.use(express.static("data"));
app.use(express.static("resources"));
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

    res.render("index", {latestUpdate: out, });
});

app.get('/article', function(req, res)
{
    res.render('article');
});

app.get('/adelanto_article', function(req, res)
{
    res.render('adelanto_article');
});

app.get('/transfers_article', function(req, res)
{
    res.render('transfers_article');
});

app.listen(process.env.PORT, process.env.IP);
//app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))