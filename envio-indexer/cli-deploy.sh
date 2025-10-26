#!/bin/bash

# CLI Deployment Script for Envio Cloud
# Use this as an alternative to web dashboard

cd /mnt/c/Users/thame/eth/envio-indexer

echo "🔑 Setting up API token..."
export ENVIO_API_TOKEN="ac3f7148-2a59-4bc1-866f-936d1e9a2b98"

echo "✅ Validating configuration..."
pnpm exec envio codegen

if [ $? -ne 0 ]; then
    echo "❌ Codegen failed. Fix errors above before deploying."
    exit 1
fi

echo ""
echo "🚀 Deploying to Envio Cloud..."
pnpm exec envio deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Check your indexer at: https://envio.dev/app/"
