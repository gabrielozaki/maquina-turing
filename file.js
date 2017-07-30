function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsText(file);
}

function displayContents(contents) {
	_automaton.loadFromFile(contents)
	updateCanvas()
}

document.getElementById('file-input')
	.addEventListener('change', readSingleFile, false);

function download(name, type) {
	text = _automaton.exportToFile()
	var a = document.getElementById("a-file");
	var file = new Blob([text], {type: type});
	a.href = URL.createObjectURL(file);
	a.download = name;
	a.click();
}

