/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */
var margin, width, height, active;
var path, projection, id_name_map, g, svg, rect;

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

    this.colorScale = d3.scaleLinear().range(['white', 'steelblue']).domain([0, 100]);

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
                console.log(d);
                return projection([d.lon, d.lat])[0]; })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1]; })
            .attr("r", function(d) {
                return 3;
            })
            .style("fill", "rgb(217,91,67)")
            .style("opacity", 0.85);
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