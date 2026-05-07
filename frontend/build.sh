#!/bin/bash
# Fix permissions and build
npm install
chmod +x node_modules/.bin/* || true
npm run build
