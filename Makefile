BIN := ./node_modules/.bin

all: clean build

clean:
	rm -rf ./build

build-cjs:
	$(BIN)/swc ./src -C module.type=commonjs -d ./build/cjs
	echo '{"type":"commonjs"}' > ./build/cjs/package.json

build-esm:
	$(BIN)/swc ./src -C module.type=es6 -d ./build/esm
	$(BIN)/tsc-alias -f --dir ./build/esm
	echo '{"type":"module"}' > ./build/esm/package.json

build: clean build-cjs build-esm
	$(BIN)/dts-bundle-generator ./src/index.ts --silent -o ./build/index.d.ts

.PHONY: clean