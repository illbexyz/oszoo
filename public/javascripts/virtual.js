var url = 'http://localhost:3000';

var socket = io.connect(url);

socket.emit();

socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});