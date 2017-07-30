//GLOBAL VARS
var _canvas = null;
var _context = null;
var _automaton = null;

//var to identify the element selected
var _selected_element = null;
var _selected_for_input = null;
//BEGIN OF CLASSES
//Class Transition
//Requires two param
//action_array - explain in function
//next - the next state of automaton
var Transition = function (action_array, next) {
    //transitions will recive a array of tapes actions
    //with read, write and direction to take
    this.action_array = action_array;
    this.pattern_rect = {'x': 0, 'y': 0, 'width': 0, 'height': 0};
    this.next = next;
    // VISUAL PROPERTIES
    // property used to determine if the line is straight=0, curve top=1, curve bottom=-1
    this.bridge = 0;
};

//BEGIN OF TRANSITION METHODS
//Method to draw a single transition, origin is the state that the transition starts
//y_factor is the factor to prevent multiple transition's text over each other
Transition.prototype.drawTransition = function (origin, y_factor) {
    var orig_x = origin.x;
    var orig_y = origin.y;
    var dest_x = this.next.x;
    var dest_y = this.next.y;
    var radius = this.next.radius;
    var bridge = this.bridge;
    var color = "black";
    var text_x = text_y = 0;
    var text = "| ";
    for(var i=0; i<this.action_array.length; i++){
        action = this.action_array[i];
        text += ""+action["read"]+"; "+action["write"]+"; "+action["move"]+" | ";
    }
    _context.font = "14px Arial";
    var text_size = _context.measureText(text);
    var arrow = [];
    //Curve to the same State
    if (origin === this.next)
    {
        //setting control points
        cp1 = {'x': orig_x - 65, 'y': orig_y - 75};
        cp2 = {'x': orig_x + 65, 'y': orig_y - 75};

        //calculating the text location
        text_x = (cp2.x - cp1.x) / 2 + cp1.x - text_size.width / 2;
        text_y = cp1.y + 15 - 15 * y_factor;

        //calculate the arrow
        arrow = calculateArrow(cp1.x, cp1.y, dest_x, dest_y, radius);

        //adjusting arrow
        arrow.mid_x += 1;
        arrow.mid_y -= 1;
        arrow.right_x += 1;
        arrow.right_y -= 1;
        arrow.left_x += 1;
        arrow.left_y -= 1;
        //draw a bezier curve
        drawBezierCurve(orig_x, orig_y, orig_x, orig_y, cp1, cp2);
    } else
    {
        //straight line between states
        if (bridge === 0)
        {
            //calculating the text location
            text_x = (dest_x - orig_x) / 2 + orig_x - text_size.width / 2;
            text_y = ((dest_y - orig_y) / 2 + orig_y - 5) - y_factor * 15;

            //calculate the arrow
            arrow = calculateArrow(orig_x, orig_y, dest_x, dest_y, radius);

            //line
            drawLine(orig_x, orig_y, arrow.mid_x, arrow.mid_y, color);
        }
        //curved line between states
        else
        {
            //calculating control point
            cp = calculateControlPoint(orig_x, orig_y, dest_x, dest_y, bridge);

            //calculating the text location
            text_x = cp.x;
            if (cp.y < cp.my)
                control_factor = -bridge;
            else
                control_factor = bridge;
            text_y = cp.y + 5 + (bridge * control_factor) * (y_factor * 15);
            //calculate the arrow
            arrow = calculateArrow(cp.x, cp.y, dest_x, dest_y, radius);

            //draw curve
            drawQuadCurve(orig_x, orig_y, arrow.mid_x, arrow.mid_y, cp, color);
        }
    }
    //drawing the text
    _context.fillStyle = color;
    _context.fillText(text, text_x, text_y);

    //save the text rect for mouse targeting
    this.pattern_rect = {'x': text_x, 'y': text_y - 10,
        'width': text_size.width, 'height': 10};
    //draw arrow
    drawArrow(arrow, color);
};
//END OF TRANSITION METHODS


