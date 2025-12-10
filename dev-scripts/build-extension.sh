#!/usr/bin/bash

rm -rf scripts/ package.zip

if tsc; then

    mkdir -p scripts/altcha
    cp -r node_modules/altcha/dist_external scripts/altcha/
    cp node_modules/altcha/* scripts/altcha/

    mkdir -p scripts/idb
    cp node_modules/idb/build/* scripts/idb/

    zip -r package.zip icons/ pages/ scripts/ styles/ manifest.json

else

    echo "tsc failed, package not built"

fi 
