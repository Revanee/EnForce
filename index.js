/*jshint node: true, esversion: 6*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var SerialListenerJSON = require('./lib/SerialListenerJSON');

var probe = new SerialListenerJSON('COM5', 38400);
probe.startListening();

app.get('/', function (req, res) {
	res.sendfile('./legacy/index.html');
});
app.get('/index.css', function (req, res) {
	res.sendfile('./legacy/index.css');
});
app.get('/p5/p5.js', function (req, res) {
	res.sendfile('./legacy/p5/p5.js');
});
app.get('/p5/addons/p5.dom.js', function (req, res) {
	res.sendfile('./legacy/p5/addons/p5.dom.js');
});
app.get('/sketch.js', function (req, res) {
	res.sendfile('./legacy/sketch.js');
});
app.get('/smoothie.js', function (req, res) {
	res.sendfile('./legacy/smoothie.js');
});
app.get('/jquery-3.2.1.js', function (req, res) {
	res.sendfile('./legacy/jquery-3.2.1.js');
});
app.get('/three.js', function (req, res) {
	res.sendfile('./node_modules/three/build/three.js');
});
app.get('/box.js', function (req, res) {
	res.sendfile('./scripts/box.js');
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});

probe.on('data', (data) => {
	io.sockets.emit('imu_values', {
		x: data.imu.quaternion.x,
		y: data.imu.quaternion.y,
		z: data.imu.quaternion.z,
		w: data.imu.quaternion.w
	});
});

/*  Copy j2 into j1
for (var key in j2) {
    j1[key] = j2[key];
}
*/
