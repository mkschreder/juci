//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
var sys = require("sys"); 
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 115200
});
serialPort.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
    var commands = ["ifconfig"]; 
    serialPort.on('data', function(data) {
      process.stdout.write(data);
      if(String(data).indexOf("Inteno login:") >= 0){
				console.log("onlogin"); 
				serialPort.write("\n", function(err, results) {
					console.log('err ' + err);
					console.log('results ' + results);
				}); 
			} else if(String(data).indexOf("Password:") >= 0){
				console.log("onpassword"); 
				serialPort.write("\n", function(err, results) {
					console.log('err ' + err);
					console.log('results ' + results);
				});
			} else if(String(data).match(/\w*@\w*:[^#]#/)){
				if(commands.length){
					serialPort.write(commands.shift()+"\n", function(err, results) {
						//console.log('err ' + err);
						//console.log('results ' + results);
					});
				} else {
					process.exit(); 
				}
			}
    });
    serialPort.write("\n"); 
  }
});

