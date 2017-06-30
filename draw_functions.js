function convertInputIntoTapes(input_array, array_size){
    var tapes = [];
    for (var i in input_array){
        var input = input_array[i];
        var array = input.input;
        var new_array = [];
        tapes.push(new_array);
        var index = input.index;
        //console.log(array);
        //console.log(index);
        // Getting the number of indexes at left of tape center
        var element_left = index - parseInt(array_size/2);
        for(var j = element_left; j<=(index + array_size/2); j++){
            if(j < array.length && j>=0){
                new_array.push(array[j]);
            }
            else{
                new_array.push("λ");
            }

        }
    }
    //console.log(tapes);
    return tapes;
};
//tapes = [[1, 2, 3, 4, 5],[1, 2, 3, 4, 5],[1, 2, 3, 4, 5]];
//chart = "#tape1"
var TapesSimulator = function(chart, input_array){
    var cellSize = 40;
    var array_size = 21;
    var tapes = convertInputIntoTapes(input_array, array_size);
    var width = 500;
    d3.select(chart).html("");
    this.svg = d3.select(chart).append("svg")
        .attr("height", 400)
        .attr("class", "col-lg-12");
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