//Class State
//Don't need parammeters
var State = function (x, y, label) {
    //Start without any transitions
    //w3 recommends avoid new Array()
    this.transitions = [];
    //All booleans will be false by default
    this.active = false;
    this.ini = false;
    this.end = false;
    // VISUAL PROPERTIES
    this.x = x;
    this.y = y;
    this.color = 'yellow';
    this.radius = 20;
    this.label = label;
};

//BEGIN OF STATE METHODS
//addTransition
//Add one transition to state trasations list
//Change codes like state1.transition.push(trans)
//To codes like state1.addTransition(trans)
State.prototype.addTransition = function (trans) {
    this.transitions.push(trans);
};

// Methods to make easier to change and get x, y properties
State.prototype.setXY = function (x, y) {
    this.x = x;
    this.y = y;
};
State.prototype.getXY = function () {
    return{
        "x": this.x,
        "y": this.y
    };
};

//Method used to find a transition object in position x,y
State.prototype.getTransitionOn = function (x, y) {
    for (var i = 0; i < this.transitions.length; i++) {
        var transition = this.transitions[i];
        if (transition.pattern_rect.x <= x &&
                (transition.pattern_rect.x + transition.pattern_rect.width) >= x &&
                transition.pattern_rect.y <= y &&
                (transition.pattern_rect.y + transition.pattern_rect.height) >= y)
        {
            return this.transitions[i];

        }
    }
    return null;
};

//Method to draw a single state
State.prototype.drawState = function () {
    _context.beginPath();
    _context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    _context.strokeStyle = 'black';
    _context.stroke();
    _context.fillStyle = this.color;
    _context.fill();
    _context.fillStyle = 'black';
    var text = this.label;
    _context.font = "14px Arial";
    var text_size = _context.measureText(text);
    _context.fillText(text, this.x - text_size.width / 2, this.y);
    _context.closePath();
    if (this.ini)
    {
        this.drawInitialIndicator();
    }
    if (this.end)
    {
        this.drawFinalIndicator();
    }

};

//Method to draw a circle that shows that it is final state
State.prototype.drawFinalIndicator = function () {
    _context.beginPath();
    _context.arc(this.x, this.y, this.radius - (this.radius / 5), 0, 2 * Math.PI);
    _context.strokeStyle = 'black';
    _context.stroke();
    _context.closePath();

};

//Method to draw a triangle that shows that it is initial state
State.prototype.drawInitialIndicator = function () {
    _context.beginPath();
    _context.moveTo(this.x - this.radius, this.y);
    _context.lineTo(this.x - (this.radius * 2), this.y - this.radius);
    _context.lineTo(this.x - (this.radius * 2), this.y + this.radius);
    _context.lineTo(this.x - this.radius, this.y);
    _context.strokeStyle = 'black';
    _context.stroke();
    _context.fillStyle = 'gray';
    _context.fill();
    _context.closePath();
    // _context.arc(this.x, this.y, this.radius-(this.radius/5), 0, 2 * Math.PI);
};

//Method to draw the transition array inside a State
State.prototype.drawTransitions = function () {
    //array used to calc a y_factor
    var array_next = [];
    for (var i = 0; i < this.transitions.length; i++) {
        var next = this.transitions[i].next;
        //counting how many transitions in the same direction
        y_factor = countElementOnArray(array_next, next);
        this.transitions[i].drawTransition(this, y_factor);
        array_next.push(next);
    }
};

function countElementOnArray(array, element) {
    count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === element)
        {
            count++;
        }
    }
    ;
    return count;
}
;
//method used to properly remove the transition
State.prototype.removeTransition = function (trans) {
    for (var i = 0; i < this.transitions.length; i++) {
        if (this.transitions[i] === trans)
        {
            var removed = this.transitions.splice(i, 1);
            return removed;
        }
    }
};

