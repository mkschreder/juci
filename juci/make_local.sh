#!/bin/bash

cd htdocs
FILES=`ls js/*.js widgets/*.js pages/*.js -1`
for file in $FILES; do
	echo "<script src=\"$file\"></script>"
done

#cat $FILES > htdocs/lib/juci-autogen.js
