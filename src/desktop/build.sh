#!/bin/bash
cd /offline/src/desktop
rm -rf app_dist
cd ../app/client
yarn install --ignore-engines
npm install -g @angular/cli
npm run prod-desktop
cd ..
yarn install --ignore-engines
npm run  resource-bundles
cd ../desktop/OpenRAP
yarn install --ignore-engines
npm run pack
cd ..
yarn --update-checksums
yarn install --ignore-engines
npm run build-ts
npm install --save @types/yargs
node scripts/copy.js

# Tar the generic build files
tar -czvf app_dist.tar.gz app_dist
