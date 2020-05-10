/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables
let myMapVis;
//let myScatterVis;
let myBrushVis;

// init globalDataSets
let dataSet;
let dailyCases;
let totalCases;

// init global switches
let selectedState = '';

// load data using promises
let promises = [
    d3.csv("data.csv"),
    d3.csv("dailydetentioncases.csv")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

    dailyCases = dataArray[1];
    totalCases = [];
    dailyCases.forEach(function (facility) {
        let keys = Object.keys(facility);
        let name = facility[keys[0]];
        let cumCases = facility[keys.slice(-1)[0]];
        totalCases[name] = cumCases;
    });
1
    console.log(totalCases);

    // log data
    console.log(dataArray);
    dataSet = dataArray[1];

    // init map
    myMapVis = new mapVis('mapDiv', dataArray[0]);

    // init scatter
    //myScatterVis = new scatterVis('scatterDiv', dataArray[1]);

    // init brush
    myBrushVis = new brushVis('brushDiv', dataArray[0]);
}


