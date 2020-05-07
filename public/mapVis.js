/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */
var margin, width, height, active;
var path, svg, id_name_map;

// constructor
mapVis = function(_parentElement, _dataTopographic, _dataFill) {
    this.parentElement = _parentElement;
    this.dataTopographic = _dataTopographic;
    this.dataFill = _dataFill;
    this.selectedRegion = [];

    // call method initVis
    this.initVis();
};

// init brushVis
mapVis.prototype.initVis = function() {
    let vis = this;

    id_name_map = new Map();
    d3.tsv("id_name_map.tsv").then(function(data) {
        data.forEach(function (d) {
            id_name_map.set(d.id, d.name);
        });
    });

    vis.colorScale = d3.scaleLinear().range(['white', 'steelblue']).domain([0, 100]);

    margin = {top: 20, right: 20, bottom: 20, left: 20};
    width = $("#" + vis.parentElement).width() - margin.left - margin.right;
    height = $("#" + vis.parentElement).height() - margin.top - margin.bottom;
    active = d3.select(null);

    // init drawing area
    svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr('transform', `translate (${margin.left}, ${margin.top})`);

    // add title
    // svg.append('g')
    //     .attr('class', 'title')
    //     .append('text')
    //     .text('Title for Map')
    //     .attr('transform', `translate(${width / 2}, 20)`)
    //     .attr('text-anchor', 'middle');


    // since projections don't work for some reason, we will use some basic math & transformations;
    // vis.viewpoint = {'width': 975, 'height': 610};
    // vis.zoom = vis.width/vis.viewpoint.width;

    // adjust map position
    // vis.map = vis.svg.append("g")
    //     .attr("class", "states");

    // Promise.resolve(d3.json('us_counties.topojson'))
    //     .then(ready);

    var projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(width);

    // path generator
    path = d3.geoPath()
        .projection(projection);

    svg.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(vis.dataTopographic, vis.dataTopographic.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .on("click", this.reset);

    svg.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(vis.dataTopographic, vis.dataTopographic.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "state")
        .on("click", this.clicked)
        .on('mouseover', function(d){

            // tooltip - in case one wants it
            /*div.transition().duration(100)
                .style('opacity', 1)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            div
                .html(`<div class="row"><div class="col-12" style="color: lightcyan">plain text</div></div>`);*/

            // set selectedState

            let id = d.id + "000";
            selectedState = id_name_map.get(id);
            myBrushVis.wrangleData();

            d3.select(this)
                .attr('stroke','darkred')
                .attr('stroke-width', 2)
                .attr('fill', 'rgba(255,0,0,0.47)')
                .style('opacity', 1)
        })
        .on('mouseout', function(d){

            // tooltip
           /* div.transition().duration(500)
                .style('opacity', 0);*/

            // reset selectedState
            selectedState = '';
            myBrushVis.wrangleData();

            d3.select(this)
                .attr("fill", function(){
                    let tmpState = d.name;
                    let color;
                    vis.displayData.forEach(state => {
                        if (tmpState === state.state ) {
                            color = vis.colorScale(state.average);
                        }
                    });
                    return color;
                })
                .attr('stroke', 'rgb(14,15,85)')
                .attr('stroke-width', 1)
                .style('opacity', 1)
        });


    svg.append("path")
        .datum(topojson.mesh(vis.dataTopographic, vis.dataTopographic.objects.states, function (a, b) {
            return a !== b;
        }))
        .attr("id", "state-borders")
        .attr("d", path);
};

mapVis.prototype.clicked = function(d) {

    //console.log(this);
    //console.log(d3.select('.background').node());

    if (d3.select('.background').node() === this) return this.reset();

    if (active.node() === this) return this.reset();

    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .1 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
};


mapVis.prototype.reset = function() {
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
        .delay(100)
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr('transform', 'translate('+margin.left+','+margin.top+')');

};

    // draw states
//     vis.map.selectAll("path")
//         .data(topojson.feature(vis.dataTopographic, vis.dataTopographic.objects.states).features)
//         .enter().append("path")
//         .attr("d", vis.path)
//         .attr('class', 'state')
//         .attr("fill", 'transparent')
//         .attr("stroke", 'black')
//         .attr("stroke-width", 1)
//         .on('mouseover', function(d){
//
//             // tooltip - in case one wants it
//             /*div.transition().duration(100)
//                 .style('opacity', 1)
//                 .style("left", (d3.event.pageX) + "px")
//                 .style("top", (d3.event.pageY - 28) + "px");
//             div
//                 .html(`<div class="row"><div class="col-12" style="color: lightcyan">plain text</div></div>`);*/
//
//             // set selectedState
//             selectedState = d.properties.name;
//             myBrushVis.wrangleData();
//
//             d3.select(this)
//                 .attr('stroke','darkred')
//                 .attr('stroke-width', 2)
//                 .attr('fill', 'rgba(255,0,0,0.47)')
//                 .style('opacity', 1)
//         })
//         .on('mouseout', function(d){
//
//             // tooltip
//            /* div.transition().duration(500)
//                 .style('opacity', 0);*/
//
//             // reset selectedState
//             selectedState = '';
//             myBrushVis.wrangleData();
//
//             d3.select(this)
//                 .attr("fill", function(){
//                     let tmpState = d.properties.name;
//                     let color;
//                     vis.displayData.forEach(state => {
//                         if (tmpState === state.state ) {
//                             color = vis.colorScale(state.average);
//                         }
//                     });
//                     return color;
//                 })
//                 .attr('stroke', 'rgb(14,15,85)')
//                 .attr('stroke-width', 1)
//                 .style('opacity', 1)
//         })
//         .on('click', function(d){
//             console.log(d3.event.pageX);
//             /*
//                         d3.select(this).attr('class', 'noState');
//                         d3.selectAll('.state').transition().duration(1000).attr('transform', 'translate(2000,0)');
//             */
//         });
//
//
//     // having initialized the map, move on to wrangle data
//     this.wrangleData();
//
//     d3.csv("cities-lived.csv", function(data) {
//
//         vis.svg.selectAll("circle")
//             .data(data)
//             .enter()
//             .append("circle")
//             .attr("cx", function(d) {
//                 return projection([d.lon, d.lat])[0];
//             })
//             .attr("cy", function(d) {
//                 return projection([d.lon, d.lat])[1];
//             })
//             .attr("r", function(d) {
//                 return 10;
//             })
//             .style("fill", "rgb(217,91,67)")
//             .style("opacity", 0.85)
//
//             // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
//             // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
//             .on("mouseover", function(d) {
//                 div.transition()
//                     .duration(200)
//                     .style("opacity", .9);
//                 div.text(d.place)
//                     .style("left", (d3.event.pageX) + "px")
//                     .style("top", (d3.event.pageY - 28) + "px");
//             })
//
//             // fade out tooltip on mouse out
//             .on("mouseout", function(d) {
//                 div.transition()
//                     .duration(500)
//                     .style("opacity", 0);
//             });
//     });
// };
//
// // data wrangling - gets called by brush - two tasks: 1) filtering by date 2) sorting & calculating average by state
// mapVis.prototype.wrangleData = function() {
//     let vis = this;
//
//     // filter according to selectedRegion, init empty array
//     let filteredData = [];
//
//     // if there is a region selected
//     if (vis.selectedRegion.length !== 0){
//         // iterate over all rows the csv (dataFill)
//         vis.dataFill.forEach( row => {
//             // and push rows with proper dates into filteredData
//             if (vis.selectedRegion[0].getTime() <= row.date.getTime() && row.date.getTime() <= vis.selectedRegion[1].getTime() ){
//                 filteredData.push(row);
//             }
//         });
//     } else {
//         filteredData = vis.dataFill;
//     }
//
//     // sort by state - nest data(filteredData) by state
//     let dataByState = d3.nest()
//         .key(function(d) { return d.state; })
//         .entries(filteredData);
//
//     vis.displayData = [];
//
//     // iterate over each year
//     dataByState.forEach( state => {
//         let tmpSum = 0;
//         let tmpLength = state.values.length;
//         let tmpState = state.values[0].state;
//         state.values.forEach( value => {
//             tmpSum += +value.average;
//         });
//         vis.displayData.push (
//             {state: tmpState, average: tmpSum/tmpLength}
//         )
//     });
//
//     this.updateVis();
// };
//
//
// // init brushVis
// mapVis.prototype.updateVis = function() {
//     let vis = this;
//
//     // draw states
//     d3.selectAll('.state')
//         .transition()
//         .duration(400)
//         .attr("fill", function(d){
//             let tmpState = d.properties.name;
//             let color;
//             vis.displayData.forEach(state => {
//                 if (tmpState === state.state ) {
//                     color = vis.colorScale(state.average);
//                 }
//             });
//             if (color === undefined){
//                 return 'transparent'
//             } else {
//                 return color;
//             }
//
//         })
//         .attr('stroke', 'rgb(14,15,85)')
//         .attr("stroke-width", 1)
//         .attr('opacity', 1)
/*

let div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
*/
