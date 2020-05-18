/* * * * * * * * * * * * * *
*      Ranking chart       *
* * * * * * * * * * * * * */
let svg, c_margin, c_width, c_height;
let data = [];

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
            .attr("width", c_width)
            .attr("height", c_height)
            .attr('transform', `translate (${c_margin.left}, ${c_margin.top})`);

    this.display();
    }

chart.prototype.display = function() {
    // load data
    d3.csv("facilities.csv").then(function(d) {
        // make data into json format
        d.forEach(function(row) {
            data.push({
                "Facility Name" : row.name,
                "Confirmed Cases" : totalCases[row.name]
                });
            });
        });

    var rows = data;
    var table = d3.select(svg).append('table')
                    .style("border-collapse", "collapse")
                    .style("border", "2px black solid");
          
    // headers
    table.append("thead").append("tr")
        .selectAll("th")
        .data(rows[0])
        .enter().append("th")
        .text(function(d) { return d; })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("background-color", "lightgray")
        .style("font-weight", "bold")
        .style("text-transform", "uppercase");
    
    // data
    table.append("tbody")
        .selectAll("tr").data(rows.slice(1))
        .enter().append("tr")
        .selectAll("td")
        .data(function(d){return d;})
        .enter().append("td")
        .style("border", "1px black solid")
        .style("padding", "5px")
        .on("mouseover", function(){
        d3.select(this).style("background-color", "powderblue");
    })
        .on("mouseout", function(){
        d3.select(this).style("background-color", "white");
    })
        .text(function(d){return d;})
        .style("font-size", "12px");

    table.selectAll("tr")
        .sort(function(a, b) {
            return d3.descending(a['Confirmed Cases'], b['Confirmed Cases']);
        });
}