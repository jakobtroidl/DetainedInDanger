/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */
let margin, width, height, active;
let path, projection, id_name_map, g, svg, rect;
let div, colorScale;

// constructor
mapVis = function(_parentElement, _dataFill) {
    this.parentElement = _parentElement;
    this.dataFill = _dataFill;
    this.selectedRegion = [];

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

    //colorScale = d3.scaleLinear().range(['lightgrey', 'red']).domain([0, 60]);
    var array = Object.values(totalCases);
    array = array.filter(function(el) {
        return el.length && el==+el;
//  more comprehensive: return !isNaN(parseFloat(el)) && isFinite(el);
    });
    let max_cases = Math.max.apply(Math, array);
    console.log(max_cases);
    colorScale = d3.scaleLinear()
        .domain([0, 40])
        .range(["#ffffff", "#ff0000"]);


    margin = {top: 10, right: 10, bottom: 10, left: 10};
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
};

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
        .on("click", clicked)
        .on('mouseover', function(d){
            let id = d.id + "000";
            selectedState = id_name_map.get(id);
            myBrushVis.wrangleData();
        })
        .on('mouseout', function(d){
            // reset selectedState
            selectedState = '';
            myBrushVis.wrangleData();
        });

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
                return 4;
            })
            .style("fill", function(d){
                cases = totalCases[d.name];
                if (typeof cases !== 'undefined'){
                    return colorScale(cases);
                }
                else {
                    return "rgb(0,0,0)";
                }

            })
            .style("stroke", "black")
            .style("opacity", 0.85)
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);

                div.text(d.name)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })

            // fade out tooltip on mouse out
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })

            // NEED TO ADD BASEBALL CARD APPEARANCE ON MOUSE CLICK //
            .on("click", function(d) {
                d3.select("#facilitygraphDiv")
                // put chosen facility graph here
                // put chosen facility graph here
                d3.select("#facilityname")
                    .text(d.name);
                d3.select("#loc")
                    .text("is located in " + d.County + ", " + d.State);
                d3.select("#detainees")
                    .text("has " + d['Number current ICE detainees']+ " ICE detainees");
                d3.select("#operator")
                    .text("is operated by " + d['Name of Operator']);
                // need to figure out if-then stuff, esp. if we don't format spreadsheet
                if (d['Confirmed COVID Cases (ICE) - 5/4'] == "") 
                    {return d3.select("#cases").text("has 0 confirmed cases")}
                else 	
                    {return d3.select("#cases")
                        .text("has "+d['Confirmed COVID Cases (ICE) - 5/4']+" confirmed cases")};
            });
            // END BASEBALL CARD CODE //
    });

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path);
};

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
        scale = .9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}


function reset() {
    active.classed("active", false);
    active = d3.select(null);

    g.transition()
        .delay(100)
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr('transform', 'translate('+margin.left+','+margin.top+')');
}