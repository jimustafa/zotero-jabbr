VERSION := 0.1.0

.PHONY: default
default: | ./build
	cd src && zip -r - . > ../build/zotero-jabbr-$(VERSION).xpi

./build:
	mkdir -p ./build

clean:
	rm -rf ./build
