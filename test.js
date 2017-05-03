/*jshint node: true, esversion: 6*/

var SerialListenerJSON = require('./SerialListenerJSON');

var listener = new SerialListenerJSON('COM4');

listener.startListening();

listener.on('data', (data) => {
	console.log(data);
});
