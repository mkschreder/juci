OUTDIR:=build
CP:=cp -Rp
INSTALL_DIR=mkdir -p

all: files
	
.PHONY: files
files: 
	$(INSTALL_DIR) $(OUTDIR)/etc/hotplug.d/
	$(CP) hotplug/* $(OUTDIR)/etc/hotplug.d/

clean: 
	rm -rf $(OUTDIR)
