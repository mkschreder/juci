CFLAGS+=-Os -Wall -Wno-format-y2k -W -Wstrict-prototypes -Wmissing-prototypes -Wpointer-arith -Wreturn-type -Wcast-qual -Wwrite-strings -Wswitch -Wshadow -Wcast-align -Wchar-subscripts -Winline -Wnested-externs -Wredundant-decls -Wmissing-field-initializers -Wextra -Wformat=2 -Wno-format-nonliteral -Wpointer-arith -Wno-missing-braces --std=gnu99 -g3 -Wmissing-declarations -Iinclude
BUILD_DIR:=build/sbin/
TARGET:=$(BUILD_DIR)/igmpinfo
SOURCE_FILES:=$(wildcard src/*.c)
OBJECT_FILES:=$(patsubst %.c, %.o, $(SOURCE_FILES))

all: $(BUILD_DIR) $(TARGET)

$(BUILD_DIR): 
	mkdir -p $@
	
$(TARGET): $(OBJECT_FILES)
	$(CC) $(LDFLAGS) -o $(TARGET) $(OBJECT_FILES)
	
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean: ;
