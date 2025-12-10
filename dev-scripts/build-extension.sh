#!/usr/bin/bash

rm -rf scripts/ package.zip

if tsc; then

    mkdir -p scripts/altcha
    cp -r node_modules/altcha/dist_external scripts/altcha/
    cp node_modules/altcha/* scripts/altcha/

    mkdir -p scripts/indexeddb-promise
    cp node_modules/@coderundebug/indexeddb-promise/* scripts/indexeddb-promise

    zip -r package.zip icons/ pages/ scripts/ styles/ manifest.json

else

    echo "tsc failed, package not built"

fi 
