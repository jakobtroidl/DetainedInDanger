/* * * * * * * * * * * * * *
*          BaseballCard    *
* * * * * * * * * * * * * */
let bc_new_data;

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
    
    d3.select("#cases")
        .text("There are  " + bc_new_data[0].infections + " total confirmed COVID-19 cases among ICE detainees.");
    d3.select("#detainees")
        .text("ICE has administered " + num_test + " COVID-19 tests.");
    d3.select("#operator")
        .text("There are " + num_detained + " detainees currently being held in ICE facilities.");
};

baseballCard.prototype.renderCenter = function(center){
    selectedCenter = center;
    d3.select("#moreinfo").text("");
    // graph title
    d3.select("#title").text("Confirmed COVID-19 Cases Over Time")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "16px") 
    .style("text-decoration", "underline")  ;

    // name of facility
    d3.select("#facilityname")
        .text(center.name);

    // location
    d3.select("#loc")
        .text("is located in " + center.County + ", " + center.State);

    // # of ICE detainees
    if (center['Number current ICE detainees'] == "") {
        d3.select("#detainees")
            .text("has an unknown # of ICE detainees");
    }
    else {
        d3.select("#detainees")
            .text("has " + center['Number current ICE detainees']+ " ICE detainees");
    }

    // operator
    d3.select("#operator")
        .text("is operated by " + center['Name of Operator']);

    // # of confirmed COVID cases
    let cases = totalCases[center.name];
    if (cases == "") {
        d3.select("#cases").text("has no reported cases");
    }
    else if (cases == 1) {
        d3.select("#cases")
        .text("has "+ cases + " confirmed case");
    }
    else {
        d3.select("#cases")
        .text("has "+ cases + " confirmed cases");
    }

    myFacilityGraph.plotGraph(center.name);
}