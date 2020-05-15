/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables
let myMapVis;
//let myScatterVis;
let myBrushVis;

// init globalDataSets
let dailyCases;
let totalCases;
let totalICEHistory

// init global switches
let selectedCenter = '';

// load data using promises
let promises = [
    d3.csv("dailydetentioncases.csv")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

    dailyCases = dataArray[0]; //TODO should be used in baseball card timeline
    totalCases = []; // used for dot color coding on map
    totalICEHistory = []; // TODO should be used in global timeline

    let keys = [];
    dailyCases.forEach(function (facility) {
        keys = Object.keys(facility);
        let name = facility[keys[0]];
        let cumCases = facility[keys.slice(-1)[0]];
        totalCases[name] = cumCases;
    });
    console.log(totalCases);

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

    console.log(totalICEHistory);

    // init map
    myMapVis = new mapVis('mapDiv', 'mapLegendDiv', totalCases);

    // init brush
    myBrushVis = new brushVis('brushDiv', totalICEHistory);

    facilitygraph = new facilitygraph('facilitygraph');
    
    chart = new chart('chart', totalCases);
}



