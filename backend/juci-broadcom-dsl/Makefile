CFLAGS+=-fPIC
BUILD_DIR:=build/usr/lib/rpcd
SHARED_OBJECT:=$(BUILD_DIR)/juci-broadcom-dsl.so
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
