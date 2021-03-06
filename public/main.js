/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables
let myMapVis;
//let myScatterVis;
let myBrushVis;
let myBaseballCard;
let myFacilityGraph;
let myChart;

// init globalDataSets
let dailyCases;
let totalCases;
let totalICEHistory

// init global switches
let selectedCenter = '';

let num_test = "";
let num_detained = "";

// load data using promises
let promises = [
    d3.csv("dailydetentioncases.csv"),
    d3.csv("meta_data.csv")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

    dailyCases = dataArray[0];
    totalCases = []; // used for dot color coding on map
    totalICEHistory = []; // used for global timeline

    let keys = [];
    dailyCases.forEach(function (facility) {
        keys = Object.keys(facility);
        let name = facility[keys[0]];
        let cumCases = facility[keys.slice(-1)[0]];
        totalCases[name] = cumCases;
    });

    //extracting total ICE history for timeline
    dailyCases.map(function(d){
        Object.keys(d).forEach(function (col) {
            if(!isNaN(d[col]) && d[col] !== ""){ // check if numerical value
                if(!(col in totalICEHistory))
                {
                    totalICEHistory[col] = 0;
                }
                totalICEHistory[col] = parseInt(totalICEHistory[col]) + parseInt(d[col]);
            }
        });
    });

    dataArray[1].forEach(function (d) {
            if (d[0] === "num_tested"){
                num_test = d[1];
            }
            if (d[0] === "num_detained"){
                num_detained = d[1];
            }
        })

    myMapVis = new mapVis('mapDiv', 'mapLegendDiv', totalCases);
    myBrushVis = new brushVis('brushDiv', totalICEHistory);
    myFacilityGraph = new facilityGraph('facilityGraphDiv', dailyCases);
    myBaseballCard = new baseballCard("baseballCard", totalCases, dailyCases);
    myChart = new chart('chartDiv', totalCases);
}
