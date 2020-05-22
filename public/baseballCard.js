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

    d3.select("#facilityname").text("");
    // d3.select("#loc").text("Global Statistics")
    //     .style("font-size", "24px");
    d3.select("#title").text("Global Statistics");
    d3.select("#cases")
        .text("There are  " + formatComma(bc_new_data[0].infections) + " total confirmed COVID-19 cases among ICE detainees.")
        .style("font-size", "20px");
    d3.select("#detainees")
        .text("ICE has administered " + formatComma(num_test) + " COVID-19 tests.")
        .style("font-size", "20px");
    d3.select("#operator")
        .text("There are " + formatComma(num_detained) + " detainees currently being held in ICE facilities.")
        .style("font-size", "20px");
    d3.select("#positives").text(formatComma(bc_new_data[0].infections));

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
    //.style("font-size", "16px")
    //.style("text-decoration", "underline")  ;

    // name of facility
    d3.select("#facilityname")
        .text(center.name);

    // location
    d3.select("#loc")
        .text("is located in " + center.County + ", " + center.State)
        .style("font-size", "15px");;

    // # of ICE detainees
    if (center['Number current ICE detainees'] == "") {
        d3.select("#detainees")
            .text("has an unknown # of ICE detainees")
            .style("font-size", "15px");
    }
    else {
        d3.select("#detainees")
            .text("has " + formatComma(center['Number current ICE detainees']) + " ICE detainees")
            .style("font-size", "15px");;
    }

    // operator
    d3.select("#operator")
        .text("is operated by " + center['Name of Operator'])
        .style("font-size", "15px");;

    // # of confirmed COVID cases
    let cases = totalCases[center.name];
    if (cases == "") {
        d3.select("#cases").text("has no reported cases")
        .style("font-size", "15px");;
    }
    else if (cases == 1) {
        d3.select("#cases")
        .text("has "+ cases + " confirmed case")
        .style("font-size", "15px");;
    }
    else {
        d3.select("#cases")
        .text("has "+ cases + " confirmed cases")
        .style("font-size", "15px");;
    }

    myFacilityGraph.plotGraph(center.name);
}