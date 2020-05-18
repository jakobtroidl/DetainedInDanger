/* * * * * * * * * * * * * *
*      Ranking chart       *
* * * * * * * * * * * * * */
let chart_data;

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

    let new_data = [];
    Object.keys(chart_data).forEach(function (center) {
            new_data.push({name: center, cases: chart_data[center]});
        }
    )

    new_data = new_data.sort((a, b) => b.cases - a.cases)

    for(let i = 0; i < new_data.length; i++){
        console.log(new_data[i]);
        let list_el = d3.select("#" + this.parentElement)
            .append("li")
            .attr("class", "w3-padding-16");

        list_el.append("span")
            .attr("class", "w3-large")
            .text(new_data[i].name);

        list_el.append("br");

        list_el.append("span")
            .text(function (){

                let cases = new_data[i].cases;
                if(cases === ""){
                    return "Unknown #cases"
                }
                return cases;
            });
    }
}