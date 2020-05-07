/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */
var margin, width, height, active;
var path, projection, id_name_map, g;

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
    let svg = d3.select("#" + this.parentElement).append("svg")
        .attr('class', 'center-container')
        .attr("width", width)
        .attr("height", height)
        .attr('transform', `translate (${margin.left}, ${margin.top})`);

    svg.append('rect')
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
        .attr('height', height + margin.top + margin.bottom)
};

mapVis.prototype.ready = function(us) {
    console.log("ready")
    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .on("click", reset);

    console.log(us);

    g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "state")
        .on("click", clicked);

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path);

};

function clicked(d) {
    console.log("clicked");

    if (d3.select('.background').node() === this) return reset;

    if (active.node() === this) return reset;

    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    console.log(d);
    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

        console.log(bounds);

    g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
};


function reset() {
    active.classed("active", false);
    active = d3.select(null);

    g.transition()
        .delay(100)
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr('transform', 'translate('+margin.left+','+margin.top+')');

};

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
//     //this.updateVis();
// };


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
// init brushVis
// mapVis.prototype.updateVis = function() {
//     let vis = this;
//
//     // draw states
//     d3.selectAll('.state')
//         .transition()
//         .duration(400)
//         .attr("fill", function (d) {
//             let tmpState = d.properties.name;
//             let color;
//             vis.displayData.forEach(state => {
//                 if (tmpState === state.state) {
//                     color = vis.colorScale(state.average);
//                 }
//             });
//             if (color === undefined) {
//                 return 'transparent'
//             } else {
//                 return color;
//             }
//
//         })
//         .attr('stroke', 'rgb(14,15,85)')
//         .attr("stroke-width", 1)
//         .attr('opacity', 1)
// };
/*

let div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
*/
// svg.append("g")
//     .attr("id", "counties")
//     .selectAll("path")
//     .data(topojson.feature(vis.dataTopographic, vis.dataTopographic.objects.counties).features)
//     .enter().append("path")
//     .attr("d", path)
//     .attr("class", "county-boundary")
//     .on("click", this.reset);
//
// svg.append("g")
//     .attr("id", "states")
//     .selectAll("path")
//     .data(topojson.feature(vis.dataTopographic, vis.dataTopographic.objects.states).features)
//     .enter().append("path")
//     .attr("d", path)
//     .attr("class", "state")
//     .on("click", this.clicked)
//     .on('mouseover', function(d){
//
//         // tooltip - in case one wants it
//         /*div.transition().duration(100)
//             .style('opacity', 1)
//             .style("left", (d3.event.pageX) + "px")
//             .style("top", (d3.event.pageY - 28) + "px");
//         div
//             .html(`<div class="row"><div class="col-12" style="color: lightcyan">plain text</div></div>`);*/
//
//         // set selectedState
//
//         let id = d.id + "000";
//         selectedState = id_name_map.get(id);
//         myBrushVis.wrangleData();
//
//         d3.select(this)
//             .attr('stroke','darkred')
//             .attr('stroke-width', 2)
//             .attr('fill', 'rgba(255,0,0,0.47)')
//             .style('opacity', 1)
//     })
//     .on('mouseout', function(d){
//
//         // tooltip
//        /* div.transition().duration(500)
//             .style('opacity', 0);*/
//
//         // reset selectedState
//         selectedState = '';
//         myBrushVis.wrangleData();
//
//         d3.select(this)
//             .attr("fill", function(){
//                 let tmpState = d.name;
//                 let color;
//                 vis.displayData.forEach(state => {
//                     if (tmpState === state.state ) {
//                         color = vis.colorScale(state.average);
//                     }
//                 });
//                 return color;
//             })
//             .attr('stroke', 'rgb(14,15,85)')
//             .attr('stroke-width', 1)
//             .style('opacity', 1)
//     });
//
//
// svg.append("path")
//     .datum(topojson.mesh(vis.dataTopographic, vis.dataTopographic.objects.states, function (a, b) {
//         return a !== b;
//     }))
//     .attr("id", "state-borders")
//     .attr("d", path);
//
// this.wrangleData();