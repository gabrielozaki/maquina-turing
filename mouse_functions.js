//var to indicate the state of mouse, 0 = mouse arrow, 1 = state
//2 = transition arrow, 3 = remove
var MouseState = {
    ARROW: 0,
    STATE: 1,
    TRANS: 2,
    REMOVE: 3
};
_mouse_state = MouseState.ARROW;



//Changing the state of mouse
$("#mouse_arrow").on('click', function () {
    _mouse_state = MouseState.ARROW;
    _selected_element = null;
    $('#drawCanvas').css( 'cursor', 'default' );
});
$( "#state" ).on('click', function () {
    _mouse_state = MouseState.STATE;
    _selected_element = null;
    $('#drawCanvas').css( 'cursor', 'default' );
});
$( "#transition_arrow" ).on('click', function () {
    _mouse_state = MouseState.TRANS;
    _selected_element = null;
    $('#drawCanvas').css( 'cursor', 'default' );
});
$( "#remove" ).on('click', function () {
    _mouse_state = MouseState.REMOVE;
    _selected_element = null;
    $('#drawCanvas').css( 'cursor', 'not-allowed' );
});

//MOUSE EVENTS OF CANVAS
$("#drawCanvas").on('click', function (e) {
    var x = e.pageX - $(this).offset().left,
    y = e.pageY - $(this).offset().top;
    switch (_mouse_state) {
        case MouseState.ARROW:
            change_selected_for_input(_automaton.getElementOn(x,y));
            break;
        case MouseState.STATE:
            change_selected_for_input(_automaton.getElementOn(x,y));
            break;
        case MouseState.TRANS:
            break;
        case MouseState.REMOVE:
            break;
        default:
            _mouse_state = MouseState.ARROW;
    }
    updateCanvas();
});


