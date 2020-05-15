let brush_margin, brush_height, brush_width;

facilitygraph = function (_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    // call method initVis
    this.initVis();
};

// init facilitygraph
facilitygraph.prototype.initVis = function () {

    brush_margin = {top: 20, right: 50, bottom: 40, left: 50};
    brush_width = $("#facilitygraph").width() - brush_margin.left - brush_margin.right;
    brush_height = $("#facilitygraph").height() - brush_margin.top - brush_margin.bottom;

    // SVG drawing area
    let svg = d3.select("#facilitygraph").append("svg")
        .attr("width", brush_width + brush_margin.left + brush_margin.right)
        .attr("height", brush_height + brush_margin.top + brush_margin.bottom)
        .append("g")
        .attr("transform", "translate(" + brush_margin.left + "," + brush_margin.top + ")");

    // this.wrangleData();
    // };    

// facilitygraph.prototype.wrangleData = function () {
    let new_data = [];
    d3.csv.parse("dailydetentioncases.csv").forEach(function (row) {
        // parse creates a list of json objects
        // [{name: facility name, date1: case, date2: case, ...}, ...]
        // iterate through the list and find the 
        if (row.Name = selectedCenter) {
            for (var i in row)
                if (i !== d.name) {
                    if (row[i] == "") {
                        new_data.push({date: new Date(i), infections: 0});
                    }
                    else {
                    new_data.push({date: new Date(i), infections: row[i]});
                    }
                }
            }
        });

    var x = d3.scaleTime()
        .domain(d3.extent(new_data, function (d) {
            return d.date;
        }))
        .range([0, brush_width]);

    svg.append("g")
        .attr("transform", "translate(0," + brush_height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(new_data, function (d) {
            return d.infections;
        })])
        .range([brush_height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // sorting array by date
    new_data = new_data.sort((a, b) => b.date - a.date)

    // Add the line
    svg.append("path")
        .datum(new_data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
            .x(function (d) {
                return x(d.date);
            })
            .y(function (d) {
                return y(d.infections);
            })
        )
};