/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

(function(scope){
	function RevoUpload(){
		this.state = "IDLE"; 
	}

	RevoUpload.prototype.$write = function uploadWrite(file, localFile){
		var reader = new FileReader(); 
		var def = $.Deferred(); 
		var self = this; 
		self.state = 'UPLOADING'; 
		reader.onload = function(){
			var buffer = reader.result; 
			var start = 0; 
			var slice = 10000; 
			var slices = 0; 
			var time = (new Date()).getTime(); 

			function tobase64(arrayBuffer){
				return window.btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
			}

			console.log("uploading file of size "+buffer.byteLength); 
			function doSpeedCalc(){
				setTimeout(function(){
					self.uploadSpeed = Math.round((slices * slice) / 1000) / 1000; 
					slices = 0; 
					if(self.state == 'UPLOADING') doSpeedCalc(); 
					def.progress(self.uploadSpeed); 
				}, 1000); 
			} doSpeedCalc(); 
			function next(){
				if((start + slice) > buffer.byteLength) slice = buffer.byteLength - start; 
				$rpc.file.write({
					filename: file,
					seek: start, 
					length: slice, 
					data64: tobase64(buffer.slice(start, start + slice))
				}).done(function(){
					start += slice; 
					if(start >= buffer.byteLength){
						console.log("File uploaded!"); 
						self.state = 'DONE'; 
						def.resolve(); 
					} else {
						slices++; 
						setTimeout(function(){ 
							self.uploadProgress = Math.round((start / buffer.byteLength) * 100); 
							if(self.state == 'UPLOADING') next(); 
						}, 0); 
					}
				}).fail(function(){
					console.error("File upload failed!"); 
					self.state = 'IDLE'; 
					def.reject(); 
				}); 
			} next(); 
		}
		try {
			reader.readAsArrayBuffer(localFile); 
		} catch(e){
			self.state = 'IDLE'; 
		}
		return def.promise(); 
	}

	if(JUCI && JUCI.app) { 
		JUCI.app.factory("$upload", function(){
			return new RevoUpload(); 
		}); 
	}
})(typeof exports === 'undefined'? this : global); 