/*State.prototype.getNextStateByPattern = function(pattern){
 var states = [];
 for(var i=0;i<this.transitions.length;i++)
 {
 if(this.transitions[i].pattern == pattern)
 states.push(this.transitions[i].next);
 
 }
 return states;
 
 }*/
//END OF STATE METHODS
//Class Automaton
//Don't need parameters
//Automaton is a list of states
var Automaton = function () {
    this.states = [];
    this.machine = null;
};

//BEGIN OF AUTOMATON METHODS

Automaton.prototype.loadFromFile = function (file_content) {
	var parser = new DOMParser();
    //important to use "text/xml"
	var xmlDoc = parser.parseFromString(file_content, "text/xml");
    var node = xmlDoc.createElement("heyHo");
	var elements = xmlDoc.getElementsByTagName("root");
	elements[0].appendChild(node);
};

Automaton.prototype.exportToFile = function () {
    var file_content = "<?xml version='1.0' encoding='UTF-8' standalone='no'?>"+
		"<structure>"+
		"	<type>turing</type>"+
		"	<tapes>5</tapes>"+
		"	<automaton>"+
		"	</automaton>"+
		"</structure>"
	var parser = new DOMParser();
    //important to use "text/xml"
	var xmlDoc = parser.parseFromString(file_content, "text/xml");
    var node = xmlDoc.createElement("heyHo");
	var elements = xmlDoc.getElementsByTagName("automaton");
	var automaton_div = elements[0];

    for (var i in _automaton.states){
        var block = xmlDoc.createElement("block");
        var tag = xmlDoc.createElement("tag");
        var cur_state = _automaton.states[i];
        tag.innerHTML = 'Machine'+i;
        block.appendChild(tag)

        if (cur_state.ini){
            var initial = xmlDoc.createElement("initial");
            block.appendChild(initial);
        }
        if (cur_state.end){
            var end = xmlDoc.createElement("final");
            block.appendChild(end);
        }
        block.setAttribute("id", i);
        block.setAttribute("name", cur_state.label);
        automaton_div.appendChild(block);
        for (var j in cur_state.transitions){
            var cur_transition = cur_state.transitions[j];
            var transition = xmlDoc.createElement("transition");
            var from = xmlDoc.createElement("from");
            var to = xmlDoc.createElement("to");
            from.innerHTML = i;
            to.innerHTML = _automaton.states.indexOf(cur_transition.next);
            transition.appendChild(from);
            transition.appendChild(to);
            for (var k in cur_transition.action_array){
                var action = cur_transition.action_array[k];
                var read = xmlDoc.createElement("read");
                var write = xmlDoc.createElement("write");
                var move = xmlDoc.createElement("move");
                read.innerHTML = action['read'];
                write.innerHTML = action['write'];
                move.innerHTML = action['move'];
                var tape_nmb = 1+parseInt(k);
                read.setAttribute("tape", tape_nmb.toString());
                write.setAttribute("tape", tape_nmb.toString());
                move.setAttribute("tape", tape_nmb.toString());
                transition.appendChild(read);
                transition.appendChild(write);
                transition.appendChild(move);
            }
            automaton_div.appendChild(transition);
        }
    }

    var xmlText = new XMLSerializer().serializeToString(xmlDoc);
    return xmlText;
};
//Method used to set the colors of all stations
Automaton.prototype.setStatesColor = function (color) {
    for (var i = 0; i < this.states.length; i++) {
        this.states[i].color=color;
    }
};
//Method used to draw the state list insite a Automaton
Automaton.prototype.drawAutomaton = function () {
    for (var i = 0; i < this.states.length; i++) {
        this.states[i].drawTransitions();
    }
    for (var i = 0; i < this.states.length; i++) {
        this.states[i].drawState();
    }
};
//Method use to find a state object in position x,y
Automaton.prototype.getStateOn = function (x, y) {
    for (var i = 0; i < this.states.length; i++) {
        x1 = (x - this.states[i].x) * (x - this.states[i].x);
        y1 = (y - this.states[i].y) * (y - this.states[i].y);
        radius1 = (this.states[i].radius) * (this.states[i].radius);
        if (x1 + y1 <= radius1) {
            return this.states[i];
        }
    }
    return null;
};
//Method use to find any object in position x,y
Automaton.prototype.getElementOn = function (x, y) {
    state = this.getStateOn(x, y);
    if (state !== null)
    {
        return state;
    } else
    {
        for (var i = 0; i < this.states.length; i++) {
            trans = this.states[i].getTransitionOn(x, y);
            if (trans !== null) {
                return trans;
            }
        }
    }
    return null;
};
//addState
//Add one state to states
//Change codes like states.push(state)
//To codes like automaton.addState(state)
Automaton.prototype.addState = function (state) {
    this.states.push(state);
};
//method used to create a state and add to the states list
Automaton.prototype.createState = function (x, y, label) {
    var state = new State(x, y, label);
    this.addState(state);
    return state;
};
//method used to create a transition between the prev and next states
//and set the pattern of a transition
Automaton.prototype.createTransition = function (prev, next, action_array) {
    if (prev !== null && next !== null)
    {
        var trans = new Transition(action_array, next);
        var same_direction = this.getTransitionsOnDirection(prev, next);
        if (same_direction.length > 0)
        {
            trans.bridge = same_direction[0].bridge;
        } else
        {
            var opposite_direction = this.getTransitionsOnDirection(next, prev);
            if (opposite_direction.length > 0)
            {
                for (var i = 0; i < opposite_direction.length; i++) {
                    opposite_direction[i].bridge = 1;
                }
                trans.bridge = -1;
            } else
            {

            }
        }
        prev.addTransition(trans);
        return trans;
    }
    return null;
};
//method used to get all transitions from automaton
Automaton.prototype.getAllTransitions = function () {
    var array_aux = [];
    for (var i = 0; i < this.states.length; i++)
    {
        var current_state = this.states[i];
        array_aux.push.apply(array_aux, current_state.transitions);
    }
    return array_aux;
};
//method used to find all next transitions var to a state
Automaton.prototype.findNextToState = function (state) {
    var all_trans = this.getAllTransitions();
    var next_to_state_array = [];
    for (var i = 0; i < all_trans.length; i++)
    {
        trans = all_trans[i];
        if (trans.next === state)
        {
            next_to_state_array.push(trans);
        }
    }
    return next_to_state_array;
};
//method used to find a state from a transition 
Automaton.prototype.findStateFromTrans = function (trans) {
    for (var i = 0; i < this.states.length; i++)
    {
        var state_aux = this.states[i];
        for (j = 0; j < state_aux.transitions.length; j++)
        {
            if (state_aux.transitions[j] === trans)
            {
                return state_aux;
            }
        }

    }
};
//method used to get all transitions in the same direction on the same states
Automaton.prototype.getTransitionsOnDirection = function (prev, next) {
    same_direction = [];
    pointing_next_array = this.findNextToState(next);
    for (var i = 0; i < pointing_next_array.length; i++) {
        var state_aux = this.findStateFromTrans(pointing_next_array[i]);
        if (state_aux === prev)
        {
            same_direction.push(pointing_next_array[i]);
        }
    }
    return same_direction;
};
//method used to set null all next transitions var to a state
Automaton.prototype.removeAllNextToState = function (state) {
    var next_to_state_array = this.findNextToState(state);
    var i = 0;
    for (; i < next_to_state_array.length; i++)
    {
        this.removeTransition(next_to_state_array[i]);
    }
    return i;
};
//method used to remove a state from automaton
Automaton.prototype.removeState = function (state) {
    for (var i = 0; i < this.states.length; i++)
    {
        if (this.states[i] === state)
        {
            this.removeAllNextToState(state);
            removed = this.states.splice(i, 1);
            return removed;
        }
    }
};
//method used to remove a transition from automaton
Automaton.prototype.removeTransition = function (trans) {
    var state_aux = this.findStateFromTrans(trans);
    state_aux.removeTransition(trans);
};
//method used to remove any element from automaton
Automaton.prototype.removeElement = function (element) {
    if (State.prototype.isPrototypeOf(element))
    {
        return this.removeState(element);
    } else if (Transition.prototype.isPrototypeOf(element))
    {
        return this.removeTransition(element);
    } else
    {
        return null;
    }
};
//method used to properly change the initial state
Automaton.prototype.changeInitial = function (state, ini) {
    if (ini)
    {
        for (var i = 0; i < this.states.length; i++) {
            this.states[i].ini = false;
        }
        state.ini = true;
    } else
    {
        state.ini = ini;
    }
};
//method tha returns a array of result by the array of inputs
Automaton.prototype.testArray = function (input_array) {
    result_array = [];
    //console.log("comecei");
    //for (var i = 0; i < input_array.length; i++) {
        var machine = new Machine(this.getInitial(), input_array);
        result = machine.execute();
        result_array.push(result);
    //}
    //console.log("result");
    //console.log(result);
    //for(var i = 0;i < machine.input.length;i++){
    //    console.log(machine.input[i].input);
    //}
    
    return {
        "result":result,
        "input":machine.input
    };
};