$("#drawCanvas").on('mousedown', function (e) {
    var x = e.pageX - $(this).offset().left,
    y = e.pageY - $(this).offset().top;
    
    switch (_mouse_state) {
        case MouseState.ARROW:
            //changing the element selected
            _selected_element = _automaton.getElementOn(x,y);
            break;
        case MouseState.STATE:
            break;
        case MouseState.TRANS:
            _selected_element = _automaton.getStateOn(x,y);
            break;
        case MouseState.REMOVE:
            break;
        default:
            _mouse_state = MouseState.ARROW;
    }
    updateCanvas();
});
$("#drawCanvas").on('mouseup', function (e) {
    var x = e.pageX - $(this).offset().left,
    y = e.pageY - $(this).offset().top;
    
    switch (_mouse_state) {
        case MouseState.ARROW:
            //changing the element selected
            _selected_element = null;
            break;
        case MouseState.STATE:
            _selected_element = _automaton.createState(x,y,'');
            break;
        case MouseState.TRANS:
            if (State.prototype.isPrototypeOf(_selected_element))
            {
                var aux_size = 5;
                var state = _automaton.getStateOn(x,y);
                if (state != null)
                {
                    var action_array_raw = [];
                    for (var i=0; i< aux_size; i++){
                        action_array_raw.push({"read":"λ","write":"λ","move":"S"});
                    }
                    _selected_element = _automaton.createTransition(_selected_element, state, action_array_raw);
                    change_selected_for_input(_selected_element);
                }
            }
            break;
        case MouseState.REMOVE:
            _selected_element = _automaton.getElementOn(x,y);
            _automaton.removeElement(_selected_element);
            _selected_element = null;
            break;
        default:
            _mouse_state = MouseState.ARROW;
    }
    updateCanvas();

});
$("#drawCanvas").on('mousemove', function (e) {
    var x = e.pageX - $(this).offset().left,
    y = e.pageY - $(this).offset().top;
    switch (_mouse_state) {
        case MouseState.ARROW:
            if (State.prototype.isPrototypeOf(_selected_element))
            {
                _selected_element.setXY(x,y);
                updateCanvas();
            } 
            break;
        case MouseState.STATE:
            break;
        case MouseState.TRANS:
            if (State.prototype.isPrototypeOf(_selected_element))
            {
                clearCanvas();
                arrow = calculateArrow(_selected_element.x, _selected_element.y, x , y, 1);
                drawLine(_selected_element.x, _selected_element.y, x , y, 'gray');
                drawArrow(arrow);
                _automaton.drawAutomaton();
            }
            break;
        case MouseState.REMOVE:
            break;
        default:
            _mouse_state = MouseState.ARROW;
    }
    
});
//Updating table of inputs and tests
function updateTable(array_input, array_result, afd)
{
    $('#test_tbody').empty();
    $('#test_footer').empty();
    for (var i = 0; i < array_input.length; i++) {
        $('#test_tbody').append('<tr> \
                    <td class="td_input"><input type="text" class="input_test" value="'+array_input[i]+'"></td> \
                    <td class="td_result">'+array_result[i]+'</td> \
                  </tr>');

    };
    $('#test_footer').append('<tr> \
                    <td> É AFD? </td> \
                    <td> '+ afd +' </td> \
                    </tr>');
};
function updateTableTestGR(array_input, array_result){
    $('#grammar_test_tbody').empty();
    $('#grammar_test_footer').empty();
    for (var i = 0; i < array_input.length; i++) {
        $('#grammar_test_tbody').append('<tr> \
                    <td class="td_input"><input type="text" class="grammar_input_test" value="'+array_input[i]+'"></td> \
                    <td class="td_result">'+array_result[i]+'</td> \
                  </tr>');

    };
};
//add new input for test btn click
$("#add_input").on('click', function (e) {
    $('#test_tbody').append('<tr> \
                    <td class="td_input"><input type="text" class="input_test"></td> \
                    <td class="td_result"></td> \
                  </tr>');
});
$("#btn_af_er").on('click', function (e) {
    $('#text_result').empty();
    $('#text_result').append('^['+_automaton.convertAFToER()+']$');
});
$("#btn_er_af").on('click', function (e) {
    var er = $('#ldt_er_af').val();
    console.log("ER: "+er);
    _automaton = _automaton.convertERToAF(er);
    updateCanvas();
});
$("#btn_af_gr").on('click', function (e) {
    var new_lhs = [];
    var new_rhs = [];
    _automaton.convertAFToGR(new_lhs,new_rhs);
    setGR(new_lhs,new_rhs);
    
});
$("#btn_gr_af").on('click', function (e) {
    gr = getGR();
    _automaton = _automaton.convertGRToAF(gr['lhs'],gr['rhs']);
    updateCanvas();
});
//run tests
$("#btn_test").on('click', function (e) {
    var size= 5;
    console.log("AQUIIIi");
    input_array = []
    for (var i=0; i<size; i++){
        var inpt = document.getElementById("inpt_"+i);
        input_array.push(new Input(inpt.value));
    }
    var chart = "#tape1"
    TapesSimulator(chart, input_array);
    //inicia
});
$("#btn_step").on('click', function (e) {
    //proximo passo
    console.log("test");
    var chart = "#tape1"
    var input_tapes = [];
    var ipt = new Input("abcdefghij");
    input_tapes.push(new Input("abc"));
    input_tapes.push(new Input("abc"));
    input_tapes.push(new Input("abc"));
    ipt.index = 7;
    input_tapes.push(ipt);
    TapesSimulator(chart, input_tapes);
});
$("#grammar_btn_test").on('click', function (e) {
    var input_array = []
    $('#grammar_test_tbody tr').each(function() {
        var input = $(this).find(".grammar_input_test").val();    
        input_array.push(input);
    });
    gr = getGR();
    automaton_aux = _automaton.convertGRToAF(gr['lhs'],gr['rhs']);
    var array_result = _automaton.testArray(input_array);
    updateTableTestGR(input_array,array_result);
});


