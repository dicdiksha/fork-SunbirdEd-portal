#!/bin/bash
cd /offline/src/desktop
rm -rf app_dist
cd ../app/client
npm install --ignore-engines
npm install -g @angular/cli
npm install --save moment
npm run prod-desktop
cd ..
npm install --ignore-engines
npm run  resource-bundles
cd ../desktop/OpenRAP
npm install --ignore-engines
npm run pack
cd ..
npm --update-checksums
npm cache clean
npm install --ignore-engines
npm install --save @types/yargs
npm run build-ts
node scripts/copy.js

# Tar the generic build files
tar -czvf app_dist.tar.gz app_dist