Automaton.prototype.init = function (input_array) {
    result_array = [];
    //console.log("comecei");
    
        this.machine = new Machine(this.getInitial(), input_array);
   //     result = this.machine.execute();
       
    //}
    //console.log("result");
    //console.log(result);
    //for(var i = 0;i < machine.input.length;i++){
    //    console.log(machine.input[i].input);
    //}
    
    /*return {
        "result":result,
        "input":this.machine.input
    };*/
};

Automaton.prototype.step = function(){
    var    success = 0;
    //runs until change the state
    success = this.machine.step();
    return {
        "status": success,
        "input": this.machine.input,
        "state": this.machine.cursor.state
    };
};

//method tha returns the initial state from automaton
Automaton.prototype.getInitial = function () {
    for (var i = 0; i < this.states.length; i++) {
        if (this.states[i].ini)
            return this.states[i];
    }
    return null;
};

//Remove the isolated states
Automaton.prototype.removeIsolated = function () {
    //loop controller
    var remove = true;
    while (remove) {
        //prepare for exiting loop
        remove = false;
        for (var i = 0; i < this.states.length; i++) {
            var origin = this.findNextToState(this.states[i]);

            if (origin.length === 0 && this.states[i].ini === false)
            {
                //avoid to exiting loop, in case of removeState
                this.removeState(this.states[i]);
                remove = true;
            }
        }
    }

};

