
// attempt to make ranking chart


// d3.csv("facilities.csv").then(function(d) {
//     var data = [];
//     // make data into json format
//     d.forEach(function(row) {
//         data.push({
//             "name" : row.name,
//             "cases" : totalCases[row.name]
//         })
//     });
// });
//     console.log(d)

/* * * * * * * * * * * * * *
*      Ranking chart       *
* * * * * * * * * * * * * */

// constructor
chart = function(_parentElement, _totalCases)
{
    this.parentElement = _parentElement;
    this.totalCases = _totalCases;

    // call method initVis
    this.init();

};

// init chart
chart.prototype.init = function() {
    // margin, width, height
    c_margin = {top: 20, right: 20, bottom: 20, left: 30};
    c_width = $("#" + this.parentElement).width() - c_margin.left - c_margin.right;
    c_height = $("#" + this.parentElement).height() - c_margin.top - c_margin.bottom;

    // init drawing area
    svg = d3.select("#" + this.parentElement).append("svg")
        .attr('class', 'center-container')
        .attr("width", c_width)
        .attr("height", c_height)
        .attr('transform', `translate (${c_margin.left}, ${c_margin.top})`);

    table = d3.select("body").append("table");
    thead = table.append("thead");
    tbody = table.append("tbody");
    columns = ['Facility Name', 'Confirmed Cases'];

    // Append the header row
    thead.append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
        .text(function(column) {
            return column;
        });
// to be continued
    }