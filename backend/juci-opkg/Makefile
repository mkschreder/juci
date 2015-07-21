CFLAGS+=-Os -Wall -Wno-format-y2k -W -Wstrict-prototypes -Wmissing-prototypes -Wpointer-arith -Wreturn-type -Wcast-qual -Wwrite-strings -Wswitch -Wshadow -Wcast-align -Wchar-subscripts -Winline -Wnested-externs -Wredundant-decls -Wmissing-field-initializers -Wextra -Wformat=2 -Wno-format-nonliteral -Wpointer-arith -Wno-missing-braces --std=gnu99 -g3 -Wmissing-declarations -Iinclude
SHARED_OBJECT:=juci-opkg-plugin.so
SOURCE_FILES:=$(wildcard src/*.c)
OBJECT_FILES:=$(patsubst %.c, %.o, $(SOURCE_FILES))

all: $(SHARED_OBJECT)

$(SHARED_OBJECT): $(OBJECT_FILES)
	gcc $(CFLAGS) -o $(SHARED_OBJECT) $(OBJECT_FILES) 
	
$(OBJECT_FILES): $(SOURCE_FILES)
	gcc $(CFLAGS) -o $@ $<

clean: ;
