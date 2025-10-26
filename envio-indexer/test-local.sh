#!/bin/bash

# Test Envio Locally Before Cloud Deployment

cd /mnt/c/Users/thame/eth/envio-indexer

echo "🐳 Starting PostgreSQL and Hasura..."
docker-compose -f docker-compose-simple.yml up -d

echo "⏳ Waiting for services (30 seconds)..."
sleep 30

echo "🔨 Running codegen..."
pnpm exec envio codegen

if [ $? -ne 0 ]; then
    echo "❌ Codegen failed!"
    exit 1
fi

echo "✅ Codegen successful!"
echo ""
echo "🚀 Starting local indexer..."
echo "This will index from block 7365000..."
echo ""

pnpm exec envio dev

# Or use without TUI:
# TUI_OFF=true pnpm exec envio dev
