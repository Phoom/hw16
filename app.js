var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial Params
var chosenXAxis = "greater_than_30"
var chosenYAxis = "fair_poor_health"


// function used for updating x-scale var upon click on axis label
function xScale(dataCSV, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(dataCSV, d => d[chosenXAxis]) * 0.8,
        d3.max(dataCSV, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width])
  
    return xLinearScale
  
  };
  
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale)
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis)
  
    return xAxis
  }


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
  
    return circlesGroup
  };



// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis == "greater_than_30") {
      var labelX = "Commute greater 30 mins: "
    } else {
      var labelX = "Commute less 30 mins: "
    }
  
    if (chosenYAxis == "fair_poor_health") {
        var labelY = "Fair to Poor Health: "
    } else {
        var labelY = "Good to Excellent Health: "
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function (d) {
          // no label  variabile $?
        return (`${d.location}<br>${labelX}${d[chosenXAxis]}%<br>${labelY}${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
      })
      // onmouseout event
      .on("mouseout", function (data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup
  }



d3.csv("commuteData.csv", function(err, dataCSV){
    if (err) throw err;

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    dataCSV.forEach(function(data)
        {
        data.fair_poor_health = +data.fair_poor_health 	
        data.greater_than_30 = +data.greater_than_30
        data.good_excellent_health = +data.good_excellent_health
        data.less_than_30 = +data.less_than_30
        });

    
    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = xScale(dataCSV,chosenXAxis)

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(dataCSV, d => d.fair_poor_health)])
        .range([height, 0]);    

    
    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis)

  // append y axis
  chartGroup.append("g")
    .call(leftAxis)

// var yAxis = chartGroup.append("g")
// .classed("y-axis", true)
// .attr("transform", `translate(0, ${height})`)
// .call(leftAxis)





// Step 5: Create Circles
// ==============================
var circlesGroup = chartGroup.selectAll("circle")
.data(dataCSV)
.enter()
.append("circle")
.attr("cx", d => xLinearScale(d.greater_than_30))
.attr("cy", d => yLinearScale(d.fair_poor_health))
.attr("r", "15")
.attr("fill", "pink")
.attr("opacity", ".5")


// Create group for  2 x- axis labels
var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + 20})`)


var greater30 = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 20)
.attr("value", "greater_than_30") //value to grab for event listener
.classed("active", true)
.style("font-weight", "bold")
.text("Commute Greater than 30 Mins");

var lesser30 = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 40)
.attr("value", "less_than_30") //value to grab for event listener
.classed("inactive", true)
.text("Commute Less than 30 Mins");

// append y axis
chartGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left)
.attr("x", 0 - (height / 2))
.attr("dy", "1em")
.classed("axis-text", true)
.text("Fair to Poor Health (%)");


// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup)


  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value")
      if (value != chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(dataCSV, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        console.log(chosenXAxis);
        
        // changes classes to change bold text
        if (chosenXAxis == "greater_than_30") {
            greater30
            .classed("active", true)
            .style("font-weight", "bold")
            .style("font-size", "16px")
            .classed("inactive", false)
            lesser30
            .classed("active", false)
            .style("font-weight", "normal")
            .style("font-size", "14px")
            .classed("inactive", true)
        } else {
            greater30
            .classed("active", false)
            .style("font-weight", "normal")
            .style("font-size", "14px")
            .classed("inactive", true)
            lesser30
            .classed("active", true)
            .style("font-weight", "bold")
            .style("font-size", "16px")
            .classed("inactive", false)
        };
      };
    });
});