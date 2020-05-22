let bc_margin, bc_height, bc_width;
let fgData, fg_svg;

facilityGraph = function (_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
};

// init facilitygraph
facilityGraph.prototype.initVis = function () {

    bc_margin = {top: 20, right: 20, bottom: 20, left: 30};
    bc_width = $("#" + this.parentElement).width() - bc_margin.left - bc_margin.right;
    bc_height = $("#" + this.parentElement).height() - bc_margin.top - bc_margin.bottom;

    // // SVG drawing area
    fg_svg = d3.select("#" + this.parentElement).append("svg")
        .attr("width", bc_width + bc_margin.left + bc_margin.right)
        .attr("height", bc_height + bc_margin.top + bc_margin.bottom)
        .append("g")
        .attr("transform", "translate(" + bc_margin.left + "," + bc_margin.top + ")");

    var f = document.getElementById("facilityGraphDiv");
    f.style.display = "none";
    var x = document.getElementById("globalbutton");
    x.style.display = "none";
};

facilityGraph.prototype.plotGraph = function (selectedFacility) {
    var f = document.getElementById("facilityGraphDiv");
    f.style.display = "block";

    var x = document.getElementById("globalbutton");
    x.style.display = "block";

    // clear svg first before plotting something new
    fg_svg.selectAll("*").remove();

    fgData = [];
    this.data.forEach(function (row) {
        // parse creates a list of json objects
        // [{name: facility name, date1: case, date2: case, ...}, ...]
        // iterate through the list and find the
        if (row.Name === selectedFacility) {
            for (let el in row) {
                if (row[el] !== selectedFacility) {
                    if (row[el] === "") {
                        fgData.push({date: new Date(el), infections: parseInt(0)});
                    } else {
                        fgData.push({date: new Date(el), infections: parseInt(row[el])});
                    }
                }
            }
        }
    });

    let fg_x = d3.scaleTime()
        .domain(d3.extent(fgData, function (d) {
            return d.date;
        }))
        .range([0, bc_width]);

    fg_svg.append("g")
        .attr("transform", "translate(0," + bc_height + ")")
        .call(d3.axisBottom(fg_x));

    // Add Y axis
    let fg_y = d3.scaleLinear()
        .domain([0, d3.max(fgData, function (d) {
            return d.infections;
        })])
        .range([bc_height, 0]);

    fg_svg.append("g")
        .call(d3.axisLeft(fg_y));

    // sorting array by date
    fgData = fgData.sort((a, b) => b.date - a.date)

    // Add the line
    fg_svg.append("path")
        .datum(fgData)
        .attr("fill", "none")
        .attr("stroke", '#275889')
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
            .x(function (d) {
                return fg_x(d.date);
            })
            .y(function (d) {
                return fg_y(d.infections);
            })
        )
};