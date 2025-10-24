#!/bin/bash
# Install npm-run-all globally to make it available for build scripts
npm install -g npm-run-all

# Install all dependencies
npm install

# Build the application
npm run build

echo "Build completed successfully!"
