VERSION := 0.2.1

.PHONY: default
default: | ./build
	cd src && zip -r - . > ../build/zotero-jabbr-$(VERSION).xpi

./build:
	mkdir -p ./build

clean:
	rm -rf ./build