Automaton.prototype.findDoublePair = function (pair_array) {
    for (var i = 0; i < pair_array.length - 1; i++) {
        var state_1 = pair_array[i][0];
        var next_1 = pair_array[i][1];
        for (var j = i + 1; j < pair_array.length; j++) {
            if (j < pair_array.length) {
                var state_2 = pair_array[j][0];
                var next_2 = pair_array[j][1];
                if ((state_1 === state_2) && (next_1 === next_2)) {
                    return [state_2, next_2];
                }
            }
        }
        ;
    }
    ;
    return null;
};

Automaton.prototype.spliceDoublePair = function (pair_array) {
    for (var i = 0; i < pair_array.length - 1; i++) {
        var state_1 = pair_array[i][0];
        var next_1 = pair_array[i][1];
        for (var j = i + 1; j < pair_array.length; j++) {
            if (j < pair_array.length) {
                var state_2 = pair_array[j][0];
                var next_2 = pair_array[j][1];
                if ((state_1 === state_2) && (next_1 === next_2)) {
                    pair_array.splice(j, 1);
                    return [state_2, next_2];
                }
            }
        }
        ;
    }
    ;
    return null;
};

//END OF AUTOMATON METHODS



//TEST classes
//They will work like a generic recognizer without aux memory explained in class:
// http://www2.fct.unesp.br/docentes/dmec/olivete/lfa/arquivos/Aula04.pdf
// INPUT
// | | | | | | | | | | | |
//   / \
//    | cursor
//    V
//  |State Machine|

