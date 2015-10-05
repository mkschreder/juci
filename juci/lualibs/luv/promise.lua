local function null_or_unpack(val)
	if val then
		return unpack(val)
	else
		return nil
	end
end

Promise = {

	--
	-- server functions
	--

	reject = function(self, ...)
		local arg = {...}
		assert(self:state() == 'pending')
		self._value = arg
		self._state = 'rejected'

		for i,v in ipairs(self._callbacks) do
			if v.event == 'always' or v.event == 'fail' then
				v.callback(null_or_unpack(arg))
			end
		end
		self._callbacks = {}
	end

	, resolve = function(self, ...)
		local arg = {...}
		assert(self:state() == 'pending')
		self._value = arg
		self._state = 'resolved'

		for i,v in ipairs(self._callbacks) do
			if v.event == 'always' or v.event == 'done' then
				v.callback(null_or_unpack(arg))
			end
		end
		self._callbacks = {}
	end

	, notify = function(self, ...)
		local arg = {...}
		assert(self:state() == 'pending')
		for i,v in ipairs(self._callbacks) do
			if v.event == 'progress' then
				v.callback(null_or_unpack(arg))
			end
		end
	end


	--
	-- client function
	--

	, always = function(self, callback)
		if self:state() ~= 'pending' then
			callback(null_or_unpack(self._value))
		else
			table.insert(self._callbacks, { event = 'always', callback = callback })
		end
		return self
	end

	, done = function(self, callback)
		if self:state() == 'resolved' then
			callback(null_or_unpack(self._value))
		elseif self:state() == 'pending' then
			table.insert(self._callbacks, { event = 'done', callback = callback })
		end
		return self
	end

	, fail = function(self, callback)
		if self:state() == 'rejected' then
			callback(null_or_unpack(self._value))
		elseif self:state() == 'pending' then
			table.insert(self._callbacks, { event = 'fail', callback = callback })
		end
		return self
	end

	, progress = function(self, callback)
		if self:state() == 'pending' then
			table.insert(self._callbacks, { event = 'progress', callback = callback })
		end
		return self
	end


	--
	-- utility functions
	--

	, state = function(self)
		return self._state
	end

}

function Promise:new()
	local obj = {
		is_deferred = true,
		_state = 'pending',
		_callbacks = {}
	}
	for k,v in pairs(Promise) do obj[k] = v end
	obj.new = nil
	return obj
end

setmetatable(Promise, { __call = function(x, ...) return Promise:new(...) end })

function when(...)
	local arg = {...}
	local deferred = Promise:new()
	local returns = {}
	local total = # arg
	local completed = 0
	local failed = 0
	check = function()
		if completed == total then
			if failed > 0 then
				deferred:reject(null_or_unpack(returns))
			else
				deferred:resolve(null_or_unpack(returns))
			end
		end
	end
	for i,v in ipairs(arg) do
		if (v and type(v) == 'table' and v.is_deferred) then
			local promise = v
			v:always(function(val)
				if promise:state() == 'rejected' then
					failed = failed + 1
				end
				completed = completed + 1
				returns[i] = val
				check()
			end)
		else
			returns[i] = v
			completed = completed + 1
		end
		check()
	end
	return deferred
end

return {
	create = function() return Promise:new() end
}
