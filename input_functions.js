function change_selected_for_input(element)
{
    if (State.prototype.isPrototypeOf(element))
    {
        _selected_for_input = element;
        console.log(_selected_for_input.label);
        $('#input_element').val(_selected_for_input.label);
        $('#is_final').each(function() { this.checked = _selected_for_input.end; });
        $('#is_initial').each(function() { this.checked = _selected_for_input.ini; });

        $('#form_state').show();
    }
    else if (Transition.prototype.isPrototypeOf(element))
    {
        _selected_for_input = element;
        console.log(_selected_for_input.pattern);
        $('#input_element').val(_selected_for_input.pattern);
        $('#form_state').hide();
    }
    else{
        return;
    }


};
$("#input_element").on('change', function () {
    var text = $('#input_element').val();

    if (State.prototype.isPrototypeOf(_selected_for_input))
    {
        _selected_for_input.label = text;
    }
    else if (Transition.prototype.isPrototypeOf(_selected_for_input))
    {
        if (text != ''){    
            _selected_for_input.pattern = text;
        }else{
			_selected_for_input.pattern = "λ";
		}        
    }
    else{
        return;
    }
    updateCanvas();
});
function changeTransition(i, action, input){
    console.log(i);
    console.log(action)
    var text = input.val();
    console.log(text);
    console.log(_selected_for_input);
    if (Transition.prototype.isPrototypeOf(_selected_for_input))
    {
        if (text == ''){
			text = "λ";
		}
        _selected_for_input.action_array[i][action] = text;
    }
}
$("#is_final").on('click', function (e) {
    if (State.prototype.isPrototypeOf(_selected_for_input))
    {
        _selected_for_input.end = $('#is_final').is(":checked");       
        updateCanvas();
    }
});
$("#is_initial").on('click', function (e) {
    if (State.prototype.isPrototypeOf(_selected_for_input))
    {
        _automaton.changeInitial(_selected_for_input, $('#is_initial').is(":checked"));
        updateCanvas();
    }
});
