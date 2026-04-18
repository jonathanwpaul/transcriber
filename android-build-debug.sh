#!/bin/bash
pnpm install
pnpm run build
# Update the already-checked-in Android project with latest web build
npx cap sync android
