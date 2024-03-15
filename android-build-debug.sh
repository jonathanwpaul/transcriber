#!/bin/bash
# if android hasn't been added to project yet
npx cap add android 2>/dev/null
#npm run build
#px cap sync
cd android && ./gradlew assembleDebug
cd .. && mkdir -p "dist" && cp android/app/build/outputs/apk/debug/app-debug.apk dist/app-debug.apk
echo "wrote debug apk to dist/app-debug.apk"