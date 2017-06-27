//tapes = [[1, 2, 3, 4, 5],[1, 2, 3, 4, 5],[1, 2, 3, 4, 5]];
//chart = "#tape1"
var TapesSimulator = function(chart, tapes){
    var cellSize = 40;
    var array_size = 5;
    var width = 500;
    d3.select(chart).html("");
    this.svg = d3.select(chart).append("svg")
        .attr("height", 400)
        .attr("class", "col-lg-6");
    this.g = this.svg.append("g");
        //.call(zoom);
    this.g_tape = this.g.selectAll("g")
        .data(tapes)
        .enter().append("g")
        .attr(
            "transform", function(d, i) {
                return "translate(0, "+ i * cellSize + ")";
            });

    this.g_rect = this.g_tape.selectAll("g")
        .data(function(d,i) {
            return d;
        })
        .enter().append("g")
        .attr("class", "tape")
        .attr(
            "transform", function(d, i) {
                return "translate(" + i * cellSize + ",0)";
            });

    g_rect.append("rect")
        .attr("class", function(d, i){
            if (i == parseInt(array_size/2)){
                return "cur_element";
            }
        })
        .attr("width", cellSize)
        .attr("height", cellSize);
    g_rect.append("text")
        .attr("x", function(d) { return (cellSize/2) -3; })
        .attr("y", cellSize / 2)
        .attr("dy", ".35em")
        .text(function(d) { return d });
};