//Input class
var Input = function (input) {
    //Input will be  a string, like: "abbcccbabbbabababa" or "1010000100000"
    //console.log(input);
    this.input = input.split('');
    //Copy of input, the main input will explode on test ("lol" => "l","o","l")
    this.input_copy = input;

    //every tape will have a index
    //R diretion will increment the index
    //L will decrement the index, if negative, will alocate a new position in the begining of array
    //S will keep the index
    this.index = 0;
};
//BEGIN INPUT METHODS
Input.prototype.moveRight = function () {
    this.index++;
    //Case the index reach some position out of the scope, alocate a new position with a empty value
    if (this.index <= this.input.length) {
        this.input.push("λ");
    }
};

Input.prototype.moveLeft = function () {
    this.index--;
    //Case the index reach some position out of the scope, alocate a new position with a empty value
    if (this.index < 0) {
        this.index = 0;
        //
        this.input.unshift("λ");
    }
};

//Just to make a reference to stay extension of turing machine
//Don't do nothing to index
Input.prototype.moveStay = function () {
    //console.log("stay");
};

//Cannot be only write because already exists a js function with this name
//Value is what will be write on the position
Input.prototype.writeOnPos = function (value) {
    this.input[this.index] = value;
};

Input.prototype.readOnPos = function () {
    pattern = this.input[this.index];
    return pattern;
};

//Verify if input is empty
Input.prototype.isEmpty = function () {
    //console.log(this.input);
    if (this.input === "")
    {
        return true;

    } else
        return false;
};
//END INPUT METHODS

//Cursor class
var Cursor = function () {
    //The first location will be in the void =O
    this.state = false;
};

//BEGIN CURSOR METHODs

//FIND NEXT
//The patern_array will be a array of patterns
//All patterns must be hit to success
Cursor.prototype.findNext = function (pattern_array) {
    //Test every transition
    //console.log("cursor");
    //console.log(pattern_array);
    for (var i = 0; i < this.state.transitions.length; i++) {
        var success = false;
        for (var j = 0; j < pattern_array.length; j++) {
            if (this.state.transitions[i].action_array[j]["read"] === pattern_array[j]) {
                success = true;
            } else {
                success = false;
                break;
            }
        }
        if (success) {
            return this.state.transitions[i]; //return the transition
        }
    }
    //FAIL if don't hit the pattern
    return false;

};

Cursor.prototype.move = function (state) {
    //console.log("teste");
    //console.log(state);
    this.state = state;
    //console.log("teste2");
    //console.log(this.state);
};
//END CURSOR METHODS

//State Machine class( called only MACHINE)
//Construtor need to recive the first element of automaton
var Machine = function (start, input_array) {
    //if reach the end of input in a final state
    //change this to true
    this.test = false;

    //creates a cursor
    //console.log(start);
    this.cursor = new Cursor();
    this.cursor.move(start);
    //creates tape array
    this.input = [];
    //populate the tape_array;
    for (var i = 0; i < input_array.length; i++) {
        //console.log("teste1");
        //console.log(input_array[i]);
        //var aux = new Input(input_array[i]);
        //console.log("teste2");
        this.input.push(input_array[i]);
        //console.log("teste3");
    }
};

//BEGIN MACHINE METHODS

