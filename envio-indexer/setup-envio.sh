#!/bin/bash

# Envio Setup Script for Version 2.31
# Run this in WSL terminal

echo "🚀 Setting up Envio indexer..."

# Navigate to envio-indexer
cd /mnt/c/Users/thame/eth/envio-indexer

echo "📦 Installing dependencies in generated folder..."
cd generated
pnpm install

echo "🔨 Building ReScript files..."
pnpm exec rescript clean
pnpm exec rescript build

echo "✅ Setup complete!"
echo ""
echo "Now you can run:"
echo "  cd /mnt/c/Users/thame/eth/envio-indexer"
echo "  envio dev"
