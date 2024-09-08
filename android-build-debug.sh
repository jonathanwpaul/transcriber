#!/bin/bash
npm install
npx cap add android 2>/dev/null
npm run build
npx cap sync