//STEP
//Moves the state machine
Machine.prototype.step = function () {
    //-1 FAIL (reach the end but the cursor is not on a terminal state)
    //0 - undefined (the cursor have next states, so we have to continue)
    //1 - SUCESSS (reach the end and the cursor is on a terminal state)


    //will create a array of patterns, one pattern by tape
    //console.log("step");
    var pattern_array = [];
    for (var i = 0; i < this.input.length; i++) {
        var aux = this.input[i].readOnPos();
      //  console.log("read");
       // console.log(aux);
        pattern_array.push(aux);
    }

    //get the next states
    trans_next_state = this.cursor.findNext(pattern_array);
    //console.log("teste1");
    //console.log(trans_next_state);

    //checks if we have a next state
    if (trans_next_state !== false) {
        //console.log("next");
        //if we have a next state, move to him and keep the state undefined
        
        //Now, we apply the necessary input changes, like write the new value e move the index
        for (var i = 0; i < this.input.length; i++) {
            //Write the new value based in the transition action_array
            //console.log("teste1");
            //console.log(trans_next_state);
            this.input[i].writeOnPos(trans_next_state.action_array[i]["write"]);
            //Move using the moviment
            //R - Right
            //L - Left
            //S - Stay
            if(trans_next_state.action_array[i]["move"] === "R"){
                this.input[i].moveRight();
            }else if(trans_next_state.action_array[i]["move"] === "L"){
                this.input[i].moveLeft();
            }else{
                this.input[i].moveStay();
            }
        }
        
        this.cursor.move(trans_next_state.next);
        return 0;
    } else {
        //Agora verificamos se o estado é final
        //se ele for é sucesso e se não for é fail
        if (this.cursor.state.end === true) {
            return 1;
        } else {
            return -1;
        }
    }

    //If return false, test FAIL
    return -1;
};


Machine.prototype.execute = function () {
    success = 0;
    //runs until change the state
    while (success === 0)
    {
        success = this.step();
    }

    //verify if is a success or fail
    if (success === 1)
        return true;
    else
        return false;
};

//END OF MACHINE METHODS



//BEGIN OF FUNCTIONS
//BEGIN OF CANVAS FUNCTIONS

//function used to clear the canvas
function clearCanvas()
{
    _context.clearRect(0, 0, _canvas.width, _canvas.height);
}
;

//function to draw a line
function drawLine(x1, y1, x2, y2, color)
{
    _context.beginPath();
    _context.moveTo(x1, y1);
    _context.lineTo(x2, y2);
    _context.strokeStyle = color;
    _context.stroke();
    _context.closePath();
}
;

//function to draw a quadratic curve
function drawQuadCurve(x1, y1, x2, y2, cp, color)
{
    _context.beginPath();
    _context.moveTo(x1, y1);
    _context.quadraticCurveTo(cp.x, cp.y, x2, y2);
    _context.strokeStyle = color;
    _context.stroke();
    _context.closePath();
}
;

//function to draw a bezier curve
function drawBezierCurve(x1, y1, x2, y2, cp1, cp2, color)
{
    _context.beginPath();
    _context.moveTo(x1, y1);
    _context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, x2, y2);
    _context.strokeStyle = color;
    _context.stroke();
    _context.closePath();
}
;

