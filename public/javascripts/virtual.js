$(document).ready(function(){
	document.getElementById('start').addEventListener('click', function () {
	  var canvas = document.getElementById('screen');
	  var screen = new Screen(canvas);
	  client = new Client(screen);
	  client.connect();
	}, false);
});