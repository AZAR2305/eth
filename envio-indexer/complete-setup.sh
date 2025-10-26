#!/bin/bash

# Complete Envio Setup for v2.31
# This script handles the workspace dependency installation correctly

cd /mnt/c/Users/thame/eth/envio-indexer

echo "🧹 Cleaning old files..."
rm -rf node_modules generated/lib lib
rm -f pnpm-lock.yaml

echo "📦 Installing root dependencies..."
pnpm install

echo "🔧 Installing workspace dependencies..."
pnpm install -r --no-frozen-lockfile

echo "🔨 Building ReScript in generated folder..."
cd generated
pnpm exec rescript clean
pnpm exec rescript build
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Verify installation:"
echo "  ls -la node_modules/postgres"
echo ""
echo "Start Envio:"
echo "  envio dev"
