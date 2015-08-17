INSTALL_DIR:=mkdir -p
CP:=cp -R 
BUILD_DIR:=build
MODULE_NAME:=juci-ubus-core
CFLAGS+=-Os -Wall -Wno-format-y2k -W -Wstrict-prototypes -Wmissing-prototypes -Wpointer-arith -Wreturn-type -Wcast-qual -Wwrite-strings -Wswitch -Wshadow -Wcast-align -Wchar-subscripts -Winline -Wnested-externs -Wredundant-decls -Wmissing-field-initializers -Wextra -Wformat=2 -Wno-format-nonliteral -Wpointer-arith -Wno-missing-braces --std=gnu99 -g3 -Wmissing-declarations -Iinclude -fPIC -Wno-unused-parameter
BUILD_DIR:=build
SHARED_OBJECT:=$(BUILD_DIR)/usr/lib/rpcd/$(MODULE_NAME).so
CGI_SCRIPT:=$(BUILD_DIR)/usr/libexec/rpcd/$(MODULE_NAME)-cgi
ACL_LIST:=$(BUILD_DIR)/usr/share/rpcd/acl.d/$(MODULE_NAME).json
CGI_BIN:=$(BUILD_DIR)/www/cgi-bin/
SO_SOURCE_FILES:=$(wildcard plugin/*.c)
IO_SOURCE_FILES:=$(wildcard io/*.c)
SO_OBJECT_FILES:=$(patsubst %.c, %.o, $(SO_SOURCE_FILES))
IO_OBJECT_FILES:=$(patsubst %.c, %.o, $(IO_SOURCE_FILES))

all: $(BUILD_DIR) $(SHARED_OBJECT) $(CGI_SCRIPT)

$(BUILD_DIR): 
	mkdir -p $(BUILD_DIR)
	
$(SHARED_OBJECT): $(SO_OBJECT_FILES)
	$(INSTALL_DIR) $(BUILD_DIR)/usr/lib/rpcd/
	$(CC) $(LDFLAGS) -Wl,-z,defs -shared -o $(SHARED_OBJECT) $(SO_OBJECT_FILES) -lubox -lubus -luci -lblobmsg_json -lcrypt -lpthread
	$(INSTALL_DIR) $(BUILD_DIR)/usr/share/rpcd/acl.d/
	$(CP) access.json $(ACL_LIST)
	$(CP) etc $(BUILD_DIR)/
	
$(CGI_SCRIPT): $(IO_OBJECT_FILES)
	$(INSTALL_DIR) $(BUILD_DIR)/usr/libexec/rpcd/
	$(INSTALL_DIR) $(BUILD_DIR)/www/cgi-bin/
	$(CC) $(LDFLAGS) -Wl,-z,defs -o $(CGI_SCRIPT) $(IO_OBJECT_FILES) -lubox -lubus -luci -lblobmsg_json
	ln -sf /usr/libexec/rpcd/$(MODULE_NAME)-cgi $(CGI_BIN)/juci-upload 
	ln -sf /usr/libexec/rpcd/$(MODULE_NAME)-cgi $(CGI_BIN)/juci-backup 

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean: ;
