#!/usr/bin/bash

rm -r scripts/ package.zip

tsc

mkdir -p scripts/altcha
cp -r node_modules/altcha/dist_external scripts/altcha/
zip -r package.zip icons/ pages/ scripts/ styles/ manifest.json
