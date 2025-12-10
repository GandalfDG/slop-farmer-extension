#!/usr/bin/bash

rm -r scripts/ package.zip

tsc

mkdir -p scripts/altcha
cp -r node_modules/altcha/dist_external scripts/altcha/

mkdir -p scripts/indexeddb-promise
cp node_modules/@coderundebug/indexeddb-promise/* scripts/indexeddb-promise

zip -r package.zip icons/ pages/ scripts/ styles/ manifest.json
