local uv = require("uv"); 
local promise = require("promise"); 


function do_long_task(argument)
	local def = promise:create(); 
	
	
	local progress = uv.new_async(function(arg)
		print("Async notification for 'progress' event"); 
		def:notify("async progress: "..(arg or "")); 
	end); 
	local done = uv.new_async(function(arg)
		print("Async notification for 'done' event"); 
		def:resolve("string from async done: "..(arg or "")); 
	end); 
	
	local thread = uv.new_thread(function(progress, done, arg)
		local uv = require("uv"); 
		print("In thread. Got arg: "..(arg or "")); 
		for i = 1,10 do 
			uv.async_send(progress, ""..i); 
			uv.sleep(1000); 
		end
		uv.async_send(done, "thread done!"); 
	end, progress, done, argument); 
	
	return def; 
end

do_long_task("Hello World!"):progress(function(data)
	print("Long task progress: "..(data or "")); 
end):done(function(result)
	print("Long task done. Got result: "..(result or "")); 
end); 

uv.run(); 
