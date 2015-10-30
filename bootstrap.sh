#!/bin/bash	

function perr() {
	echo -e "\e[31;40m$1\e[m"; 
}

if [ "$(which npm)" == "" ]; then 
	perr "!!! node npm utility is missing. Please install package 'npm' on your distribution"; 
	ERR=1
fi 

if [ "$(which yui-compressor)" == "" ] && [ "$(which yuicompressor)" == "" ]; then
	perr "!!! yui-compressor is missing. Please install package yui-compressor or yuicompressor."; 
	ERR=1
fi 

if [ "$(which node)" == "" ]; then 
	perr "!!! node js is missing or there is no symplink from /usr/bin/node to /usr/bin/nodejs"; 
	perr "!!! if you have issues then do ln -s /usr/bin/nodejs /usr/bin/node"; 
fi

if [ "$(which grunt)" == "" ]; then 
	perr "!!! grunt command line program is missing. Please install it using npm install -g grunt-cli"
	ERR=1; 
fi 

if [ "$(which uglifyjs)" == "" ]; then 
	perr "!!! uglify-js is missing. Please install it using npm install -g uglify-js"
	ERR=1
fi 

if [ "$ERR" == "1" ]; then 
	if [ "$(whoami)" != "root" ]; then 
		perr "JUCI build dependencies are missing!."
		perr "You can install then on ubuntu by running scripts/ubuntu-bootstrap.sh"
		exit 1
	fi
fi

exit 0
