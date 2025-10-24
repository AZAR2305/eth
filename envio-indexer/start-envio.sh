#!/bin/bash
# Envio Setup Script for WSL
# Run this in WSL: bash start-envio.sh

set -e  # Exit on error

echo "🚀 Starting Envio Indexer Setup..."

# Step 1: Clean up
echo ""
echo "1️⃣ Cleaning up old containers..."
cd /mnt/c/Users/thame/eth/envio-indexer
docker-compose down -v 2>/dev/null || true
docker rm -f envio-postgres envio-hasura 2>/dev/null || true

# Step 2: Start Docker services
echo ""
echo "2️⃣ Starting PostgreSQL and Hasura..."
docker-compose -f docker-compose-simple.yml up -d

# Step 3: Wait for services
echo ""
echo "3️⃣ Waiting for services to be ready..."
echo "   Waiting for PostgreSQL..."
sleep 5
until docker exec envio-postgres pg_isready -U postgres >/dev/null 2>&1; do
  echo "   PostgreSQL not ready yet..."
  sleep 2
done
echo "   ✅ PostgreSQL is ready!"

echo "   Waiting for Hasura..."
sleep 5
until curl -s http://localhost:8081/healthz >/dev/null 2>&1; do
  echo "   Hasura not ready yet..."
  sleep 2
done
echo "   ✅ Hasura is ready!"

# Step 4: Run migrations
echo ""
echo "4️⃣ Running database migrations..."
cd generated
pnpm run db-setup || echo "⚠️  Migrations may have failed, continuing..."
cd ..

# Step 5: Start indexer
echo ""
echo "5️⃣ Starting Envio indexer..."
echo ""
echo "📊 Hasura Console: http://localhost:8081 (password: testing)"
echo "🔗 GraphQL Endpoint: http://localhost:8081/v1/graphql"
echo ""

export TUI_OFF=true
pnpm exec envio start
