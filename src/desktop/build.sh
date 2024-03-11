#!/bin/bash
cd /offline/src/desktop
rm -rf app_dist
cd ../app/client
yarn install
npm install @angular/cli
yarn add moment
npm run prod-desktop
cd ..
yarn install
npm run  resource-bundles
cd ../desktop/OpenRAP
yarn install
npm run pack
cd ..
yarn --update-checksums
yarn install
yarn add @types/yargs
npm run build-ts
node scripts/copy.js

# Tar the generic build files
tar -czvf app_dist.tar.gz app_dist
