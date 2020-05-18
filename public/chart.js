/* * * * * * * * * * * * * *
*      Ranking chart       *
* * * * * * * * * * * * * */
let chart_svg, c_margin, c_width, c_height;
let chart_table, chart_data;

// constructor
chart = function(_parentElement, _totalCases)
{
    this.parentElement = _parentElement;
    chart_data = _totalCases;

    // call method initVis
    this.init();
}; 

// init chart
chart.prototype.init = function() {
    // margin, width, height
    c_margin = {top: 20, right: 10, bottom: 20, left: 10};
    c_width = $("#" + this.parentElement).width() - c_margin.left - c_margin.right;
    c_height = $("#" + this.parentElement).height() - c_margin.top - c_margin.bottom;

    // init drawing area
    chart_table = d3.select("#" + this.parentElement)
        .append('table')
        .style("border-collapse", "collapse")
        .style("border", "2px black solid");

    this.display();
    }

chart.prototype.display = function() {



    // headers
    chart_table.append("thead").append("tr")
        .selectAll("th")
        .data(["Name", "Cases"])
        .enter().append("th")
        .text(function(d) { return d; })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("background-color", "lightgray")
        .style("font-weight", "bold")
        .style("text-transform", "uppercase");

    //console.log(Object.keys(this.data));

    let new_data = [];
    Object.keys(chart_data).forEach(function (center) {
            new_data.push({name: center, cases: chart_data[center]});
        }
    )

    console.log(new_data);

    // data
    chart_table.append("tbody")
        .selectAll("tr").data(new_data)
        .enter().append("tr")
        .selectAll("td")
        .data(function(d){
            console.log(d);
            return d.cases;
        })
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

    // chart_table.selectAll("tr")
    //     .sort(function(a, b) {
    //         return d3.descending(a['Confirmed Cases'], b['Confirmed Cases']);
    //     });
}