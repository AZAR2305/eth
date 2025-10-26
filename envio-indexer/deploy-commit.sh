#!/bin/bash

# Git commit and push script for Envio deployment

cd /mnt/c/Users/thame/eth

echo "📝 Staging changes..."
git add envio-indexer/config.yaml
git add envio-indexer/schema.graphql
git add envio-indexer/abis/
git add envio-indexer/package.json
git add envio-indexer/src/EventHandlers.ts
git add envio-indexer/.gitignore
git add envio-indexer/generated/.gitignore

echo "💾 Committing..."
git commit -m "Fix Envio cloud deployment: update RPC, clean schema, add ABIs"

echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Changes pushed!"
echo ""
echo "Now deploy on Envio Cloud:"
echo "1. Go to https://envio.dev/app/"
echo "2. Click 'New Indexer' or 'Redeploy'"
echo "3. Select repository: AZAR2305/eth"
echo "4. Select folder: envio-indexer"
echo "5. Click 'Deploy'"
