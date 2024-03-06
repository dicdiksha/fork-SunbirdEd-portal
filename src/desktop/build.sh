#!/bin/bash
cd /offline/src/desktop
rm -rf app_dist
cd ../app/client

npm install --ignore-engines
npm install @angular/cli@9.0.4
npm run prod-desktop
npm install @angular/cli@9.0.4
npm install --save @types/lodash@4.14.74
cd ..
npm install
npm run  resource-bundles
cd ../desktop/OpenRAP
npm install
npm run pack 

cd ..
npm --update-checksums
npm install fs-extra
npm install
npm install fs-extra
npm run build-ts
node scripts/copy.js
npm install fs-extra


# Tar the generic build files
tar -czvf app_dist.tar.gz app_dist