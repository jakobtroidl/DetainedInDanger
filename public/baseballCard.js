/* * * * * * * * * * * * * *
*          BaseballCard    *
* * * * * * * * * * * * * */

// constructor
baseballCard = function(_parentElement)
{
    this.parentElement = _parentElement;

    // call method initVis
    this.init();
};

// init baseball card
baseballCard.prototype.init = function() {
    console.log("Hello baseball card")
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
    };


    // operator
    d3.select("#operator")
        .text("is operated by " + center['Name of Operator']);

    // # of confirmed COVID cases
    if (center['Confirmed COVID Cases (ICE) - 5/4'] == "")
    {d3.select("#cases").text("has no reported cases");
    }
    else
    {d3.select("#cases")
        .text("has "+center['Confirmed COVID Cases (ICE) - 5/4']+" confirmed cases");
    };
    //selectedCenter = d.name;
    //facilitygraph.initVis();
}