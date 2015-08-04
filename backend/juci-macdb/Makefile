CFLAGS+=-Os -Wall -Wno-format-y2k -W -Wstrict-prototypes -Wmissing-prototypes -Wpointer-arith -Wreturn-type -Wcast-qual -Wwrite-strings -Wswitch -Wshadow -Wcast-align -Wchar-subscripts -Winline -Wnested-externs -Wredundant-decls -Wmissing-field-initializers -Wextra -Wformat=2 -Wno-format-nonliteral -Wpointer-arith -Wno-missing-braces --std=gnu99 -g3 -Wmissing-declarations -Iinclude -fPIC
BUILD_DIR:=build/usr/lib/rpcd
SHARED_DIR:=build/usr/share/macdb/
BIN_DIR:=build/bin/
SHARED_OBJECT:=$(BUILD_DIR)/juci-macdb.so
DATABASE:=$(SHARED_DIR)/db.txt
SOURCE_FILES:=$(wildcard src/*.c)
OBJECT_FILES:=$(patsubst %.c, %.o, $(SOURCE_FILES))

all: $(BUILD_DIR) $(SHARED_DIR) $(BIN_DIR) $(SHARED_OBJECT)

$(BUILD_DIR) $(SHARED_DIR) $(BIN_DIR): 
	mkdir -p $@

$(SHARED_OBJECT): $(OBJECT_FILES)
	$(CC) $(LDFLAGS) -Wl,-z,defs -shared -o $(SHARED_OBJECT) $(OBJECT_FILES) -lubox -lubus -luci
	cp -Rp files/macdb.txt $(SHARED_DIR)/db.txt
	cp -Rp files/maclookup $(BIN_DIR)
	
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean: ;
