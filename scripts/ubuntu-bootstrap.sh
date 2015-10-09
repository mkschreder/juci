#!/bin/bash

if [ "$(whoami)" != "root" ]; then 
	echo "Please run this script as root!"; 
	exit 1; 
fi 

apt-get install npm nodejs yui-compressor 
npm install
npm install -g grunt-cli
npm install -g mocha 
npm install -g bower 
npm install -g uglify-js

if [ "$(which node)" == "" ]; then 
	NODEJS=$(which nodejs)
	if [ "$NODEJS" != "" ]; then 
		read -p "Found nodejs executable at $(which nodejs), but no path to 'node'. Do you want to create a symlink? (y/n): " ans
		if [ "$ans" == "y" ]; then
			ln -s "$NODEJS" "/usr/bin/node"
		fi
	fi
fi

