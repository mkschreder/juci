#!/bin/bash	

if [ ! -f "/usr/share/juci/.bootstrapped" ]; then 
	if [ "$(whoami)" != "root" ]; then 
		echo "JUCI needs to install build dependencies. You will now be prompted for your root password."
		echo "( this will only be done once on each build machine )"
		read -p "Do you want to continue (y/n): " ans; 
		if [ "$ans" != "y" ]; then exit 0; fi
	fi
	sudo apt-get install npm nodejs yui-compressor 
	npm install
	sudo npm install -g grunt-cli
	sudo npm install -g mocha 
	sudo npm install -g bower 
	sudo npm install -g uglify-js
	sudo mkdir -p /usr/share/juci/
	sudo touch /usr/share/juci/.bootstrapped

	if [ "$(which node)" == "" ]; then 
		NODEJS=$(which nodejs)
		if [ "$NODEJS" == "" ]; then 
			sudo apt-get install nodejs
		fi
		ln -s "$NODEJS" "/usr/bin/node"
	fi
fi

