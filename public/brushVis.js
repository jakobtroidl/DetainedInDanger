brushVis = function (_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    console.log("Hello timeline");
    // call method initVis
    this.initVis();
};

// init brushVis
brushVis.prototype.initVis = function () {

    let margin = {top: 20, right: 50, bottom: 20, left: 50};
    width = $("#" + this.parentElement).width() - margin.left - margin.right;
    height = $("#" + this.parentElement).height() - margin.top - margin.bottom;

    // SVG drawing area
    let svg = d3.select("#" + this.parentElement).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    console.log("init timeline");
    let new_data = [];
    Object.keys(this.data).forEach(function (k) {
            new_data.push({date: new Date(k), infections: totalICEHistory[k]});
        }
    )

    var x = d3.scaleTime()
        .domain(d3.extent(new_data, function (d) {
            return d.date;
        }))
        .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(new_data, function (d) {
            return +d.infections;
        })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
        .datum(new_data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) {
                console.log(d);
                return x(d.date);
            })
            .y(function (d) {
                return y(d.infections);
            })
        )
};
