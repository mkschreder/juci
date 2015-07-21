CFLAGS+=-Os -Wall -Wno-format-y2k -W -Wstrict-prototypes -Wmissing-prototypes -Wpointer-arith -Wreturn-type -Wcast-qual -Wwrite-strings -Wswitch -Wshadow -Wcast-align -Wchar-subscripts -Winline -Wnested-externs -Wredundant-decls -Wmissing-field-initializers -Wextra -Wformat=2 -Wno-format-nonliteral -Wpointer-arith -Wno-missing-braces --std=gnu99 -g3 -Wmissing-declarations -Iinclude -fPIC
BUILD_DIR:=build/usr/lib/rpcd
SHARED_OBJECT:=$(BUILD_DIR)/juci-broadcom-wireless.so
SOURCE_FILES:=$(wildcard src/*.c)
OBJECT_FILES:=$(patsubst %.c, %.o, $(SOURCE_FILES))

all: $(BUILD_DIR) $(SHARED_OBJECT)

$(BUILD_DIR): 
	mkdir -p $@
	
$(SHARED_OBJECT): $(OBJECT_FILES)
	$(CC) $(LDFLAGS) -shared -o $(SHARED_OBJECT) $(OBJECT_FILES) 
	
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean: ;
