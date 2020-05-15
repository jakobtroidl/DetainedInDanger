/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */
let margin, width, height, active;
let path, projection, id_name_map, g, svg, rect, svg1;
let div, colorScale, noReports_color;
let totalCasesPerFacility;

// constructor
mapVis = function(_parentElement, _legendElement,  _dataFill)
{
    this.parentElement = _parentElement;
    this.legendElement = _legendElement;
    totalCasesPerFacility = _dataFill;

    // call method initVis
    this.initVis();
};

// init brushVis
mapVis.prototype.initVis = function() {

    id_name_map = new Map();
    d3.tsv("id_name_map.tsv").then(function(data) {
        data.forEach(function (d) {
            id_name_map.set(d.id, d.name);
        });
    });
    noReports_color = "rgb(0,0,0)";

    //colorScale = d3.scaleLinear().range(['lightgrey', 'red']).domain([0, 60]);
//     let array = Object.values(totalCases);
//     array = array.filter(function(el) {
//         return el.length && el==+el;
// //  more comprehensive: return !isNaN(parseFloat(el)) && isFinite(el);
//     });
//     let max_cases = Math.max.apply(Math, array);


    margin = {top: 1, right: 10, bottom: 5, left: 10};
    width = $("#" + this.parentElement).width() - margin.left - margin.right;
    height = $("#" + this.parentElement).height() - margin.top - margin.bottom;
    active = d3.select(null);

    // init drawing area
    svg = d3.select("#" + this.parentElement).append("svg")
        .attr('class', 'center-container')
        .attr("width", width)
        .attr("height", height)
        .attr('transform', `translate (${margin.left}, ${margin.top})`);

    rect = svg.append('rect')
        .attr('class', 'background center-container')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
        .on('click', clicked);

    // maybe need to make a new area for the facility graph visualization
    svg1 = d3.select("#chart").append("svg")
    graph = svg.append("g");
    
    Promise.resolve(d3.json('county_us.topojson'))
        .then(this.ready);

    projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(width * 1.3);

    // path generator
    path = d3.geoPath()
        .projection(projection);

    g = svg.append("g")
        .attr('class', 'center-container center-items us-state')
        .attr('transform', 'translate('+margin.left+','+margin.top+')')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    // Append Div for tooltip to SVG
    div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    colorScale = d3.scaleThreshold()
        .domain([10, 20, 30, 40, 50])
        .range(["#ffffff", "#ffd5d5", "#ffabab", "#ff8181", "#ff5757", "#ff2d2d", "#ff0000"]);

    this.initLegend();


};

mapVis.prototype.initLegend = function(){
    var ext_color_domain = [0, 10, 20, 30, 40, 50];
    var legend_labels = ["< 10", "10+", "20+", "30+", "40+", "50+"];
    var no_reports_label = "no reports";

    let leg_margin = {top: 10, right: 10, bottom: 10, left: 10};
    let leg_width = $("#" + this.legendElement).width() - leg_margin.left - leg_margin.right;
    let leg_height = $("#" + this.legendElement).height() - leg_margin.top - leg_margin.bottom;

    const leg_svg = d3.select("#" + this.legendElement)
        .append("svg")
        .attr('class', 'center-container')
        .attr("width", leg_width)
        .attr("height", leg_height)
        .attr('transform', `translate (${leg_margin.left}, ${leg_margin.top})`);

    let legend = leg_svg.selectAll("g.legend")
        .data(ext_color_domain)
        .enter().append("g")
        .attr("class", "legend");

    const ls_w = 73, ls_h = 7;

    legend.append("rect")
        .attr("x", function (d, i) {
            return (i * ls_w) + ls_w;
        })
        .attr("y", 20)
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function (d, i) {
            return colorScale(d);
        })
        .style("stroke", "black");

    legend.append("text")
        .attr("x", function (d, i) {
            return (i * ls_w) + ls_w + 10;
        })
        .attr("y", 45)
        .text(function (d, i) {
            return legend_labels[i];
        });

    legend.append("rect")
        .attr("x", ls_w)
        .attr("y", 60)
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", noReports_color)
        .style("stroke", "black");

    legend.append("text")
        .attr("x", 2 * ls_w + 5)
        .attr("y", 67)
        .text(no_reports_label);

    const legend_title = "Number of reported cases";

    leg_svg.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("class", "legend_title")
        .text(function () {
            return legend_title
        });
}

mapVis.prototype.ready = function(us) {
    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .on("click", reset);

    g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "state")
        .on("click", clicked);

    d3.csv("facilities.csv").then(function(data) {
    // add circles to g
        g.selectAll("circle")
            .data(data).enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0]; })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1]; })
            .attr("r", function(d) {
                let cases = totalCasesPerFacility[d.name];

                if (cases == ""){ // facilities reporting nothing
                    return 4;
                }
                else if (typeof cases === 'undefined'){ // facilities not mention by ICE list
                    return 4;
                }
                else { // facilities reporting cases
                    //return cases;
                    return 4;
                }
            })
            .style("fill", function(d){
                let cases = totalCasesPerFacility[d.name];

                if (cases == ""){ // facilities reporting nothing
                    return noReports_color;
                }
                else if (typeof cases === 'undefined'){ // facilities not mention by ICE list
                    return "rgb(50,205,50)";
                }
                else { // facilities reporting cases
                    return colorScale(cases);
                }

            })
            .style("stroke", "white")
            .style("opacity", 1.0)
            .on("mouseover", function(d) {
                d3.select(this).
                    transition()
                    .duration(200)
                    .attr('r', 8);

                div.transition()
                    .duration(200)
                    .style("opacity", .9);

                div.text(d.name)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })

            // fade out tooltip on mouse out
            .on("mouseout", function(d) {
                d3.select(this).
                transition()
                    .duration(200)
                    .attr('r', 4);

                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })

            // BASEBALL CARD APPEARANCE ON MOUSE CLICK //
            .on("click", function(d) {
                selectedCenter = d.name;

                // name of facility
                d3.select("#facilityname")
                    .text(d.name);

                // location
                d3.select("#loc")
                    .text("is located in " + d.County + ", " + d.State);

                // # of ICE detainees
                if (d['Number current ICE detainees'] == "") {
                    d3.select("#detainees")
                    .text("has an unknown # of ICE detainees");
                }
                else {
                    d3.select("#detainees")
                    .text("has " + d['Number current ICE detainees']+ " ICE detainees");
                };

                
                // operator
                d3.select("#operator")
                    .text("is operated by " + d['Name of Operator']);

                // # of confirmed COVID cases
                if (d['Confirmed COVID Cases (ICE) - 5/4'] == "") 
                    {d3.select("#cases").text("has no reported cases");
                }
                else 	
                    {d3.select("#cases")
                        .text("has "+d['Confirmed COVID Cases (ICE) - 5/4']+" confirmed cases");
                    };
                selectedCenter = d.name;
                facilitygraph.wrangleData();
            });
            // END BASEBALL CARD TEXT //
            
    });
    



    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path);
}

function clicked(d) {
    if (d3.select('.background').node() === this) return reset;

    if (active.node() === this) return reset;

    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = 0.9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

    // g.selectAll("circle").transition()
    //     .duration(750)
    //     .attr("transform", "scale(" + scale + ")");
}


function reset() {
    active.classed("active", false);
    active = d3.select(null);

    g.transition()
        .delay(100)
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr('transform', 'translate('+margin.left+','+margin.top+')');
    g.selectAll("circle")
        .transition()
        .delay(850)
        .duration(1)
        .style("stroke-width", "1px");
}