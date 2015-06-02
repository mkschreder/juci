for file in `find ./htdocs/plugins/ -name "menu.json"`; 
do 
	dir=${file%/*}; dir=${dir##*/}; 
	echo "INSTALL: menu $file to $1/usr/share/rpcd/menu.d/$dir.json"; 
	cp $file $1/usr/share/rpcd/menu.d/$dir.json; 
done
