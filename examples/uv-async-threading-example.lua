--[[
this is an example of how to use async threading in lua

the concept is very useful for writing threaded asynchronous applications

author: Martin K. Schröder <mkschreder.uk@gmail.com>
]]--

local uv = require("uv");
local promise = require("promise"); 

-- this will be a function returning a promise
function produce_data(interval)
	local def = promise:create(); 
	
	local work = uv.new_work(
		function(sender, ival) 
			local uv = require("uv"); 
			print("Processing work for sender: "..(sender or "")); 
			local progress = 0; 
			local sum = 0; 
			function print_progress()
				io.write("\r["); 
				for i = 1,progress do 
					io.write("="); 
				end
				for i = 1,(10 - progress) do 
					io.write(" "); 
				end
				io.write("]"); 
			end
			for i = 1,10 do 
				print_progress(); 
				uv.sleep(ival); 
				sum = sum + ival; 
				progress = progress + 1; 
			end
			return sender,sum; 
		end, 
		function(sender, total)
			print("Work done for "..(sender or "")..": "..(total or ""));
			def:resolve(total);
		end
	);
	uv.queue_work(work, "produce_data", interval);
	return def;
end

local function set_interval(interval, callback)
  local timer = uv.new_timer()
  local function ontimeout()
    callback(timer)
  end
  uv.timer_start(timer, interval, interval, ontimeout)
  return timer
end

print("Starting long running task.."); 
produce_data(1000):done(function(total)
	print("Long runing task done. Result: "..(total or "")); 
end); 
print("Starting ticker task.."); 

local i = set_interval(300, function()
  print("tick")
end)

uv.run();
