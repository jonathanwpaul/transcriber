#!/bin/bash
# npx cap add android
npm run build
npx cap sync
npx cap run android