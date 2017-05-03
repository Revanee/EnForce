/* jshint node: true */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var knex = require('knex')({
	client: 'mysql',
	connection: {
		host: '127.0.0.1',
		port: '3306',
		user: 'root',
		password: '1925',
		database: 'cansat'
	}
});

var SerialPort = require("serialport");
var five = require("johnny-five");
var board = new five.Board({
	timeout: 1000000
});

app.get('/', function (req, res) {
	res.sendfile('index.html');
});
app.get('/index.css', function (req, res) {
	res.sendfile('index.css');
});
app.get('/p5/p5.js', function (req, res) {
	res.sendfile('p5/p5.js');
});
app.get('/p5/addons/p5.dom.js', function (req, res) {
	res.sendfile('p5/addons/p5.dom.js');
});
app.get('/sketch.js', function (req, res) {
	res.sendfile('sketch.js');
});
app.get('/jquery-3.2.1.js', function (req, res) {
	res.sendfile('jquery-3.2.1.js');
});
app.get('/smoothie.js', function (req, res) {
	res.sendfile('smoothie.js');
});


var calculateAltitude = function (values) {
	var pressureAtSea = 101325,
		pressure = values.barometer.pressure * 1000,
		temperature = values.thermometer.celsius;

	return ((Math.pow((pressureAtSea / pressure), 1 / 5257) - 1) * (temperature + 273.15)) / 0.0065;
};

var imuValues = {
	x: 3,
	y: 3,
	z: 3
};

var multiValues = {
	temp: 4,
	pressure: 4,
	humidity: 4,
	altitude: 4
};

io.on('connection', function (socket) {
	console.log("user connected");

	socket.emit('imu_values', imuValues);
	socket.emit('multi_values', multiValues);

	socket.on('replay', function (id) {

		var stream = function (data) {
			console.log('replay started');
			socket.emit('startReplay');

			var i = 0;
			var streamer = setInterval(function () {
				var time;
				try {
					imuValues.x = data[i].imu_x;
					imuValues.y = data[i].imu_y;
					imuValues.z = data[i].imu_z;

					multiValues.temp = data[i].multi_temp;
					multiValues.pressure = data[i].multi_pressure;
					multiValues.humidity = data[i].multi_humidity;
					multiValues.altitude = data[i].multi_altitude;

					time = data[i].time;

				} catch (err) {
					socket.emit('stopReplay');
					console.log('replay stopped');
					clearInterval(streamer);
				}
				i += 1;
				updateValues();
			}, 16);
		};

		console.log("starting stream on id: " + id);

		if (id === "lancioUfficiale") {
			try {
				knex('sensor_data')
					.where({
						id: id
					})
					.whereBetween('time', ['2017-04-21 11:07:48.617', '2017-04-21 11:10:05.492'])
					.select()
					.then(function (names) {
						stream(names);
					}, 16);
			} catch (e) {
				console.log("error connecting to database");
			}
		} else {
			try {
				knex('sensor_data').where({
					id: id
				}).select().then(function (names) {
					stream(names);
				});
			} catch (e) {
				console.log("error connecting to database");
			}
		}
	});

	var recording = false;
	var i;
	var data;
	var recorder;
	socket.on('record', function (id) {
		if (!recording) {
			i = 1;
			data = [];
			recording = true;
			console.log("recording started on id: " + id);
			recorder = setInterval(function () {
				data.push({
					id: id,
					time: new Date(),
					imu_x: imuValues.x,
					imu_y: imuValues.y,
					imu_z: imuValues.z,
					multi_temp: multiValues.temp,
					multi_pressure: multiValues.pressure,
					multi_humidity: multiValues.humidity,
					multi_altitude: multiValues.altitude
				});
				if (i >= 100) {
					console.log("chunk size: " + i);
					knex.batchInsert('sensor_data', data, i);
					i = 1;
					data = [];
				}
				i++;
			}, 16);
		} else {
			recording = false;
			clearInterval(recorder);
			console.log("recording stopped");
			console.log("chunk size: " + i);
			knex.batchInsert('sensor_data', data, i);
		}
	});

	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
});


http.listen(3000, function () {
	console.log('listening on *:3000');
});

board.on("ready", function () {

	var imu = new five.IMU({
		controller: "BNO055",
		address: 0x28
	});

	var multi = new five.Multi({
		controller: "BME280",
		address: 0x77
	});

	imu.orientation.on("change", function () {

		imuValues = {
			x: this.euler.pitch,
			y: this.euler.roll,
			z: this.euler.heading
		};

		updateValues();
	});

	multi.on("change", function () {
		multiValues.temp = this.thermometer.celsius;
		multiValues.pressure = this.barometer.pressure;
		multiValues.humidity = this.hygrometer.relativeHumidity;
		multiValues.altitude = calculateAltitude(this);

		updateValues();
	});

	console.log("Started");
});

var updateValues = function () {
	io.sockets.emit('multi_values', multiValues);
	io.sockets.emit('imu_values', imuValues);
};
