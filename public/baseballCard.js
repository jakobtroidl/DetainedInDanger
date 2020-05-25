/* * * * * * * * * * * * * *
*          BaseballCard    *
* * * * * * * * * * * * * */
let bc_new_data, text;

// constructor
baseballCard = function(_parentElement, _totalCases, _dailyCases)
{
    this.parentElement = _parentElement;
    this.totalCases = _totalCases;
    this.dailyCases = _dailyCases;

    // call method initVis
    this.init();
    myFacilityGraph.initVis();


};

// init baseball card
baseballCard.prototype.init = function() {

    bc_new_data = [];
    Object.keys(totalICEHistory).forEach(function (k) {
            bc_new_data.push({date: new Date(k), infections: totalICEHistory[k]});
        }
    )
    // sorting array by date
    bc_new_data = bc_new_data.sort((a, b) => b.date - a.date);
    
    formatComma = d3.format(",");

    d3.select("#title").text("Global Statistics");

    d3.select("#facilityStats").style("display", "none");

    let globalStats = d3.select("#globalStats");
    globalStats.style("display", "");
    globalStats.select("#cases")
        .text(formatComma(bc_new_data[0].infections));
    globalStats.select("#detainees")
        .text(formatComma(num_test));
    globalStats.select("#operator")
        .text(formatComma(num_detained));
    globalStats.select("#positives").text(formatComma(bc_new_data[0].infections));

    var x = document.getElementById("globalbutton");
    x.style.display = "none";
};

baseballCard.prototype.renderCenter = function(center){
    selectedCenter = center;

    // graph title
    d3.select("#title").text(center.name)
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")

    // set global stats invisible
    d3.select("#globalStats").style("display", "none");

    let facilityStats = d3.select("#facilityStats");
    facilityStats.style("display", "");

    // location
    facilityStats.select("#loc")
        .text("located in " + center.County + ", " + center.State);

    // # of ICE detainees
    if (center['Number current ICE detainees'] == "") {
        facilityStats.select("#detainees")
            .text("has an unknown # of ICE detainees");
    }
    else {
        facilityStats.select("#detainees")
            .text("has " + formatComma(center['Number current ICE detainees']) + " ICE detainees");
    }

    // operator
    facilityStats.select("#operator")
        .text("operated by " + center['Name of Operator']);

    // # of confirmed COVID cases
    let cases = totalCases[center.name];
    if (cases == "") {
        facilityStats.select("#cases").text("has no reported cases");
    }
    else if (cases == 1) {
        facilityStats.select("#cases")
        .text("has "+ cases + " confirmed case");
    }
    else {
        facilityStats.select("#cases")
        .text("has "+ cases + " confirmed cases");
    }

    myFacilityGraph.plotGraph(center.name);
}