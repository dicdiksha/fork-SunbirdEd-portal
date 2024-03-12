#!/bin/bash
# Install python
apt update && apt install -y python3.7 build-essential git

export PYTHON=/usr/bin/python3.7

npm install typescript@4.6.4 -g
npm install fs-extra@11.1.1 -g

cd /offline/src/desktop
rm -rf app_dist
cd ../app/client
yarn install --force
npm install angular@14.2.10
npm run prod-desktop
cd ..
yarn cache clean --all && yarn install --force
yarn add properties
npm run  resource-bundles
cd ../desktop/OpenRAP
yarn install
npm run pack
cd ..
yarn --update-checksums
yarn install
npm run build-ts
node scripts/copy.js

# Tar the generic build files
tar -czvf app_dist.tar.gz app_dist
