/*jshint node: true, esversion: 6*/

var SerialPort = require('serialport');
var EventEmitter = require('events').EventEmitter;

module.exports = class SerialListenerJSON extends EventEmitter {

	constructor(Port, BaudRate) {
		super();
		this.BaudRate = (typeof (BaudRate) !== 'undefined') ? BaudRate : 9600;
		this.Port = (typeof (Port) !== 'undefined') ? Port : 'COM1';
	}

	startListening() {
		var self = this;

		console.log("Listening");

		try {

			var port = new SerialPort(this.Port, {
				parser: SerialPort.parsers.readline(),
				baudRate: this.BaudRate
			});
			port.on('open', function () {
				console.log("Serial communication opened at port: " + port.path + " with BaudRate of: " + port.options.baudRate);
			});
			// open errors will be emitted as an error event 
			port.on('error', function (err) {
				console.log('Error: ', err.message);
			});
			port.on('data', function (data) {
				try {
					var obj = JSON.parse(data);
					self.emit('data', obj);
					//emit
				} catch (err) {
					console.log("Error parsing JSON!");
					console.log(data);
					//console.log(err);
				}
			});

		} catch (err) {

			console.log(err);

		}
	}

};
