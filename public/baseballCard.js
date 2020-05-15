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
    console.log("Hello baseball card")
};

baseballCard.prototype.renderCenter = function(center){

    console.log(center);
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