//calculating arrow
function calculateArrow(orig_x, orig_y, dest_x, dest_y, radius)
{
    var v_link = [];
    n = [];
    var nx = 1;
    var ny;
    v_link[0] = dest_x - orig_x + 0.01;
    v_link[1] = dest_y - orig_y + 0.01;
    var norma = Math.sqrt(Math.pow(v_link[0], 2) + Math.pow(v_link[1], 2));
    v_link[0] /= norma;
    v_link[1] /= norma;
    var pX = dest_x - radius * v_link[0];//arrow in x
    var pY = dest_y - radius * v_link[1];//arrow in y
    //get the three points
    var leftpointX, leftpointY, rightpointX, rightpointY, midpointX, midpointY;
    midpointX = pX;
    midpointY = pY;

    ny = -(v_link[0]) / v_link[1];
    n[0] = nx;
    n[1] = ny;
    norma = Math.sqrt(Math.pow(n[0], 2) + Math.pow(n[1], 2));
    n[0] /= norma;
    n[1] /= norma;
    leftpointX = (pX - (6) * v_link[0] + (6) * n[0]);
    leftpointY = (pY - (6) * v_link[1] + (6) * n[1]);
    rightpointX = (pX - (6) * v_link[0] - (6) * n[0]);
    rightpointY = (pY - (6) * v_link[1] - (6) * n[1]);
    arrow = {
        "left_x": leftpointX,
        "left_y": leftpointY,
        "right_x": rightpointX,
        "right_y": rightpointY,
        "mid_x": midpointX,
        "mid_y": midpointY};
    return arrow;
}
;

//calculate control point between two states and the mY var to check sides
function calculateControlPoint(orig_x, orig_y, dest_x, dest_y, bridge)
{
    var vx, vy, normalX, normalY, module;
    var midX, midY, midY2;

    //calculate the distance between x1 - x2, y1-y2
    vx = orig_x - dest_x + 0.01;
    vy = orig_y - dest_y + 0.01;
    normalX = 1;
    normalY = -(vx / vy);
    if (normalY < 1)
        normalY += -1;
    module = Math.sqrt(1 + ((vx * vx) / (vy * vy)));
    //calculating vector normal in (x,y)
    normalX = normalX / module;
    normalY = normalY / module;
    //calculating the middle point(x,y)
    midX = 0.5 * (orig_x + dest_x);
    midY = 0.5 * (orig_y + dest_y);
    var mY = midY;
    //(px, py) origin / (p2x, p2y) destiny. / (tx, ty) translated.
    var height = 30.0, tx, ty, px, py, p2x, p2y;

    //Calculating the apex
    if (bridge === 1)
    {
        midX = midX + height * normalX;
        midY = midY + height * normalY;
    } else if (bridge === -1)
    {
        midX = midX + (-1) * height * normalX;
        midY = midY + (-1) * height * normalY;
    }
    //translation
    tx = -midX;
    ty = -midY;
    //center of origin
    midX = midY = 0;
    //translation of origin
    px = dest_x + tx;
    py = dest_y + ty;
    //translation of destiny
    p2x = orig_x + tx;
    p2y = orig_y + ty;
    var controlY = (midY - (1 - 0.75) / px) / 0.75;
    var cpx, cpy;
    //control in x,y
    cpx = midX - tx;
    cpy = controlY - ty;
    cp = {'x': cpx, 'y': cpy, 'my': mY};
    return cp;
}
;

//function to draw the arrow 
function drawArrow(arrow, color)
{
    _context.beginPath();
    _context.moveTo(arrow.mid_x, arrow.mid_y);
    _context.lineTo(arrow.right_x, arrow.right_y);
    _context.lineTo(arrow.left_x, arrow.left_y);
    _context.lineTo(arrow.mid_x, arrow.mid_y);
    _context.fillStyle = color;
    _context.fill();
    _context.closePath();
}
;

//function used to draw a transition preview right before the mouse is released
function drawTransitionPreview(x1, y1, x2, y2)
{
    clearCanvas();
    drawLine(x1, y1, x2, y2, "gray");
    //Automaton.drawAutomaton()drawStates();
}
;

//function used to clear the canvas and redraw everything
function updateCanvas()
{
    clearCanvas();
    _automaton.drawAutomaton();
}
;

//function use to load the var _canvas with the proper element
function initCanvas(canvas_id)
{
    _canvas = document.getElementById(canvas_id);
    if (_canvas.getContext) {
        _context = _canvas.getContext('2d');
    }
    _automaton = new Automaton();
    //_automaton = _automaton.convertERToAF('^[b(oa+b)]$');

    _automaton.drawAutomaton();

}
;

