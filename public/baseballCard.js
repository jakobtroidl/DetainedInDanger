/* * * * * * * * * * * * * *
*          BaseballCard    *
* * * * * * * * * * * * * */

// constructor
baseballCard = function(_parentElement, _totalCases, _dailyCases)
{
    this.parentElement = _parentElement;
    this.totalCases = _totalCases;
    this.dailyCases = _dailyCases;

    // call method initVis
    this.init();
};

// init baseball card
baseballCard.prototype.init = function() {
    d3.select("#facilityname")
        .text("Click on a facility on the map for more information");
    d3.select("#cases")
        .text("There are 881 total confirmed COVID-19 cases among ICE detainees.");
    d3.select("#detainees")
        .text("ICE has administered 1.736 COVID-19 tests.");
    d3.select("#operator")
        .text("There are 29,675 detainees currently being held in ICE facilities.");
};

baseballCard.prototype.renderCenter = function(center){
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
    else {
        d3.select("#cases")
        .text("has "+ cases + " confirmed cases");
    }
    //facilitygraph.initVis();
}